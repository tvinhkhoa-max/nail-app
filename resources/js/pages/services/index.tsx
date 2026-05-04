import React from 'react'
import { Head, Link, router } from '@inertiajs/react'
import { FaEdit, FaEraser } from "react-icons/fa";
import Layout from '#resource/layouts/Layout';
import { route } from '#resource/helpers/route'

interface Service {
  id: number
  name: string
  price: number
  desc: string
  type: string
  typeName: string
  status: number
  statusText: string //'pending' | 'completed' | 'cancelled'
}

export default function ServiceIndex({ services }: { services: Service[] }) {
  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
      // TRUYỀN ID VÀO ĐÂY
      router.delete(route('admin.services.destroy', { id: id }))
    }
  }

  return (
    <>
      <Head title="Dịch vụ" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark dark:text-white">
            Dịch vụ 💅
          </h2>
          <p className="text-sm text-body-color dark:text-dark-6">
            Quản lý và theo dõi các Dịch vụ.
          </p>
        </div>
        
        <Link
          href={route('admin.services.create')}
          className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-6 text-center text-base font-medium text-white hover:bg-opacity-90"
        >
          + Thêm Dịch vụ mới
        </Link>
      </div>

      {/* Bảng danh sách - Tối ưu Mobile với overflow-x-auto */}
      <div className="rounded-xl bg-white shadow-card dark:bg-dark-2">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-dark-3">
                <th className="py-4 px-4 font-medium text-dark dark:text-white">Tên Dịch vụ</th>
                <th className="py-4 px-4 font-medium text-dark dark:text-white">Loại</th>
                <th className="py-4 px-4 font-medium text-dark dark:text-white">Giá</th>
                <th className="py-4 px-4 font-medium text-dark dark:text-white text-center">Trạng thái</th>
                <th className="py-4 px-4 font-medium text-dark dark:text-white text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-dark-3">
              {services.length > 0 ? (
                services.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="py-4 px-4">
                      <p className="font-medium text-dark dark:text-white">{item.name}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-dark dark:text-white">{item.typeName}</p>
                    </td>
                    <td className="py-4 px-4 text-body-color dark:text-dark-6">
                      {item.price}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex rounded-full py-1 px-3 text-xs font-medium ${getStatusClass(item.status)}`}>
                        {item.statusText}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end">
                        <Link href={route('admin.services.edit', { id: item.id })} alt="Sửa">
                          <FaEdit className="mr-2 ml-auto text-xl" title="Sửa" color="green" />
                        </Link>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="items-center transition-colors cursor-pointer"
                        >
                          <FaEraser className="mr-2 ml-auto text-xl" title="Xóa" color="red" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-body-color">
                    Chưa có Dịch vụ nào.
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
const getStatusClass = (status: number) => {
  switch (status) {
    case 2: return 'bg-yellow-100 text-yellow-700'
    case 1: return 'bg-green-100 text-green-700'
    case 0: return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

ServiceIndex.layout = (page: React.ReactNode) => <Layout children={page} />