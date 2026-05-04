/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import DashboardController from '#controllers/dashboard_controller'
import BookingsController from '#controllers/booking_controller'
import NailCatesController from '#controllers/nail_cates_controller'
import NailsController from '#controllers/nails_controller'
import NailCollectionsController from '#controllers/nail_collections_controller'
import ServiceController from '#controllers/service_controller'
import NewsController from '#controllers/news_controller'

router.get('/admin/login', 'AdminAuthController.showLogin')
router.post('/admin/login', 'AdminAuthController.login')

router.group(() => {
  router.get('', [DashboardController, 'index'])
  // router.get('/dashboard', 'AdminController.dashboard')
  // router.get('/orders', 'AdminController.orders')
  // router.get('/nails', 'AdminController.nails')
  // router.post('/nails', 'AdminController.storeNail')

  router.group(() => {
    router.get('/',       [NewsController, 'index']).as('admin.news.list')
    router.get('/create', [NewsController, 'edit']).as('admin.news.create')
    router.get('/edit',   [NewsController, 'edit']).as('admin.news.edit')
    router.post('/store', [NewsController, 'store']).as('admin.news.store')
    router.delete('/destroy/:id', [NewsController, 'delete']).as('admin.news.destroy')
  }).prefix('/news')

  router.group(() => {
    router.get('/',       [ServiceController, 'index']).as('admin.services.list')
    router.get('/create', [ServiceController, 'edit']).as('admin.services.create')
    router.get('/edit',   [ServiceController, 'edit']).as('admin.services.edit')
    router.post('/store', [ServiceController, 'store']).as('admin.services.store')
    router.delete('/destroy/:id', [ServiceController, 'delete']).as('admin.services.destroy')
  }).prefix('/services')

  router.group(() => {
    router.get('/',       [BookingsController, 'index']).as('bookings.index')
    router.get('/create', [BookingsController, 'create'])
    router.post('/store', [BookingsController, 'store'])
    router.get('/show', [BookingsController, 'show'])
  }).prefix('/bookings')

  router.group(() => {
    router.get('/',       [NailsController, 'index']).as('nails.list').as('nail.list')
    router.get('/create', [NailsController, 'edit']).as('nails.create')
    router.get('/create/:collection', [NailsController, 'edit']).as('nails.create-by-collection')
    router.get('/edit',   [NailsController, 'edit']).as('nails.edit')
    router.post('/store', [NailsController, 'store']).as('admin.nails.store')
    router.delete('/destroy/:id', [NailsController, 'delete']).as('admin.nails.destroy')

    router.get('/collections',        [NailCollectionsController, 'index']).as('nail-collection.list')
    router.get('/collections/create', [NailCollectionsController, 'edit']).as('nail-collection.create')
    router.get('/collections/edit',   [NailCollectionsController, 'edit']).as('nail-collection.edit')
    router.post('/collections/store', [NailCollectionsController, 'store']).as('nail-collection.store')
    router.delete('/collections/destroy/:id', [NailCollectionsController, 'delete']).as('nail-collection.destroy')

    router.get('/cates',        [NailCatesController, 'index']).as('nail-cate.list')
    router.get('/cates/create', [NailCatesController, 'edit']).as('nail-cate.create')
    router.get('/cates/edit',   [NailCatesController, 'edit']).as('nail-cate.edit')
    router.post('/cates/store', [NailCatesController, 'store']).as('nail-cate.store')
    router.delete('/cates/destroy/:id', [NailCatesController, 'delete']).as('nail-cate.destroy')
  }).prefix('/nails')

})
.prefix('/admin')

router.group(() => {
  // Trả về danh sách mẫu nail cho Collection
  router.get('/services', [ServiceController, 'list']).as('service.list')
  
  // Xử lý logic AI (gửi câu hỏi sang OpenAI/Gemini và trả về gợi ý)
  router.post('/ai/consult', 'AiController.analyze')
  
  // Lưu thông tin khách hàng đặt lịch
  router.post('/bookings/reserve', [BookingsController, 'reserve']).as('booking.reserve')

  // Trả về thông tin của category
  router.group(() => {

    router.get('/cates', [NailCatesController,'list']).as('api-nail-cate.list')
    router.get('/cates/:id', [NailCatesController, 'list'])

    router.get('/collections', [NailCollectionsController, 'list']).as('api-nail-collection.list')
    // router.get('/collections/:q', [NailCollectionsController, 'list'])
    router.get('/collections/search', [NailCollectionsController, 'search']).as('api-nail-collection.search')

    router.get('/models', [NailsController, 'list']).as('api-nail-model.list')
    router.get('/models/:collection', [NailsController, 'list']).as('api-nail-model.bycollection')

  }).prefix('/nails')

  router.group(() => {
    router.get('/search', [NewsController,'search']).as('api-news.search')
    router.get('/detail', [NewsController,'detail']).as('api-news.detail')
  }).prefix('/news')

  router.get('health-check', async () => {
    return { ok: true, time: new Date().toISOString() }
  });

}).prefix('/api/v1')

