import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import { cuid } from '@adonisjs/core/helpers'
import fs from 'fs/promises'
import  * as fileSystem from 'node:fs'
// import { existsSync } from 'node:fs'
import slugify from 'slugify'
import { extractNailAll, removeBg, extractNailByPolygon } from '#services/nailPipeline'
import { getPathImageUpload } from '#helpers/index'
import { uploadImage, removeImageStorage } from '#services/supabase'
import axios from 'axios'
import FormData from 'form-data'

import { changeStatus } from '#helpers/index'
import NailCate from '#models/nail_cate'
import NailCollection from '#models/nail_collection'
import Nail from '#models/nail'

@inject()
export default class NailsController {

  /**
   * Hiển thị danh sách (Index)
   */
  async index({ inertia, request }: HttpContext) {
    const collectionId = request.input('collection', null)
    const page = request.input('page', 1)
    const limit = 10 // Số lượng bản ghi mỗi trang
    let paginateResult: any;

    if (collectionId)
      paginateResult = await Nail
        .query()
        .leftJoin('nail_cates', 'nail_nails.cate', '=', 'nail_cates.id')
        .leftJoin('nail_collections', 'nail_nails.collection', '=', 'nail_collections.id')
        .where('collection', collectionId)
        .select('nail_nails.*', 'nail_cates.name as cate_name', 'nail_collections.name as collection_name')
        .orderBy('nail_nails.created_at', 'desc')
        .paginate(page, limit);
    else
      paginateResult = await Nail
        .query()
        .leftJoin('nail_cates', 'nail_nails.cate', '=', 'nail_cates.id')
        .leftJoin('nail_collections', 'nail_nails.collection', '=', 'nail_collections.id')
        .select('nail_nails.*', 'nail_cates.name as cate_name', 'nail_collections.name as collection_name')
        .orderBy('nail_nails.created_at', 'desc')
        .paginate(page, limit);


    paginateResult.all().forEach((item: any) => {
      item.status_text = changeStatus(item.status as number) || 'Unknown'
    })
    const serializedData = paginateResult.toJSON();
    const config = {
      URL_STATIC_UPLOAD: (process.env?.APP_ENV != 'development' ? process.env.SUPABASE_URL_STATIC_UPLOAD : process.env.LOCAL_URL_STATIC_UPLOAD),
    }

    return inertia.render('nails/index', { nails: serializedData, config })
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

  async store({ request, response, session }: HttpContext) {
    // 1. Lấy các tham số điều hướng từ Client
    const { id, process_mode, use_ai, polygon_data, ...payload } = request.all()
    const _payload = request.only(['id', 'name', 'cate', 'collection', 'status']);
    const trx = await db.transaction();
    // console.log('All Files:', request.allFiles());
    // console.log(process_mode);
    // return {};

    try {
      const nailFile = request.file('nail_image')
      let finalBuffer: Buffer | null = null
      let pathImageUpload: string = '';


      // CHỈ XỬ LÝ NẾU CÓ FILE GỬI LÊN (CROP hoặc POLYGON)
      if (nailFile) {
        const sourceBuffer = await fs.readFile(nailFile.tmpPath!)

        if (process_mode === 'polygon') {
          console.log(nailFile);
          // Nhánh Polygon: Gửi Buffer ảnh (đã xoay sẵn từ Client) + tọa độ sang Python
          const points = JSON.parse(polygon_data);
          console.log(points);
          finalBuffer = await extractNailByPolygon(sourceBuffer, points)
        }  else if (process_mode === 'crop') {

          // Nhánh Crop hoặc None: File gửi lên đã là kết quả cuối hoặc ảnh gốc
          finalBuffer = sourceBuffer
          if (finalBuffer) {
            if (JSON.parse(use_ai)) {
              finalBuffer = await extractNailAll(finalBuffer) // AI tách móng + nền
            } else {
              finalBuffer = await removeBg(finalBuffer) // Chỉ xóa nền
            }
          }

        }
      }

      // 3. Lưu file vào ổ cứng/CDN
      if (finalBuffer) {
        const nailNameSlug = slugify(_payload.name || 'nail', { lower: true })
        const fileName = `nail-${nailNameSlug}-${cuid()}.webp`

        if (process.env.APP_ENV === 'production') {
          const uploadInfo = await uploadImage(finalBuffer, 'nails', 'webp')
          pathImageUpload = uploadInfo.path
        } else {
          pathImageUpload = `public/images/nails/${fileName}`
          await fs.writeFile(`./${pathImageUpload}`, finalBuffer)
        }
      }

      // 4. Cập nhật Database
      const dbData = { 
        ..._payload,
        ...(pathImageUpload && { img: pathImageUpload }) // Chỉ update field img nếu có ảnh mới
      }

      if (_payload['id'])
        await Nail.updateOrCreate({ id: id }, dbData, { client: trx })
      else
        await Nail.create(dbData, { client: trx })

      await trx.commit()
      session.flash('success', 'Đã lưu dữ liệu móng thành công!')
      return response.redirect().back()

    } catch (error) {
      await trx.rollback()
      console.error('Lỗi Server:', error)
      session.flash('error', 'Hệ thống gặp lỗi khi xử lý ảnh.')
      return response.redirect().back()
    }
  }

  /**
   * Xử lý lưu dữ liệu (Store)
   */
  async store1({ request, response, session }: HttpContext) {
    // 1. Lấy dữ liệu từ form
    // const data = request.all()
    
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
    const errors: any = [];
    const trx = await db.transaction();

    try {
      const nail = await Nail.findBy('id', params['id'], { client: trx })

      if (!nail) errors.push('Không tìm thấy kiểu móng')
      else {
        const imgPath = `./${nail.img}`;

        await nail?.useTransaction(trx).delete();
        await trx.commit()

        if (!process.env?.APP_ENV || process.env?.APP_ENV != 'development') {
          if (nail.img) removeImageStorage(nail.img);
        } else {
          if (fileSystem.existsSync(imgPath))
            fs.unlink(imgPath);
        }

        session.flash({ success: 'Đã xoá thành công.', flash_id: Date.now() })
      }

      if (errors.length > 0) {
        // Gửi nguyên mảng lỗi vào session
        session.flash('error', errors)
        session.flash('flash_id', Date.now())

        return response.redirect().back()
      } 

      return response.redirect().toRoute('admin.nails.list')

    } catch (error) {
      await trx.rollback();

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

  async segment({ request, response }: HttpContext) {
    const { points, mode } = request.all();
    const image = request.file('file');
    let buffer: any = null;

    if (!image) {
      return response.badRequest('No file')
    }

    if (image?.tmpPath) {
      buffer = await fs.readFile(image.tmpPath);
    }

    const aiRes = await fetch('http://localhost:8000/segment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        points,
        'mode': mode
      },
      body: buffer
    })

    const bufferRes = await aiRes.arrayBuffer()

    // response.header('Content-Type', 'image/png')

    // return response.send(Buffer.from(buffer))
    return response
      .header('Content-Type', 'image/png')
      .send(Buffer.from(bufferRes));
  }

  async point({ request, response }: HttpContext) {
    const { point, mode } = request.all();
    const image = request.file('file');
    if (!image || !image.tmpPath) {
      return response.badRequest('No file')
    }

    const form = new FormData()
    const readStream: any = fileSystem.createReadStream(image?.tmpPath);
    form.append('file', readStream)
    form.append('filename', image.clientName)
    form.append('contentType', image.headers['content-type'])

    // const aiRes = await fetch('http://localhost:8000/point', {
    //   method: 'POST',
    //   headers: {
    //     ...form.getHeaders(),
    //     'point': String(point),
    //     'mode': mode
    //   },
    //   body: form
    // })
    const pythonResponse = await axios.post('http://localhost:8000/point', form, {
      headers: {
        // Lúc này .getHeaders() sẽ tồn tại và trả về 'multipart/form-data; boundary=...'
        ...form.getHeaders(), 
        'point': String(point) || ''
      },
      responseType: 'arraybuffer'
    })
    return response.type('image/png').send(pythonResponse.data)
    // const bufferRes = await aiRes.arrayBuffer();
    // return response
    //   .header('Content-Type', 'image/png')
    //   .send(Buffer.from(bufferRes));

  }
}