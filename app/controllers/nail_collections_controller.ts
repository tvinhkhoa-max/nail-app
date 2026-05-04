// app/controllers/nail_styles_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import NailCate from '#models/nail_cate'
import NailCollection from '#models/nail_collection'
import path from 'path'
import fs from 'fs/promises'
import { existsSync } from 'node:fs'
import { uploadImage, removeImageStorage } from '#services/supabase'
import { validate as uuidValidate } from 'uuid';
import sharp from 'sharp';
import db from '@adonisjs/lucid/services/db'
import { inject } from '@adonisjs/core'

@inject()
export default class NailCollectionsController {
  // constructor(
  //   protected cateModel: typeof NailCate,
  //   protected collectionModel: typeof NailCollection,
  // ) {}

  async index({ inertia }: HttpContext) {

    const nailcollections = await NailCollection
      .query()
      .join('nail_cates', 'nail_collections.cate', '=', 'nail_cates.id')
      .orderBy('nail_collections.updated_at', 'desc')
      .select('nail_collections.*', 'nail_cates.name as cate_name')
      .exec();

    nailcollections.map(item => ({
      ...item,
      cate_name: item.$extras.cate_name,
    }))

    const config = {
      URL_STATIC_UPLOAD: (process.env?.APP_ENV != 'development' ? process.env.SUPABASE_URL_STATIC_UPLOAD : process.env.LOCAL_URL_STATIC_UPLOAD),
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

    const config = {
      URL_STATIC_UPLOAD: (process.env?.APP_ENV != 'development' ? process.env.SUPABASE_URL_STATIC_UPLOAD : process.env.LOCAL_URL_STATIC_UPLOAD),
    }

    return inertia.render('nail-collections/input', { nailCates, collection: nailCollection, config })
  }
  
  async store({ request, response, session }: HttpContext) {
    const errors = []
    let data = {}
    const trx = await db.transaction()
    
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

      let pathImageUpload: string

      if (image && image.tmpPath) {
        const watermarkPath = path.join(
          process.cwd(),
          'public/cdn/logo_nailsxanh.png'
        )
        if (!process.env.APP_ENV || process.env.APP_ENV != 'development') {
          let buffer: Buffer | null = await fs.readFile(image?.tmpPath);
          const watermark = await sharp(watermarkPath)
            .resize({ width: 180 })
            .png()
            .toBuffer()

          let imageBuff: any = await sharp(buffer)
            .composite([{
              input: watermark,
              gravity: 'southeast',
              blend: 'over',
            }])
            .webp({ quality: 100 })
            .toBuffer() || null;

          const uploadInfo = await uploadImage(imageBuff, 'collections');

          pathImageUpload = uploadInfo.path;
          buffer = null; imageBuff = null;

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
      const result = await NailCollection.updateOrCreate({id: input.id}, data, { client: trx } )

      session.flash('success', 'Dữ liệu lưu thành công!')

      await trx.commit();

      // 3. Thông báo và điều hướng
      if (!input.id) {
        return response.redirect().toPath(`/admin/nails?collection=${result.id}`)
      }

      return response.redirect().toRoute('nail-collection.list', { id: input.id })

    } catch (error) {
      await trx.rollback();

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
    const trx = await db.transaction()

    try {
      const collection = await NailCollection.findBy('id', params['id'], { client: trx })

      if (!collection) {
        await trx.rollback()
        errors.push('Không tìm thấy kiểu móng')

        return response.redirect().back()
      }
      else {
        const imgPath = `./${collection.img}`;

        await collection?.useTransaction(trx).delete();

        await trx.commit()

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
      await trx.rollback()

      errors.push('Hệ thống không thể thao tác, vui lòng liên hệ với Admin quản trị!')

      // Gửi nguyên mảng lỗi vào session
      session.flash('error', errors) 
      session.flash('flash_id', Date.now())

      return response.redirect().back()
    }
  }

  async list({ request, response }: HttpContext) {
    const keyword = request.input('q', null)
    const page = request.input('page', 1)
    const limit = request.input('limit', 12)
    const hot = request.input('hot', 12)

    try {
      const query = NailCollection.query()
        .where('nail_collections.status', 1)
        .if(keyword, (query) => {
          query.join('nail_cates', 'nail_cates.id', '=', 'nail_collections.cate')
          if (uuidValidate(keyword))
            query.where('nail_cates.id', keyword)
          else
            query.where('nail_cates.tag', keyword)
        })
        .if(hot && hot === 'true', (query) => {
          query.whereNotNull('nail_collections.hot').where('nail_collections.hot', true)
        })
        // .orderBy('nail_collections.createdAt')

      query.paginate(page, limit)
      const collections = await query
                                  .select('nail_collections.*')
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
    const keyword = request.input('category', null)
    const page = request.input('page', 1)
    const limit = request.input('limit', 12)

    try {
      const query = NailCollection
        .query()
        .join('nail_cates', 'nail_cates.id', '=', 'nail_collections.cate')
        .where('nail_collections.status', 1)

        if (uuidValidate(keyword))
          query.where('nail_cates.id', keyword)
        else
          query.where('nail_cates.tag', keyword)

      query.paginate(page, limit)

      const result = await query
        .select('nail_collections.*')
        .exec() || []

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