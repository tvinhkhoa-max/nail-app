import type { HttpContext } from '@adonisjs/core/http'
import fs from 'fs/promises'
import sharp from 'sharp';
import path from 'path';
import NailNews from '#models/nail_news'
import { uploadImage, removeImageStorage } from '#services/supabase'
import db from '@adonisjs/lucid/services/db'
import { inject } from '@adonisjs/core'


@inject()
export default class NewsController {

  // constructor(protected newsModel: typeof NailNews) {}
  /**
   * Hiển thị danh sách (Index)
   */
  async index({ inertia }: HttpContext) {
    const news = await NailNews
      .query()
      .orderBy('updated_at', 'desc')
      .exec();

    const config = {
      URL_STATIC_UPLOAD: (process.env?.APP_ENV != 'development' ? process.env.SUPABASE_URL_STATIC_UPLOAD : process.env.LOCAL_URL_STATIC_UPLOAD),
    }
    return inertia.render('news/index', { news, config })
  }

  /**
   * (Create or Edit)
   */
  async edit({ inertia, request }: HttpContext) {
    const newsId = request.input('id', null)
    let news = null;

    if (newsId) {
      news = await NailNews.findBy('id', newsId)
    }

    const config = {
      URL_STATIC_UPLOAD: (process.env?.APP_ENV != 'development' ? process.env.SUPABASE_URL_STATIC_UPLOAD : process.env.LOCAL_URL_STATIC_UPLOAD),
    }
    return inertia.render('news/input', { news, config })
  }

  /**
   * Xử lý lưu dữ liệu (Store)
   */
  async store({ request, response, session }: HttpContext) {
    // 1. Lấy dữ liệu từ form
    const errors: any[] = []
    const input = request.all()
    const image = request.file('img');
    let data = {}
    const trx = await db.transaction()

    try {
      // 2. Logic lưu database (Ví dụ: await Booking.create(data))
      const image = request.file('img', {
        size: '5mb',
        extnames: ['jpg', 'png', 'jpeg'],
      }) || null;

      if (!image && !input.id && input['hot']) {
        errors.push('Vui lòng chọn ảnh đại diện cho Bản tin')
      }

      if (errors.length > 0) {
        // Gửi nguyên mảng lỗi vào session
        session.flash('error', errors)
        session.flash('flash_id', Date.now())

        return response.redirect().back()
      } else
        // const { id, ...data } = input;
        data = input

      let pathImageUpload: string
      if (image && image.tmpPath) {
        if (!process.env.APP_ENV || process.env.APP_ENV != 'development') {
          let buffer: Buffer | null = await fs.readFile(image?.tmpPath);
          let imageBuff: any = await sharp(buffer)
            .resize(400) // Co lại còn 400px width
            .webp({ quality: 70 }) // Chuyển sang định dạng webp nén 70%
            .toBuffer() || null;

          const uploadInfo = await uploadImage(imageBuff, 'news');

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

      if (errors.length > 0) {
        // Gửi nguyên mảng lỗi vào session
        session.flash('error', errors)
        session.flash('flash_id', Date.now())

        return response.redirect().back()
      }

      if (!input['id']) {
        await NailNews.create({ ...data }, { client: trx })
      } else {
        await NailNews.updateOrCreate(
          {id: input['id'] || null}, data,  { client: trx }
        )
      }

      // 3. Thông báo và điều hướng
      session.flash('success', 'Dữ liệu lưu thành công!')
      await trx.commit();

      return response.redirect().toRoute('admin.news.list')

    } catch (error) {
      await trx.rollback();

      console.log(error)

      if (input.id)
        errors.push('Cập nhật dữ liệu thất bại, vui lòng liên hệ với Admin quản trị!')
      else
        errors.push('Lưu dữ liệu thất bại, vui lòng liên hệ với Admin quản trị!')

      // Gửi nguyên mảng lỗi vào session
      session.flash('error', errors) 
      session.flash('flash_id', Date.now())

      if (input.id)
        return response.redirect()
          .withQs({ id: input['id'] })
          .toRoute('admin.news.edit')
      else
        return response.redirect().toRoute('admin.news.list')
    }
  }

  async delete({ request, response, session }: HttpContext) {
    const serviceId = request.input('id', null)
    const errors: any[] = []
    const trx = await db.transaction()

    try {
      const news = await NailNews.findBy('id', serviceId, { client: trx })
      await news?.useTransaction(trx).delete();

      session.flash('success', 'Đã xóa dữ liệu thành công!')

      await trx.commit()

      return response.redirect().back()

    } catch (error) {
      await trx.rollback()

      console.log(error)
      errors.push('Xóa dữ liệu thất bại, vui lòng liên hệ với Admin quản trị!')

      session.flash('error', errors)
      session.flash('flash_id', Date.now())

      return response.redirect().back()
    }
  }

  async search({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const exclude = request.input('exclude', null)

    try {
      const excludeIds = exclude?.split('|') || null;
      // const [result, total] = await Promise.all([
      //   NailNews
      //     .query()
      //     .where('status', 1)
      //     .if(excludeIds, (query) => { query.whereNotIn('id', excludeIds) })
      //     .orderBy('createdAt', 'asc')
      //     .paginate(page, limit),

      //   NailNews
      //     .query()
      //     .where('status', 1)
      //     .if(excludeIds, (query) => { query.whereNotIn('id', excludeIds) })
      //     .count('* as total'),
      // ])
      const news = await NailNews
        .query()
        .where('status', 1)
        .if(excludeIds, (query) => { query.whereNotIn('id', excludeIds) })
        .orderBy('createdAt', 'asc')
        .paginate(page, limit);

      const result = news.toJSON();

      response.status(201).json({
        data: result.data || [],
        total: result.meta.total,
      });

    } catch (error) {
      console.log(error);
      return response.status(201).json({ data: [], total: 0 });
    }
  }

  async detail({ request, response }: HttpContext) {
    const newsId = request.input('id', null)

    if (newsId) {
      try {
        return response.status(201).json({
          data: await NailNews.findBy('id', newsId) || null
        })
      } catch (error) {
        return response.status(201).json({
          data: null
        })
      }
    }

    return response.status(201).json({
      data: null
    })
  }
}