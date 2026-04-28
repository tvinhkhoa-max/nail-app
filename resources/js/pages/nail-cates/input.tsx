import React from 'react'
import { Head, useForm } from '@inertiajs/react'
import Layout from '#/layouts/Layout.js'
import { FormInput, FormSwitch, FormTextarea } from '#/components/Form.js'

interface NailCategory {
  id?: string
  name: string
  hot: number | null
  price: string
  desc: string
  status: number
}

interface Props {
  category?: NailCategory // Prop optional cho trường hợp Update
}

export default function InputNailCate({ category }: Props) {
    // Xác định mode dựa trên việc có truyền category vào hay không
  const isUpdate = !!category?.id

  // Sử dụng Inertia Form Helper để quản lý state và lỗi
  const { data, setData, post, processing, errors } = useForm({
    id: category?.id || '', // Hidden
    name: category?.name ||'',
    hot: category?.hot || Number(false),
    price: category?.price || null,
    desc: category?.desc || '',
    status: category?.status || Number(false)
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/admin/nails/cates/store', {
      onSuccess: () => {
        // Gọi hàm notify đã đăng ký ở bước 2
        (window as any).notify('success', 'Đã tạo bộ sưu tập thành công! 🎉');
      },
      onError: (errors) => {
        (window as any).notify('error', errors.message);
      }
    })
  }

  return (
    <>
      <Head title={isUpdate ? "Cập nhật Loại Nail" : "Tạo Loại Nail"} />
      
      <div className="mx-auto max-w-[700px]">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dark dark:text-white sm:text-3xl">
            {isUpdate ? '✨ Cập nhật loại Nail 💅': '✨ Tạo loại Nail mới 💅'}
          </h2>
          <div>
            <p className="text-base text-body-color dark:text-dark-6">
              {isUpdate ? `Chỉnh sửa: ${category?.name}` :'Thiết lập thông tin của loại Nail.' }
            </p>
          {isUpdate && (
           <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-bold">
             ID: {category?.id}
           </span>
          )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-card dark:bg-dark-2 sm:p-10">
          <form onSubmit={handleSubmit}>
            <div className="-mx-4 flex flex-wrap">
              {/* Tên loại Nail */}
              <div className="w-full px-4 md:w-1/2">
                <FormInput
                  label="Tên Loại Nail"
                  error={errors.name}
                  placeholder="Sơn"
                  value={data.name}
                  onChange={(e: any) => setData('name', e.target.value)}
                />
              </div>

              {/* Giá tiền */}
              <div className="w-full px-4 md:w-1/2">
                <FormInput
                  label="Giá tiền"
                  placeholder="000.0"
                  value={data.price}
                  onChange={(e: any)=> setData('price', e.target.value)}
                  error={errors.price}
                />
              </div>

              {/* Trạng thái */}
              <div className="w-full px-4 md:w-1/2">
                <FormSwitch 
                  label="Loại nổi bật"
                  description="Hiển thị trên trang chủ App"
                  enabled={data.hot}
                  onChange={(val: boolean) => setData('hot', val)}
                />
              </div>
              <div className="w-full px-4 md:w-1/2">
                <FormSwitch 
                  label="Hiển thị loại Nail"
                  description="Hiển thị biểu tượng 🔥 và đưa lên đầu trang chủ App"
                  enabled={data.status}
                  onChange={(val: number) => setData('status', val)}
                />
              </div>

              {/* Mô tả */}
              <div className="w-full px-4">
                <div className="mb-5">
                  {/* <label className="mb-3 block text-base font-medium text-dark dark:text-white">
                    Ghi chú thêm
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Yêu cầu đặc biệt..."
                    value={data.desc}
                    onChange={e => setData('desc', e.target.value)}
                    className="w-full rounded-md border border-stroke bg-transparent py-3 px-5 text-base text-body-color outline-none transition focus:border-primary dark:border-dark-3 dark:text-dark-6"
                  ></textarea> */}
                  <FormTextarea
                    label="Ghi chú thêm"
                    placeholder="Yêu cầu đặc biệt..."
                    value={data.desc}
                    error={errors.desc}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('desc', e.target.value)}
                  />
                </div>
              </div>

              {/* Nút Submit */}
              <div className="w-full px-4">
                <button
                  disabled={processing}
                  className="w-full rounded-md bg-primary py-3 px-10 text-center text-base font-medium text-white hover:bg-opacity-90 disabled:bg-gray-400"
                >
                  {processing ? 'Đang lưu...' : 'Xác nhận tạo mới'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

InputNailCate.layout = (page: React.ReactNode) => <Layout children={page} />