import type { HttpContext } from '@adonisjs/core/http'
import NailCate from '#models/nail_cate'

export default class NailCatesController {
  /**
   * Hiển thị danh sách (Index)
   */
  async index({ inertia }: HttpContext) {
    // const nailcate = [
    //   { id: 1, name: 'Sơn Gel', service: '20000', status: 'completed' }
    // ]
    const nailcate = await NailCate.all()

    return inertia.render('nail-cates/index', { nailcate })
  }

  /**
   * (Create or Edit)
   */
  async edit({ inertia, request }: HttpContext) {
    const cateId = request.input('id', null)
    let nailCate = null

    if (cateId) {
      nailCate = await NailCate.findBy('id', cateId)
    }
    return inertia.render('nail-cates/input', { category: nailCate })
  }

  /**
   * Xử lý lưu dữ liệu (Store)
   */
  async store({ request, response, session }: HttpContext) {
    // 1. Lấy dữ liệu từ form
    const errors: any[] = []
    const input = request.all()


    let data = {}

    try {
      // 2. Logic lưu database (Ví dụ: await Booking.create(data))
      console.log('Dữ liệu nhận được:', data)

      if (errors.length > 0) {
        // Gửi nguyên mảng lỗi vào session
        session.flash('error', errors)
        session.flash('flash_id', Date.now())

        return response.redirect().back()
      } else
        data = input

      if (input.id) {

      }

      await NailCate.updateOrCreate({id: input.id}, data)

      // 3. Thông báo và điều hướng
      session.flash('success', 'Dữ liệu lưu thành công!')

      return response.redirect().toPath('/admin/nails/cates')

    } catch (error) {
      console.log(error)
      return response.status(500).send({
        errors: [
          { message: 'Có lỗi xảy ra, vui lòng kiểm tra lại!' }
        ]
      })
    }
  }

  async delete({ response }: HttpContext) {
    return response.status(200).ok( {
      
    })
  }

  async list({ response }: HttpContext) {
    try {
      const categories = await NailCate
        .query()
        .where('status', 1)
        .orderBy('createdAt', 'asc');

      response.status(201).send({
        data: categories
      });

    } catch (error) {
      console.log(error)
    }
  }
}