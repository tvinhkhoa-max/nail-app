import React, { useState, useRef } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

import Layout from '#/layouts/Layout'
import { FormInput, SearchableSelect2, FormSwitch } from '#/components/Form'
import { route } from '#/helpers/route'

interface NailCate {
  id: string
  name: string
}

interface nailCollection {
  id: string
  name: string
  img?: string
}

interface Nail {
  id: string,
  name: string
  cate: string
  collection: string
  img: string
  status: number
}

interface Props {
  nailCates: NailCate[]
  nailCollections: nailCollection[]
  collection?: any
  nail?: Nail
  pathUpload: string
}

export default function ManageNailStyle({ nailCates, nailCollections, collection, nail, pathUpload }: Props) {
  const isUpdate = !!nail?.id
  const existingImage = collection?.img;
  const [imgSrc, setImgSrc] = useState(collection?.img || '')
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [processAi, setProcessAi] = useState(true)
  const { data, setData, processing, errors } = useForm({
    id: nail?.id || null,
    name: nail?.name || '',
    cate: collection?.cate || nail?.cate || null,
    collection: collection?.id || nail?.collection || null,
    // Chúng ta sẽ gửi file đã crop qua field này
    nail_image: null as File | null,
    // Metadata để backend biết nguồn gốc
    source_type: existingImage ? 'library' : 'upload',
    original_url: existingImage || '',
    status: true
  })
  const optionCates = nailCates
    .map(item => ({
      value: item.id,
      text: item.name
    }));
  const optionCollections = nailCollections
    .map(item => ({
      value: item.id,
      text: item.name
    }));

  // Xử lý khi chọn file mới từ máy tính
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      setImgSrc('') // Reset để trigger load lại
      setData(prev => ({ ...prev, source_type: 'upload', original_url: '' }))
      
      const reader = new FileReader()
      reader.onload = () => setImgSrc(reader.result?.toString() || '')
      reader.readAsDataURL(file)
    }
  }

  // Khởi tạo khung crop khi ảnh load xong
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    // Mặc định tạo khung crop vuông 50% ở giữa
    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 50 }, 1, width, height), width, height))
  }

  function handleProcessAI(e: React.ChangeEvent<HTMLInputElement>) {

  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!completedCrop && !nail?.id) || (!imgRef.current && !nail?.id)) return

    const image = imgRef.current
    if (image) {

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // 1. Tính toán tỷ lệ thực tế
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      const pixelRatio = window.devicePixelRatio
      // 2. Thiết lập kích thước canvas bằng đúng vùng chọn (đã nhân scale)
      canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio)
      canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio)

      ctx.scale(pixelRatio, pixelRatio)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      const cropX = completedCrop.x * scaleX
      const cropY = completedCrop.y * scaleY
      const centerX = image.naturalWidth / 2
      const centerY = image.naturalHeight / 2

      // 3. Di chuyển tâm canvas về giữa để xoay không bị lệch
      // ctx.save()
      // ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.save()
      ctx.translate(-cropX, -cropY)

      ctx.translate(centerX, centerY)
      // 4. Xoay context theo góc độ người dùng chọn
      ctx.rotate((rotate * Math.PI) / 180)
      
      // 5. Áp dụng Scale (Zoom)
      ctx.scale(scale, scale)

      ctx.translate(-centerX, -centerY)

      // 6. Vẽ ảnh: Điểm mấu chốt là phải trừ đi tọa độ tâm của vùng crop trên ảnh gốc
      const drawX = -(completedCrop.x * scaleX + (completedCrop.width * scaleX) / 2)
      const drawY = -(completedCrop.y * scaleY + (completedCrop.height * scaleY) / 2)

      ctx.drawImage(
        image,
        0, 0,
        image.naturalWidth, image.naturalHeight,
        0, 0,
        image.naturalWidth, image.naturalHeight,
      )

      ctx.restore()

      // 7. Chuyển thành Blob và gửi lên server
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'cropped_nail.png', { type: 'image/png' })

          router.post(route('admin.nails.store') + `?useAi=${processAi}`, {
            id: data.id,
            name: data.name,
            cate: data.cate,
            collection: data.collection,
            status: data.status,
            source_type: data.source_type,
            original_url: data.original_url,
            nail_image: file,
          }, {
            forceFormData: true,
          })
        }
      }, 'image/png')
    } else {
      router.post(route('admin.nails.store') + `?useAi=${processAi}`, {
        id: data.id,
        name: data.name,
        cate: data.cate,
        collection: data.collection,
        status: data.status
      }, {
        forceFormData: true,
      })
    }
  }

  return (
    <>
      <Head title="Tạo kiểu Nail cho AR" />
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-dark dark:text-white uppercase tracking-wide">
          {isUpdate ? '✨ Cập nhật kiểu Nail cho AR' : '✨ Tạo kiểu Nail cho AR' }
        </h2>
        <p className="text-sm text-body-color dark:text-dark-6">
          {isUpdate ? `Chỉnh sửa: ${nail?.name}` : 'Thiết lập thông tin để khách hàng dễ dàng tìm kiếm Mẫu trên App AR' }
        </p>
      </div>

      <style>{`
        .ord-nw { top: -2px; left: -2px; border-top: 6px solid #000; border-left: 6px solid #000; }
        .ord-ne { top: -2px; right: -2px; border-top: 6px solid #000; border-right: 6px solid #000; }
        .ord-sw { bottom: -2px; left: -2px; border-bottom: 6px solid #000; border-left: 6px solid #000; }
        .ord-se { bottom: -2px; right: -2px; border-bottom: 6px solid #000; border-right: 6px solid #000; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12">  {/*p-4*/}
        {/* Sidebar: Thông tin & Tìm kiếm */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-stroke dark:bg-dark-2 dark:border-dark-3">
            
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">Tên kiểu Nail</label>
              <FormInput 
                label="" 
                value={data.name} 
                onChange={(e: any) => setData('name', e.target.value)} 
                className="w-full" 
              />
              {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
            </div>

            <div className="mb-4 relative">
              <SearchableSelect2 
                label="Danh mục"
                value={data.cate}
                options={optionCates}
                onChange={(val: any) => setData('cate', val)}
                placeholder="Chọn danh mục..."
              />
            </div>

            <div className="mb-4 relative">
              <SearchableSelect2 
                label="Bộ sưu tập"
                value={data.collection}
                options={optionCollections}
                onChange={(val: any) => setData('collection', val)}
                placeholder="Chọn bộ sưu tập..."
              />
            </div>

            {/* Trạng thái */}
            <div className="mb-4">
              <FormSwitch 
                label="Hiển thị Kiểu Nail"
                description="Hiển thị biểu tượng 🔥"
                enabled={data.status}
                onChange={(val: boolean) => setData('status', val)}
              />
            </div>

            {/* Trạng thái */}
            <div className="mb-4">
              <FormSwitch 
                label="Sử dụng AI để tách móng"
                description=""
                enabled={processAi}
                onChange={(val: boolean) => setProcessAi(val)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-primary">Thay đổi ảnh nguồn (Nếu cần)</label>
              <input type="file" accept="image/*" onChange={onFileChange} className="w-full text-xs" />
            </div>
          </div>
        </div>

        {/* Main: Vùng xử lý Crop */}
        <div className="lg:col-span-8">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-stroke dark:bg-dark-2 text-center">
             <div className="relative inline-block overflow-hidden rounded-lg bg-black/5 p-2 mb-4 w-full" style={{ minHeight: '400px' }}>
              {imgSrc ? (
                <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)}>
                  <img 
                    ref={imgRef} 
                    alt="Source" 
                    src={`${pathUpload}/${imgSrc}`}
                    crossOrigin="anonymous" // Cực kỳ quan trọng để canvas không bị lỗi
                    onLoad={onImageLoad}
                    style={{ 
                      maxHeight: '70vh', 
                      transform: `scale(${scale}) rotate(${rotate}deg)`,
                      transition: 'transform 0.1s' 
                    }} 
                  />
                </ReactCrop>
              ) : (
                <div className="flex h-[400px] items-center justify-center text-gray-400 italic">
                  Vui lòng chọn ảnh để bắt đầu tách móng
                </div>
              )}
            </div>

            {/* Toolbar điều khiển nhanh */}
            <div className="flex items-center justify-center gap-4 border-t pt-4">
              {/* <button type="button" onClick={() => setRotate(r => (r + 90) % 360)} className="px-3 py-1 bg-gray-100 rounded text-xs dark:bg-dark-3">XOAY 90°</button> */}
              <div className="flex items-center gap-1 bg-gray-50 dark:bg-dark-3 p-1 rounded-lg">
                <button
                  type="button" 
                  onClick={() => setRotate(r => r - 5)} 
                  className="w-10 h-8 flex items-center justify-center hover:bg-white rounded shadow-sm transition-all"
                >
                  -5°
                </button>
                <span className="text-xs font-mono font-bold w-12 text-center border-x px-2">
                  {rotate}°
                </span>
                <button 
                  type="button" 
                  onClick={() => setRotate(r => r + 5)} 
                  className="w-10 h-8 flex items-center justify-center hover:bg-white rounded shadow-sm transition-all"
                >
                  +5°
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} className="w-8 h-8 bg-gray-100 rounded dark:bg-dark-3">-</button>
                <span className="text-xs font-bold uppercase">Zoom</span>
                <button type="button" onClick={() => setScale(s => Math.min(s + 1.5, 3))} className="w-8 h-8 bg-gray-100 rounded dark:bg-dark-3">+</button>
              </div>
              <button type="button" onClick={() => { setScale(1); setRotate(0); }} className="px-3 py-1 bg-gray-100 rounded text-xs dark:bg-dark-3">RESET</button>
            </div>

            <button 
              type="submit" 
              disabled={processing || (!imgSrc && !nail?.id)} 
              className="mt-6 w-full bg-primary py-4 text-white font-bold rounded-md hover:bg-opacity-90 disabled:bg-gray-400"
            >
              {processing ? 'ĐANG LƯU HỆ THỐNG...' : 'XÁC NHẬN VÀ LƯU'}
            </button>
          </div>
        </div>
      </form>
    </>
  )
}

ManageNailStyle.layout = (page: React.ReactNode) => <Layout children={page} />