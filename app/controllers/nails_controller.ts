import type { HttpContext } from '@adonisjs/core/http'
import Application from '@adonisjs/core/services/app'
import { inject } from '@adonisjs/core'
import { cuid } from '@adonisjs/core/helpers'
import NailService from '#services/nail_service'
import { extractNailAll, removeBg } from '#services/nailPipeline'
import fs from 'fs/promises'
import { existsSync } from 'node:fs'
import slugify from 'slugify'
import { getPathImageUpload } from '#helpers/index'
import { uploadImage, removeImageStorage } from '#services/supabase'

import NailCate from '#models/nail_cate'
import NailCollection from '#models/nail_collection'
import Nail from '#models/nail'

@inject()
export default class NailsController {
  constructor(protected nailService: NailService) {}

  /**
   * Hiển thị danh sách (Index)
   */
  async index({ inertia, request }: HttpContext) {
    const collectionId = request.input('collection', null)
    let nails: Nail[] = []

    if (collectionId)
      nails = await Nail
        .query()
        .leftJoin('nail_cates', 'nail_nails.cate', '=', 'nail_cates.id')
        .leftJoin('nail_collections', 'nail_nails.collection', '=', 'nail_collections.id')
        .where('collection', collectionId)
        .select('nail_nails.*', 'nail_cates.name as cate_name', 'nail_collections.name as collection_name')
    else
      nails = await Nail
        .query()
        .leftJoin('nail_cates', 'nail_nails.cate', '=', 'nail_cates.id')
        .leftJoin('nail_collections', 'nail_nails.collection', '=', 'nail_collections.id')
        .select('nail_nails.*', 'nail_cates.name as cate_name', 'nail_collections.name as collection_name')

    nails.map(item => ({
      ...item,
      cate_name: item.$extras.cate_name,
      collection_name: item.$extras.collection_name
    }))

    const config = {
      URL_STATIC_UPLOAD: (process.env?.NODE_ENV != 'development' ? process.env.SUPABASE_URL_STATIC_UPLOAD : process.env.LOCAL_URL_STATIC_UPLOAD),
    }

    return inertia.render('nails/index', { nails, config })
  }

  /**
   * Hiển thị form tạo mới (Create)
   */
  async edit({ inertia, request }: HttpContext) {
    // const NAIL_CATEGORIES = [
    //   { id: 'gel-polish', name: 'Sơn Gel Cơ Bản' },
    //   { id: 'gel-cat-eye', name: 'Sơn Gel Mắt Mèo' },
    //   { id: 'gel-stone', name: 'Sơn Gel Đính Đá' },
    //   { id: 'press-on-long', name: 'Móng Úp Dáng Dài' },
    //   { id: 'press-on-short', name: 'Móng Úp Dáng Ngắn' },
    //   { id: 'press-on-coffin', name: 'Móng Úp Coffin' },
    //   { id: 'dual-form', name: 'Dual Form' },
    //   { id: 'cung-mong-tao-cau', name: 'Cứng Móng Tạo Cầu' },
    //   { id: 'ombre-design', name: 'Thiết Kế Ombre' },
    //   // ... thêm hàng trăm loại khác ở đây
    // ];
    let nail: Nail | null = null;
    let collection: NailCollection | null = null;
    const collectionId = request.input('collection', null);
    const nailId = request.input('id', null);
    const [nailCates, nailCollections] = await Promise.all([
      NailCate
        .query().where('status', 1)
        .select('id', 'name'),

      NailCollection
        .query().where('status', 1)
        .select('id', 'name')
    ])

    if (collectionId)
      collection = await NailCollection.findBy('id', collectionId);

    if (nailId)
      nail = await Nail.findBy('id', nailId)

    return inertia.render('nails/manage', { nailCates: nailCates, nailCollections, collection, nail, pathUpload: getPathImageUpload() })
  }

  async store3({ request, response, session }: HttpContext) {
    const croppedImage = request.file('nail_image', {
      size: '2mb',
      extnames: ['png'],
    })

    if (!croppedImage) {
      session.flash('error', 'Không tìm thấy ảnh đã crop.')
      return response.redirect().back()
    }

    // 2. Kiểm tra nguồn ảnh gốc
    const sourceType = request.input('source_type')
    let sourcePath = ''

    if (sourceType === 'upload') {
      // Trường hợp A: Xử lý file gốc upload mới (nail_image_raw)
      const rawImage = request.file('nail_image_raw')
      if (rawImage) {
        // Lưu ảnh gốc vào disk
        const fileName = `${cuid()}_raw.${rawImage.extname}`
        await rawImage.move(Application.tmpPath('uploads'), { name: fileName })
        sourcePath = `uploads/${fileName}`
      }
    } else {
      // Trường hợp B: Lấy URL ảnh nguồn đã có sẵn (source_image_url)
      sourcePath = request.input('source_image_url')
    }


  }

  async store({ request, response, session }: HttpContext) {
    // 1. Luôn nhận file đã crop (nail_image)
    // console.log('All Files:', request.allFiles())
    // console.log('All Input:', request.all())

    const useAI = request.input('useAi');
    const errors: any = []
    const payload = request.only(['id', 'name', 'cate', 'collection', 'status'])
    let croppedImage: any = null

    if (!payload['id']) {
      croppedImage = request.file('nail_image', {
        size: '2mb',
        extnames: ['png'],
      }) || null

      if (!croppedImage) {
        session.flash('error', 'Không tìm thấy ảnh đã crop.')
        return response.redirect().back()
      }
    }

    // 2. Kiểm tra nguồn ảnh gốc
    // const sourceType = request.input('source_type')
    // let sourcePath = ''

    // if (sourceType === 'upload') {
    //   // Trường hợp A: Xử lý file gốc upload mới (nail_image_raw)
    //   const rawImage = request.file('nail_image_raw')
    //   if (rawImage) {
    //     // Lưu ảnh gốc vào disk
    //     const fileName = `${cuid()}_raw.${rawImage.extname}`
    //     await rawImage.move(Application.tmpPath('uploads'), { name: fileName })
    //     sourcePath = `uploads/${fileName}`
    //   }
    // } else {
    //   // Trường hợp B: Lấy URL ảnh nguồn đã có sẵn (source_image_url)
    //   sourcePath = request.input('source_image_url')
    // }

    // 3. Lưu ảnh đã crop (để hiển thị trên móng tay AR)
    // const croppedFileName = `${cuid()}_cropped.png`
    // await croppedImage.move(Application.disk('s3').tmpPath('nails'), { name: croppedFileName })

    const fileName = `${Date.now()}.${croppedImage?.extname}`
    // const filePath = path.join('tmp', fileName)
    const nailName = payload['name'] ? slugify(payload['name'].toLowerCase().replace(/\s+/g, '-'), {
      lower: true,
      strict: true,
      locale: 'vi'
    }) : '';

    // await croppedImage?.move('tmp', {
    //   name: fileName,
    // })

    try {

      if (croppedImage) { //console.log('Go'); return {};
        let result: any = null
        // const uploadInfo: any = null
        try {

          if (!croppedImage?.tmpPath) {
            errors.push('Không tìm thấy ảnh đã crop')
            throw new Error('tmpPath is undefined')
          }

          const imageBuffer = await fs.readFile(croppedImage.tmpPath)

          // Gọi service xử lý
          // const imageUrl = await this.nailService.processAndSaveArImage(filePath!)

          if (JSON.parse(useAI)) {
            // process all (remove background + AI extract nail)
            result = await extractNailAll(imageBuffer)
          } else {
            // remove background
            result = await removeBg(imageBuffer)
          }

          fs.unlink(croppedImage.tmpPath);

          // return response.ok({
          //   img: result.toString('base64')
          // })

        } catch (error) {

          errors.push('Tạo ảnh móng thất bại')
          throw(error)
        }

        let base64Image = result.toString('base64').split(';base64,').pop();
        let pathImageUpload: string

        if (result) {
          if (!process.env.NODE_ENV || process.env.NODE_ENV != 'development') {
            const uploadInfo = await uploadImage(result, 'nails', 'webp')
            pathImageUpload = uploadInfo.path;
          } else {
            pathImageUpload = `public/images/nails/nail-${nailName}-${cuid()}.webp`;
            fs.writeFile(`./${pathImageUpload}`, base64Image, {encoding: 'base64'});
          }

          if (base64Image) {

            // Lưu vào DB (Giả định bạn có Model Nail)
            await Nail.create({ ...payload, img: pathImageUpload })

            session.flash({ success: 'Đã lưu kiểu móng mới.', flash_id: Date.now() })
            // return response.redirect('/admin/nails')
    
          } else
            errors.push('Tạo dữ liệu kiểu móng thất bại')
        }
      } else {
        session.flash('success', 'Dữ liệu lưu thành công!')

        await Nail.updateOrCreate({ id: payload['id']}, payload )
        return response.redirect().toRoute('nail.list')
      }

      if (errors.length > 0) {
        // Gửi nguyên mảng lỗi vào session
        session.flash('error', errors)
        session.flash('flash_id', Date.now())

        return response.redirect().back()

      } else {

        return response.redirect().back()
      }
    } catch (error) {

      // console.log(error)

      errors.push('Hệ thống không thể thao tác, vui lòng liên hệ với Admin quản trị!')

      // Gửi nguyên mảng lỗi vào session
      session.flash('error', errors) 
      session.flash('flash_id', Date.now())

      return response.redirect().back()
    }
  }

  /**
   * Xử lý lưu dữ liệu (Store)
   */
  async store1({ request, response, session }: HttpContext) {
    // 1. Lấy dữ liệu từ form
    const data = request.all()
    
    // 2. Logic lưu database (Ví dụ: await Booking.create(data))
    // console.log('Dữ liệu nhận được:', data)

    const imageFile = request.file('nail_image', {
      size: '5mb',
      extnames: ['jpg', 'png', 'jpeg'],
    })

    if (!imageFile || !imageFile.isValid) {
      return response.badRequest('File không hợp lệ')
    }

    try {
      // Gọi service xử lý
      // const imageUrl = await this.nailService.processAndSaveArImage(imageFile.tmpPath!)
      // Lưu vào DB (Giả định bạn có Model NailStyle)
      // await NailStyle.create({ name: request.input('name'), image: imageUrl })

      // return response.ok({ url: imageUrl })
    } catch (error: any) {
      return response.internalServerError('Lỗi xử lý AI: ' + error.message)
    }

    // 3. Thông báo và điều hướng
    session.flash('success', 'Tạo kiểu Nail thành công!')
    return response.redirect().toPath('/admin/nails')
  }

  async delete({ session, request, response }: HttpContext) {
    const params = request.only(['id']);
    const errors: any = []

    try {
      const nail = await Nail.findBy('id', params['id'])

      if (!nail) errors.push('Không tìm thấy kiểu móng')
      else {
        const imgPath = `./${nail.img}`;

        await nail.delete();

        if (existsSync(imgPath))
          fs.unlink(imgPath);

        session.flash({ success: 'Đã xoá thành công.', flash_id: Date.now() })
      }

      if (errors.length > 0) {
        // Gửi nguyên mảng lỗi vào session
        session.flash('error', errors)
        session.flash('flash_id', Date.now())

        return response.redirect().back()
      } 

      return response.redirect().toRoute('nails.list')

    } catch (error) {
      errors.push('Hệ thống không thể thao tác, vui lòng liên hệ với Admin quản trị!')

      // Gửi nguyên mảng lỗi vào session
      session.flash('error', errors) 
      session.flash('flash_id', Date.now())

      return response.redirect().back()
    }
  }

  async list({ request, response }: HttpContext) {
    const keyword = request.input('collection', null);

    if (keyword) {
      try {
        const nails = await Nail
          .query()
          .leftJoin('nail_collections', 'nail_nails.collection', '=', 'nail_collections.id')
          .where('nail_collections.tag', keyword)
          .where('nail_nails.status', 1)
          .orderBy('name', 'asc')
          .select('nail_nails.*')

        return response.status(200).send({
          data: nails || []
        });
      } catch (error) {
        return response.status(200).send({
          data: []
        });
      }
    }
  }
}