'use client'

import React, { useRef } from 'react'
import { Head, useForm } from '@inertiajs/react'
import Layout from '#resource/layouts/Layout'
import { FormInput, FormSwitch, FormTextarea, SearchableSelect2, FormRichEditor, RichEditorRef } from '#resource/components/Form'
import { route } from '#resource/helpers/route'

interface Service {
  id?: number
  name: string
  price: string
  desc: string
  type: string
  duration: string
  status: number
}

interface Props {
  service?: Service // Prop optional cho trường hợp Update
  typeServices: any[]
}

export default function InputService({ service, typeServices }: Props) {
  // Xác định mode dựa trên việc có truyền category vào hay không
  const isUpdate = !!service?.id
    const editorRef = useRef<RichEditorRef>(null)

  // Sử dụng Inertia Form Helper để quản lý state và lỗi
  const { data, setData, post, processing, errors } = useForm({
    id: service?.id || null, // Hidden
    name: service?.name || '',
    type: service?.type || '',
    price: service?.price || 0,
    duration: service?.duration || '',
    desc: service?.desc || editorRef.current?.getHTML() || '',
    status: service?.status || 1
  })
  const optionServices = typeServices
  .map(item => ({
    value: item.id,
    text: item.name
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    data['desc'] = editorRef.current?.getHTML()

    post(route('admin.services.store', { id: data['id'] }), {
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
      <Head title={isUpdate ? "Cập nhật Dịch vụ" : "Tạo Dịch vụ"} />
      
      <div className="mx-auto max-w-[700px]">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dark dark:text-white sm:text-3xl">
            {isUpdate ? '✨ Cập nhật Dịch vụ 💅': '✨ Tạo Dịch vụ mới 💅'}
          </h2>
          <div>
            <p className="text-base text-body-color dark:text-dark-6">
              {isUpdate ? `Chỉnh sửa: ${service?.name}` :'Thiết lập thông tin của Dịch vụ.' }
            </p>
          {isUpdate && (
           <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-bold">
             ID: {service?.id}
           </span>
          )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-card dark:bg-dark-2 sm:p-10">
          <form onSubmit={handleSubmit}>
            <div className="-mx-4 flex flex-wrap">
              {/* Tên Dịch vụ */}
              <div className="w-full px-4 md:w-1/2">
                <FormInput
                  label="Tên Dịch vụ"
                  error={errors.name}
                  placeholder="Ex: Vẽ Thủ Công"
                  value={data.name}
                  onChange={(e: any) => setData('name', e.target.value)}
                />
              </div>

              <div className="w-full px-4 md:w-1/2">
                <SearchableSelect2 
                  label="Danh mục"
                  value={data.type}
                  options={optionServices}
                  onChange={(val: string) => setData('type', val)}
                  placeholder="Chọn loại dịch vụ..."
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

              {/* Thời lượng */}
              <div className="w-full px-4 md:w-1/2">
                <FormInput
                  label="Thời lượng"
                  placeholder="60P"
                  value={data.duration}
                  onChange={(e: any)=> setData('duration', e.target.value)}
                  error={errors.duration}
                />
              </div>

              <div className="w-full px-4 md:w-1/2">
                <FormSwitch 
                  label="Hiển thị Dịch vụ"
                  description="Hiển thị dịch vụ lên App"
                  enabled={data.status}
                  onChange={(val: number) => setData('status', val)}
                /> <br />
              </div>

              {/* Mô tả */}
              <div className="w-full px-4">
                <FormRichEditor content={data.desc} label={'Mô tả Dịch vụ'} ref={editorRef} />
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

InputService.layout = (page: React.ReactNode) => <Layout children={page} />