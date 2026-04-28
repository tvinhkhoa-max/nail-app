import React, { useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import Layout from '#/layouts/Layout.js'
import { 
  SearchableSelectForm, 
  SearchableSelect2, 
  FormSwitch, 
  FormInput, 
  FormTextarea } from '#/components/Form.js'

// Định nghĩa các tập dữ liệu cho Combobox
const STYLES = ["Nhẹ nhàng", "Sang chảnh", "Cute", "Cá tính", "Cổ điển", "Phá cách"];
const COLORS = ["Nude", "Đỏ", "Trắng", "Đen", "Xanh dương", "Hồng phấn", "Vàng kim", "Bạc"];
const OCCASIONS = ["Đi làm", "Đi tiệc", "Hẹn hò", "Đi biển", "Đám cưới"];

interface NailCate {
  id: string
  name: string
  status: number
  statusText: string //'pending' | 'completed' | 'cancelled'
}

interface NailCollection {
  id?: string
  name: string
  cate: string | null
  style: string
  color: string
  occasion: string
  img?: string // Đường dẫn ảnh cũ từ server
  desc: string
  status: boolean | number
}

interface Props {
  nailCates: NailCate[]
  collection?: NailCollection // Prop optional cho trường hợp Update
}

export default function InputNailCollection({ nailCates, collection }: Props) {
  // Xác định mode dựa trên việc có truyền collection vào hay không
  const isUpdate = !!collection?.id

  const [previews, setPreviews] = useState<string[]>(
    collection?.img ? [collection.img] : []
  )
  // const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [searchTerms, setSearchTerms] = useState({ style: '', color: '', occasion: '' })
  const { data, setData, post, processing, errors } = useForm({
    id: collection?.id || '', // Hidden
    name: collection?.name ||'',
    cate: collection?.cate || null,
    tag: '', // Hidden
    style: collection?.style || 'Nhẹ nhàng',
    color: collection?.color || 'Nude',
    occasion: collection?.occasion || 'Đi làm',
    img: collection?.img || null as File | null,
    desc: collection?.desc || '',
    status: collection ? (Boolean(collection.status)) : true,
  })
  const optionCates = nailCates
    .filter(item => item.status === 1) // Chỉ lấy các danh mục đang hoạt động
    .map(item => ({
      value: item.id,
      text: item.name
    }));

  // Hàm lọc dữ liệu cho Combobox
  // const filterData = (list: string[], term: string) => 
  //   list.filter(item => item.toLowerCase().includes(term.toLowerCase()))

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
    post('/admin/nails/collections/store', { forceFormData: true })
  }

  return (
    <>
      <Head title={isUpdate ? "Cập nhật bộ sưu tập" : "Tạo bộ sưu tập Nail"} />
      
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-dark dark:text-white uppercase tracking-wide">
            {isUpdate ? '✨ Cập nhật bộ sưu tập' : '✨ Tạo bộ sưu tập mới'}
          </h2>
          <p className="text-sm text-body-color dark:text-dark-6">
            {isUpdate ? `Chỉnh sửa: ${collection?.name}` : 'Thiết lập thông tin phân loại để khách hàng dễ dàng tìm kiếm trên App AR'}
          </p>
        </div>
        {isUpdate && (
           <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-bold">
             ID: {collection?.id}
           </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Trường ẩn (QA Checklist: Đảm bảo hidden fields vẫn bind data) */}
        <input type="hidden" value={data.id} />
        <input type="hidden" value={data.tag} />

        {/* CỘT TRÁI: THÔNG TIN CHI TIẾT */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-card dark:bg-dark-2 border border-stroke dark:border-dark-3">
            
            {/* Name Field */}
            <div className="mb-5">
              {/* <label className="mb-2.5 block font-medium text-dark dark:text-white">Tên bộ sưu tập</label> */}
              <FormInput
                label="Tên bộ sưu tập"
                placeholder="Nhập tên bộ sưu tập (Ví dụ: Nàng thơ mùa hạ)"
                value={data.name}
                onChange={(e: any) => setData('name', e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:text-white"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Combobox Group: Style, Color, Occasion */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <SearchableSelect2 
                label="Danh mục"
                value={data.cate}
                options={optionCates}
                onChange={(val) => setData('cate', val)}
                placeholder="Chọn danh mục..."
              />

              {/* Style Combobox */}
              <SearchableSelectForm 
                label="Phong cách"
                value={data.style}
                options={STYLES}
                searchTerm={searchTerms.style}
                onSearchChange={(val: any) => setSearchTerms({...searchTerms, style: val})}
                onSelect={(val: any) => setData('style', val)}
              />

              {/* Color Combobox */}
              <SearchableSelectForm 
                label="Tone màu chủ đạo"
                value={data.color}
                options={COLORS}
                searchTerm={searchTerms.color}
                onSearchChange={(val: any) => setSearchTerms({...searchTerms, color: val})}
                onSelect={(val: any) => setData('color', val)}
              />

              {/* Occasion Combobox */}
              <SearchableSelectForm 
                label="Dịp sử dụng"
                value={data.occasion}
                options={OCCASIONS}
                searchTerm={searchTerms.occasion}
                onSearchChange={(val: any) => setSearchTerms({...searchTerms, occasion: val})}
                onSelect={(val: any) => setData('occasion', val)}
              />
            </div>

            {/* Trạng thái */}
            <div className="w-full md:w-1/2">
              <FormSwitch
                label="Hiển thị Bộ sưu tập Nail"
                description="Hiển thị biểu tượng 🔥 và đưa lên đầu trang chủ App"
                enabled={data.status}
                onChange={(val: boolean) => setData('status', val)}
              />
            </div>

            {/* Description Field */}
            <div>
              {/* <label className="mb-2.5 block font-medium text-dark dark:text-white">Mô tả chi tiết</label>
              <textarea
                rows={5}
                placeholder="Viết một chút về cảm hứng của bộ sưu tập này..."
                value={data.desc}
                onChange={(e: any) => setData('desc', e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:text-white"
              ></textarea> */}
              <FormTextarea
                label="Mô tả chi tiết"
                placeholder="Viết một chút về cảm hứng của bộ sưu tập này..."
                value={data.desc}
                error={errors.desc}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('desc', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: HÌNH ĐẠI DIỆN & XEM TRƯỚC */}
        <div className="lg:col-span-5">
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
                name="img_collection"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 z-10 cursor-pointer opacity-0"
              />
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full rounded bg-primary py-4 px-6 font-bold text-white hover:bg-opacity-90 transition shadow-lg uppercase tracking-widest"
            >
              {processing ? 'Đang tạo...' : 'Lưu bộ sưu tập'}
            </button>
          </div>
        </div>
      </form>
    </>
  )
}

InputNailCollection.layout = (p: React.ReactNode) => <Layout children={p} />