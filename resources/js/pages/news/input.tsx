'use client'

import React, { useRef, useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import { route } from '#resource/helpers/route'
import Layout from '#resource/layouts/Layout'
import {
  FormInput, 
  FormSwitch, 
  SearchableSelect2, 
  FormRichEditor, 
  RichEditorRef 
} from '#resource/components/Form'

const cateNews = [
  { id: 'trend', name: 'Trend'},
  { id: 'news', name: 'Tin tức' },
  { id: 'blog', name: 'Blog' },
]

interface News {
  id: number
  title: string
  tag: string
  cate: string
  source: string
  desc: string
  hot: boolean
  img: string
  status: number
}

interface Props {
  news?: News // Prop optional cho trường hợp Update
  config?: any
}

export default function InputService({ news, config }: Props) {
  // Xác định mode dựa trên việc có truyền category vào hay không
  const isUpdate = !!news?.id
  const editorRef = useRef<RichEditorRef>(null)
  const [previews, setPreviews] = useState<string[]>(
    news?.img ? [`${config?.URL_STATIC_UPLOAD}/${news.img}`] : []
  )

  // Sử dụng Inertia Form Helper để quản lý state và lỗi
  const { data, setData, post, processing, errors } = useForm({
    id: news?.id || null, // Hidden
    title: news?.title || '',
    tag: news?.tag || '',
    cate: news?.cate || '',
    source: news?.source || '',
    desc: news?.desc || editorRef.current?.getHTML() || '',
    hot: news?.hot || false,
    img: news?.img || null as File | null ,
    status: news?.status || 1
  })
  const optionNews = cateNews
  .map(item => ({
    value: item.id,
    text: item.name
  }));

  // Xử lý khi chọn hình ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setData('img', file)
      setPreviews([URL.createObjectURL(file)])
    }
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    data['desc'] = editorRef.current?.getHTML()

    post(route('admin.news.store', { id: data['id'] }), {
      onSuccess: () => {
        // Gọi hàm notify đã đăng ký ở bước 2
        (window as any).notify('success', 'Đã tạo bản tin thành công! 🎉');
      },
      onError: (errors) => {
        (window as any).notify('error', errors.message);
      }
    })
  }

  return (
    <>
      <Head title={isUpdate ? "Cập nhật Bản tin" : "Tạo Bản tin"} />
      
      <>
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-dark dark:text-white uppercase tracking-wide">
              {isUpdate ? '✨ Cập nhật Bản tin 💅': '✨ Tạo Bản tin mới 💅'}
            </h2>
          
            <p className="text-base text-body-color dark:text-dark-6">
              {isUpdate ? `Chỉnh sửa: ${news?.title}` :'Thiết lập thông tin của Bản tin.' }
            </p>
          </div>
          {isUpdate && (
          <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-bold">
            ID: {news?.id}
          </span>
          )}
        </div>

        <div className="rounded-xl bg-white p-8 shadow-card dark:bg-dark-2 sm:p-10">
          <form onSubmit={handleSubmit}>
            <div className="-mx-4 flex flex-wrap">
              {/* Tên Dịch vụ */}
              <div className="w-full px-4 md:w-1/2">
                <FormInput
                  label="Tiêu đề"
                  error={errors.title}
                  placeholder="Ex: Vẽ Thủ Công"
                  value={data.title}
                  onChange={(e: any) => setData('title', e.target?.value || e)}
                />
              </div>

              <div className="w-full px-4 md:w-1/2">
                <SearchableSelect2 
                  label="Thể loại"
                  value={data.cate}
                  options={optionNews}
                  onChange={(val: string) => setData('cate', val)}
                  placeholder="Chọn thể loại..."
                />
              </div>

              {/* Nguồn tin */}
              <div className="w-full px-4 md:w-1/2">
                <FormInput
                  label="Nguồn"
                  placeholder="Ex: Báo mới"
                  value={data.source}
                  onChange={(e: any) => setData('source', e.target?.value || e)}
                  error={errors.source}
                />

                <FormSwitch 
                  label="Tin nổi bật"
                  description="Hiển thị lên trang chủ App"
                  enabled={data.hot}
                  onChange={(val: boolean) => setData('hot', val)}
                /> <br />

                <FormSwitch 
                  label="Hiển thị Bản tin"
                  description="Hiển thị bản tin lên App"
                  enabled={data.status}
                  onChange={(val: number) => setData('status', val)}
                /> <br />
              </div>

              {/* Thời lượng */}
              {/* <div className="w-full px-4 md:w-1/2">
                <FormInput
                  label="Thời lượng"
                  placeholder="60P"
                  value={data.duration}
                  onChange={(e: any)=> setData('duration', e.target.value)}
                  error={errors.duration}
                />
              </div> */}

              <div className="w-full px-4 md:w-1/2">
                <div className="rounded-xl bg-white p-6 shadow-card dark:bg-dark-2 border border-stroke dark:border-dark-3">
                  <label className="mb-4 block font-medium text-dark dark:text-white text-center">Hình đại diện bộ sưu tập</label>
                  <div className="relative mb-6 flex h-64 w-full items-center justify-center rounded-lg border-2 border-dashed border-stroke bg-gray-2 dark:border-dark-3 dark:bg-dark-3 overflow-hidden">
                    {previews.length > 0 ? (
                      <img src={previews[0]} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="mb-2 text-primary">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                        </span>
                        <p className="text-sm text-body-color">Click để tải ảnh lên</p>
                      </div>
                    )}
                    <input
                      name="img_news"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 z-10 cursor-pointer opacity-0"
                    />
                  </div>
                </div><br />
              </div>

              {/* Mô tả */}
              <div className="w-full px-4">
                <FormRichEditor content={data.desc} label={'Nội dung Bản tin'} ref={editorRef} />
              </div>

              {/* Nút Submit */}
              <div className="w-full px-4">
                <button
                  disabled={processing}
                  className="w-full rounded-md bg-primary py-3 px-10 text-center text-base font-medium text-white hover:bg-opacity-90 disabled:bg-gray-400"
                >
                  {processing ? 'Đang lưu...' : (!isUpdate ? 'Xác nhận tạo mới': 'Lưu thay đổi')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </>
    </>
  )
}

InputService.layout = (page: React.ReactNode) => <Layout children={page} />