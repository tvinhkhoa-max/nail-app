import React from 'react'
import { Head } from '@inertiajs/react'
import Layout from '#resource/layouts/Layout.js';

const Home = () => {
  return (
    <>
      <Head title="Home Dashboard" />
      
      {/* Title Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-dark dark:text-white sm:text-[28px]">
          Chào mừng trở lại!
        </h2>
        <p className="text-base text-body-color dark:text-dark-6">
          Dưới đây là tóm tắt tình hình tiệm Nail của bạn hôm nay.
        </p>
      </div>

      {/* Stats Cards Row - Copy từ Tailgrids Stats Component */}
      <div className="flex flex-wrap -mx-4">
        {[
          { label: 'Tổng doanh thu', value: '5.200k', icon: '💰', color: 'bg-primary' },
          { label: 'Lịch hẹn mới', value: '18', icon: '📝', color: 'bg-orange-400' },
          { label: 'Khách hàng mới', value: '12', icon: '👤', color: 'bg-green-500' }
        ].map((item, i) => (
          <div key={i} className="w-full px-4 md:w-1/2 xl:w-1/3">
            <div className="relative flex items-center p-6 mb-8 overflow-hidden bg-white rounded-xl shadow-card dark:bg-dark-2">
              <div className={`flex items-center justify-center w-12 h-12 mr-4 rounded-lg text-white ${item.color}`}>
                {item.icon}
              </div>
              <div>
                <span className="block text-sm font-medium text-body-color dark:text-dark-6">
                  {item.label}
                </span>
                <h4 className="text-2xl font-bold text-dark dark:text-white">
                  {item.value}
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings Table - Tailgrids Table Component */}
      <div className="w-full bg-white rounded-xl dark:bg-dark-2 border border-stroke dark:border-dark-3 shadow-card overflow-hidden">
        <div className="px-6 py-5 border-b border-stroke dark:border-dark-3">
          <h3 className="text-xl font-bold text-dark dark:text-white">Lịch hẹn sắp tới</h3>
        </div>
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left bg-gray-2 text-dark dark:bg-dark-3 dark:text-white">
                <th className="px-6 py-4 font-medium">Khách hàng</th>
                <th className="px-6 py-4 font-medium">Dịch vụ</th>
                <th className="px-6 py-4 font-medium">Kỹ thuật viên</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-stroke dark:border-dark-3">
                <td className="px-6 py-4">Chị Mai</td>
                <td className="px-6 py-4 text-primary font-medium">Làm móng tay (Gel)</td>
                <td className="px-6 py-4 text-body-color dark:text-dark-6">Trâm Nguyễn</td>
                <td className="px-6 py-4">
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-primary rounded-full">Đã xác nhận</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

Home.layout = (page: React.ReactNode) => <Layout children={page} />

export default Home