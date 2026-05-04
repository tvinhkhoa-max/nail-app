import type { HttpContext } from '@adonisjs/core/http';
import db from '@adonisjs/lucid/services/db'
// import { inject } from '@adonisjs/core'
import NailCate from '#models/nail_cate'

// @inject()
export default class NailCatesController {
  // constructor(protected cateModel: typeof NailCate) {}

  /**
   * Hiển thị danh sách (Index)
   */
  async index({ inertia }: HttpContext) {
    const nailCate = await NailCate
      .query()
      .orderBy('name', 'asc')
      .exec();

    return inertia.render('nail-cates/index', { nailcate: nailCate })
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
    const trx = await db.transaction();

    try {
      data = input

      await NailCate.updateOrCreate({id: input['id']}, data, { client: trx })

      // 3. Thông báo và điều hướng
      session.flash('success', 'Dữ liệu lưu thành công!')

      await trx.commit();

      return response.redirect().toRoute('nail-cate.list')

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
          .toRoute('nail-cate.edit')
      else
        return response.redirect().toRoute('nail-cate.list')
    }
  }

  async delete({ request, response, session }: HttpContext) {
    const cateId = request.input('id', null);
    const errors: any[] = [];
    const trx = await db.transaction();

    try {
      const cate = await NailCate.findBy('id', cateId, { client: trx })
      await cate?.useTransaction(trx).delete();
      await trx.commit()

      session.flash('success', 'Đã xóa dữ liệu thành công!')

      return response.redirect().toRoute('nail-cate.list')
    } catch (error) {
      await trx.rollback();

      console.log(error)

      errors.push('Xóa dữ liệu thất bại, vui lòng liên hệ với Admin quản trị!')
      session.flash('error', errors)
      session.flash('flash_id', Date.now())

      return response.redirect().toRoute('nail-cate.list')
    }
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

      response.status(201).send({
        data: []
      });
    }
  }
}