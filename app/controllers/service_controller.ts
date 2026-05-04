import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Service from '#models/service'

export default class ServiceController {
  /**
   * Hiển thị danh sách (Index)
   */
  async index({ inertia }: HttpContext) {
    const services = await Service.all()

    return inertia.render('services/index', { services })
  }

  /**
   * (Create or Edit)
   */
  async edit({ inertia, request }: HttpContext) {
    const serviceId = request.input('id', null)
    let service = null

    if (serviceId) {
      service = await Service.findBy('id', serviceId)
    }
    const typeServices = [
      { id: 'nail_art', name: 'NGHỆ THUẬT NAIL'},
      { id: 'health_spa', name: 'CHĂM SÓC & THƯ GIÃN' },
      { id: 'combo', name: 'TRẢI NGHIỆM CHÍNH' },
    ]
    return inertia.render('services/input', { service, typeServices })
  }

  /**
   * Xử lý lưu dữ liệu (Store)
   */
  async store({ request, response, session }: HttpContext) {
    // 1. Lấy dữ liệu từ form
    const errors: any[] = []
    const input = request.all()
    const trx = await db.transaction();
    // let data = {}

    try {
      // 2. Logic lưu database (Ví dụ: await Booking.create(data))
      // data = input
      const { id, ...data } = input;

      if (!input.id)
        await Service.create(data, { client: trx })
      else
        await Service.updateOrCreate({id: input['id'] || null}, data, { client: trx })

      await trx.commit();

      if (errors.length > 0) {
        // Gửi nguyên mảng lỗi vào session
        session.flash('error', errors)
        session.flash('flash_id', Date.now())

        return response.redirect().back()
      }

      // 3. Thông báo và điều hướng
      session.flash('success', 'Dữ liệu lưu thành công!')

      return response.redirect().toRoute('admin.services.list')

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
          .toRoute('admin.services.edit')
      else
        return response.redirect().toRoute('admin.services.list')
    }
  }

  async delete({ request, response, session }: HttpContext) {
    const serviceId = request.input('id', null)
    const errors: any[] = []
    const trx = await db.transaction();

    try {
      const service = await Service.findBy('id', serviceId)
      await service?.useTransaction(trx).delete();
      await trx.commit()

      session.flash('success', 'Đã xóa dữ liệu thành công!')

      return response.redirect().back()

    } catch (error) {
      await trx.rollback();

      console.log(error)
      errors.push('Xóa dữ liệu thất bại, vui lòng liên hệ với Admin quản trị!')

      session.flash('error', errors)
      session.flash('flash_id', Date.now())

      return response.redirect().back()
    }
  }

  async list({ response }: HttpContext) {
    try {
      const services = await Service
        .query()
        .where('status', 1)
        // .groupBy('type');
        .select('id', 'name', 'desc', 'type', 'price', 'duration')
        .orderBy('type', 'asc')
        .orderBy('created_at', 'asc');

      response.status(201).json({
        data: services
      });

    } catch (error) {
      console.log(error)
      response.status(201).send({
        data: []
      });
    }
  }
}