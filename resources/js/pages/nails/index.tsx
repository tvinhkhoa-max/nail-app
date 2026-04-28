import React from 'react'
import { Head, Link, router } from '@inertiajs/react'
import { FaEdit, FaEraser } from "react-icons/fa";
import Layout from '#/layouts/Layout';
import { route } from '#/helpers/route'

interface Nails {
  id: string
  name: string
  img: string
  cate: string
  cateName: string
  collection: string
  collectionName: string
  status: number
  statusText: string
}

export default function NailIndex({ nails, config }: { nails: Nails[], config: any }) {
  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bộ sưu tập này?')) {
      // TRUYỀN ID VÀO ĐÂY
      router.delete(route('admin.nails.destroy', { id: id }))
    }
  }

  return (
    <>
      <Head title="Kiểu Nail" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark dark:text-white">
            Kiểu Nail 💅
          </h2>
          <p className="text-sm text-body-color dark:text-dark-6">
            Quản lý và theo dõi các kiểu Nail.
          </p>
        </div>
        
        <Link
          href="/admin/nails/create"
          className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-6 text-center text-base font-medium text-white hover:bg-opacity-90"
        >
          + Thêm mới
        </Link>
      </div>

      {/* Bảng danh sách - Tối ưu Mobile với overflow-x-auto */}
      <div className="rounded-xl bg-white shadow-card dark:bg-dark-2">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-dark-3">
                <th className="py-4 px-4 font-medium text-dark dark:text-white">Kiểu Nail</th>
                <th className="py-4 px-4 font-medium text-dark dark:text-white">Hình</th>
                <th className="py-4 px-4 font-medium text-dark dark:text-white">Danh mục</th>
                <th className="py-4 px-4 font-medium text-dark dark:text-white">Bộ sưu tập</th>
                <th className="py-4 px-4 font-medium text-dark dark:text-white text-center">Trạng thái</th>
                <th className="py-4 px-4 font-medium text-dark dark:text-white text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-dark-3">
              {nails.length > 0 ? (
                nails.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="py-4 px-4 text-body-color dark:text-dark-6">
                      <article className="flex items-center whitespace-nowrap">
                        <p className="font-medium text-dark dark:text-white">{item.name}</p>
                      </article>
                    </td>
                    <td className="py-4 px-4 text-body-color dark:text-dark-6">
                      <img src={`${config?.URL_STATIC_UPLOAD}/${item.img}`} alt="Nail Image" style={{ width: "30px" }} />
                    </td>
                    <td className="py-4 px-4 text-body-color dark:text-dark-6">
                      {item.cateName}
                    </td>
                    <td className="py-4 px-4 text-body-color dark:text-dark-6">
                      {item.collectionName}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex rounded-full py-1 px-3 text-xs font-medium ${getStatusClass(item.status)}`}>
                        {item.statusText.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 justify-end text-right text-sm text-gray-500">
                      <Link href="/admin/nails/edit" data={{"id": item.id}} alt="Sửa" >
                        <FaEdit className="mr-2 ml-auto text-xl" title="Sửa" color="green" />
                      </Link>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="items-center transition-colors cursor-pointer"
                      >
                        <FaEraser className="mr-2 ml-auto text-xl" title="Xóa" color="red" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-body-color">
                    Chưa có kiểu Nail nào.
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

NailIndex.layout = (page: React.ReactNode) => <Layout children={page} />