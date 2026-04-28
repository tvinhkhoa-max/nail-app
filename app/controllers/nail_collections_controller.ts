// app/controllers/nail_styles_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import NailCate from '#models/nail_cate'
import NailCollection from '#models/nail_collection'
import NailService from '#services/nail_service'
import path from 'path'
import fs from 'fs/promises'
import { existsSync } from 'node:fs'
import { uploadImage, removeImageStorage } from '#services/supabase'
import { getPathImageUpload } from '#helpers/index'

@inject()
export default class NailCollectionsController {
  constructor(protected nailService: NailService) {}

  async index({ inertia }: HttpContext) {
    // Inertia sẽ tự động tìm trong resources/js/pages/
    // const nailcollections = await NailCollection.all() || [];

    const nailcollections = await NailCollection
      .query()
      .leftJoin('nail_cates', 'nail_collections.cate', '=', 'nail_cates.id')
      .select('nail_collections.*', 'nail_cates.name as cate_name')

    nailcollections.map(item => ({
      ...item,
      cate_name: item.$extras.cate_name,
    }))

    const config = {
      URL_STATIC_UPLOAD: (process.env?.NODE_ENV != 'development' ? process.env.SUPABASE_URL_STATIC_UPLOAD : process.env.LOCAL_URL_STATIC_UPLOAD),
    }

    return inertia.render('nail-collections/index', { nailCollections: nailcollections, config })
  }

  /**
   * (Create or Edit)
   */
  async edit({ inertia, request }: HttpContext) {
    const collectionId = request.input('id', null)
    const nailCates = await NailCate
      .query()
      .where('status', 1);

    let nailCollection = null

    if (collectionId) {
      nailCollection = await NailCollection.findBy('id', collectionId)
    }

    return inertia.render('nail-collections/input', { nailCates, collection: nailCollection })
  }
  
  async store({ request, response, session }: HttpContext) {
    const errors = []
    let data = {}
    // const imageFile = request.file('nail_image', {
    //   size: '5mb',
    //   extnames: ['jpg', 'png', 'jpeg'],
    // })

    // if (!imageFile || !imageFile.isValid) {
    //   return response.badRequest('File không hợp lệ')
    // }
    
    // 1. Lấy dữ liệu từ form
    const input = request.all()
    
    // 2. Logic lưu database (Ví dụ: await Booking.create(data))
    // console.log('Dữ liệu nhận được:', input)

    try {
      const image = request.file('img', {
        size: '5mb',
        extnames: ['jpg', 'png', 'jpeg'],
      }) || null;

      if (!image && !input.id) {
        // return response.badRequest({ errors: ['No image'] })
        errors.push('Vui lòng chọn ảnh đại diện cho bộ sưu tập')
      }

      if (errors.length > 0) {
        // Gửi nguyên mảng lỗi vào session
        session.flash('error', errors)
        session.flash('flash_id', Date.now())

        return response.redirect().back()
      } else
        data = input

      if (!image?.tmpPath) {
        errors.push('Không tìm thấy ảnh đã crop')

        throw new Error('tmpPath is undefined')
      }

      let pathImageUpload: string

      if (image) {
        if (!process.env.NODE_ENV || process.env.NODE_ENV != 'development') {
          let buffer: Buffer | null = await fs.readFile(image.tmpPath);
          const uploadInfo = await uploadImage(buffer, 'collections');

          pathImageUpload = uploadInfo.path;
          buffer = null
          console.log(uploadInfo)
        } else {

          const fileName = `${crypto.randomUUID()}.${image?.extname}`
          const defaultPath = 'public/images/collections'
          const pathUpload = path.join('./', defaultPath)
          pathImageUpload = path.join(defaultPath, fileName)

          await image?.move(pathUpload, {
            name: fileName,
          })
        }

        data = { ...data, img: pathImageUpload}
      }

      // Lưu vào DB 
      const result = await NailCollection.updateOrCreate({id: input.id}, data )

      session.flash('success', 'Dữ liệu lưu thành công!')

      // 3. Thông báo và điều hướng
      if (!input.id) {
        return response.redirect().toPath(`/admin/nails?collection=${result.id}`)
      }

      return response.redirect().toRoute('nail-collection.list', { id: input.id })

    } catch (error) {
      console.log(error)
      errors.push('Hệ thống không thể thao tác, vui lòng liên hệ với Admin quản trị!')

      // Gửi nguyên mảng lỗi vào session
      session.flash('error', errors) 
      session.flash('flash_id', Date.now())

      if (input.id) {
        return response.redirect().toPath(`/admin/nails?collection=${input.id}`)
      }

      return response.redirect().back()
    }
  }

  async delete({ request, response, session }: HttpContext) {
    // removeImageStorage
    const params = request.only(['id']);
    const errors: any = []

    try {
      const collection = await NailCollection.findBy('id', params['id'])

      if (!collection) errors.push('Không tìm thấy kiểu móng')
      else {
        const imgPath = `./${collection.img}`;

        await collection.delete();

        if (!process.env.NODE_ENV || process.env.NODE_ENV != 'development') {
          await removeImageStorage(collection.img)
        } else {
          if (existsSync(imgPath))
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

      return response.redirect().toRoute('nail-collection.list')

    } catch (error) {
      errors.push('Hệ thống không thể thao tác, vui lòng liên hệ với Admin quản trị!')

      // Gửi nguyên mảng lỗi vào session
      session.flash('error', errors) 
      session.flash('flash_id', Date.now())

      return response.redirect().back()
    }
  }

  async list({ request, response }: HttpContext) {
    const params = request.params();

    try {
      const collections = await NailCollection.query()
        .where('nail_collections.status', 1)
        .if(params['q'], (query) => {
          query.leftJoin('nail_cates', 'nail_cates.id', '=', 'nail_collections.cate')
          query.where('nail_cates.id', params['q'])
          query.orWhere('nail_cates.tag', params['q'])
        })
        // .orderBy('nail_collections.createdAt')
        .exec() || [];

      response.status(201).send({
        data: collections
      });
    } catch (error) {
      console.log(error)
      response.status(201).send({
        data: []
      });
    }
  }

  async search({ request, response }: HttpContext) {
    const cateId = request.input('category', null)

    try {
      const result = await NailCollection
        .query()
        .join('nail_cates', 'nail_cates.id', '=', 'nail_collections.cate')
        .where('nail_cates.id', cateId)
        .orWhere('nail_cates.tag', cateId)

      response.status(201).send({
        data: result
      });
    } catch(error) {
      console.log(error)
      response.status(201).send({
        data: []
      });
    }
  }
}