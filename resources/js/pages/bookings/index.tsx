import React from 'react'
import { Head, Link } from '@inertiajs/react'
import Layout from '#resource/layouts/Layout';

interface Booking {
  id: number
  customer_name: string
  phone: string
  service: string
  booking_date: string
  status: 'pending' | 'completed' | 'cancelled'
}

export default function BookingIndex({ bookings }: { bookings: Booking[] }) {
  return (
    <>
      <Head title="Danh sách lịch hẹn" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark dark:text-white">
            Lịch hẹn hôm nay 💅
          </h2>
          <p className="text-sm text-body-color dark:text-dark-6">
            Quản lý và theo dõi các lịch đặt của khách hàng.
          </p>
        </div>
        
        <Link
          href="/admin/bookings/create"
          className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-6 text-center text-base font-medium text-white hover:bg-opacity-90"
        >
          + Thêm lịch mới
        </Link>
      </div>

      {/* Bảng danh sách - Tối ưu Mobile với overflow-x-auto */}
      <div className="rounded-xl bg-white shadow-card dark:bg-dark-2">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-dark-3">
                <th className="py-4 px-4 font-medium text-dark dark:text-white">Khách hàng</th>
                <th className="py-4 px-4 font-medium text-dark dark:text-white">Dịch vụ</th>
                <th className="py-4 px-4 font-medium text-dark dark:text-white">Thời gian</th>
                <th className="py-4 px-4 font-medium text-dark dark:text-white text-center">Trạng thái</th>
                <th className="py-4 px-4 font-medium text-dark dark:text-white text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-dark-3">
              {bookings.length > 0 ? (
                bookings.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="py-4 px-4">
                      <p className="font-medium text-dark dark:text-white">{item.customer_name}</p>
                      <p className="text-xs text-body-color">{item.phone}</p>
                    </td>
                    <td className="py-4 px-4 text-body-color dark:text-dark-6">
                      {item.service}
                    </td>
                    <td className="py-4 px-4 text-body-color dark:text-dark-6">
                      {item.booking_date}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex rounded-full py-1 px-3 text-xs font-medium ${getStatusClass(item.status)}`}>
                        {/* {item.status.toUpperCase()} */}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="text-primary hover:underline">Chi tiết</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-body-color">
                    Chưa có lịch hẹn nào cho hôm nay.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

// Helper xử lý màu sắc trạng thái
const getStatusClass = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-700'
    case 'completed': return 'bg-green-100 text-green-700'
    case 'cancelled': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

BookingIndex.layout = (page: React.ReactNode) => <Layout children={page} />