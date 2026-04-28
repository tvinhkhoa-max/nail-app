import React from 'react'
import { Head, useForm } from '@inertiajs/react'
import Layout from '#/layouts/Layout'
import { FormInput } from '#/components/FormInput'

export default function CreateBooking() {
  // Sử dụng Inertia Form Helper để quản lý state và lỗi
  const { data, setData, post, processing, errors } = useForm({
    customer_name: '',
    phone: '',
    service_id: '',
    booking_date: '',
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/admin/bookings/store')
  }

  return (
    <>
      <Head title="Đặt lịch hẹn" />
      
      <div className="mx-auto max-w-[700px]">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dark dark:text-white sm:text-3xl">
            Tạo lịch hẹn mới 💅
          </h2>
          <p className="text-base text-body-color dark:text-dark-6">
            Điền thông tin khách hàng và dịch vụ để giữ chỗ.
          </p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-card dark:bg-dark-2 sm:p-10">
          <form onSubmit={handleSubmit}>
            <div className="-mx-4 flex flex-wrap">
              {/* Tên khách hàng */}
              <div className="w-full px-4 md:w-1/2">
                <FormInput
                  label="Tên khách hàng"
                  placeholder="Nguyễn Văn A"
                  value={data.customer_name}
                  onChange={e => setData('customer_name', e.target.value)}
                  error={errors.customer_name}
                />
              </div>

              {/* Số điện thoại */}
              <div className="w-full px-4 md:w-1/2">
                <FormInput
                  label="Số điện thoại"
                  placeholder="0901234xxx"
                  value={data.phone}
                  onChange={e => setData('phone', e.target.value)}
                  error={errors.phone}
                />
              </div>

              {/* Chọn dịch vụ (Select Component chuẩn Tailgrids) */}
              <div className="w-full px-4">
                <div className="mb-5">
                  <label className="mb-3 block text-base font-medium text-dark dark:text-white">
                    Dịch vụ
                  </label>
                  <div className="relative">
                    <select
                      value={data.service_id}
                      onChange={e => setData('service_id', e.target.value)}
                      className="w-full appearance-none rounded-md border border-stroke bg-transparent py-3 px-5 text-base text-body-color outline-none transition focus:border-primary dark:border-dark-3 dark:text-dark-6"
                    >
                      <option value="">Chọn dịch vụ</option>
                      <option value="1">Sơn Gel (200k)</option>
                      <option value="2">Đắp bột (500k)</option>
                      <option value="3">Đính đá nghệ thuật</option>
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 mt-[-2px]">
                       ▼
                    </span>
                  </div>
                </div>
              </div>

              {/* Thời gian */}
              <div className="w-full px-4">
                <FormInput
                  label="Ngày và giờ hẹn"
                  type="datetime-local"
                  value={data.booking_date}
                  onChange={e => setData('booking_date', e.target.value)}
                  error={errors.booking_date}
                />
              </div>

              {/* Ghi chú */}
              <div className="w-full px-4">
                <div className="mb-5">
                  <label className="mb-3 block text-base font-medium text-dark dark:text-white">
                    Ghi chú thêm
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Yêu cầu đặc biệt..."
                    value={data.notes}
                    onChange={e => setData('notes', e.target.value)}
                    className="w-full rounded-md border border-stroke bg-transparent py-3 px-5 text-base text-body-color outline-none transition focus:border-primary dark:border-dark-3 dark:text-dark-6"
                  ></textarea>
                </div>
              </div>

              {/* Nút Submit */}
              <div className="w-full px-4">
                <button
                  disabled={processing}
                  className="w-full rounded-md bg-primary py-3 px-10 text-center text-base font-medium text-white hover:bg-opacity-90 disabled:bg-gray-400"
                >
                  {processing ? 'Đang lưu...' : 'Xác nhận đặt lịch'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

CreateBooking.layout = (page: React.ReactNode) => <Layout children={page} />