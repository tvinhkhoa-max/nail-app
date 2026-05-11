import React, { useState, useRef, useEffect } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

import Layout from '#resource/layouts/Layout'
import { FormInput, SearchableSelect2, FormSwitch, FormSwitchBoolean } from '#resource/components/Form'
import { route } from '#resource/helpers/route'
import { getCsrfToken } from '#resource/helpers/csrf'

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
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | undefined>()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [processAi, setProcessAi] = useState(1)
  const [isCrop, setIsCrop] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<{ x: number, y: number }[]>([]);
  // const [isLocalFile, setIsLocalFile] = useState(false);
  // const [lastOriginalSrc, setLastOriginalSrc] = useState(collection?.img || nail?.img || '');

  // Ảnh gốc ban đầu (luôn sạch sẽ để Crop)
  // const [originalSrc, setOriginalSrc] = useState(collection?.img || '');
  // Ảnh hiện tại đang hiển thị (có thể là ảnh gốc hoặc ảnh đã qua xử lý AI)
  const [displaySrc, setDisplaySrc] = useState(collection?.img || '');
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
    status: 1
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

  // Hàm tính toán URL hiển thị cuối cùng
  const getDisplayUrl = (source: string) => {
    if (!source) return '';
    if (source.startsWith('data:') || source.startsWith('blob:')) return source;
    return `${pathUpload}/${source}`;
  };

  // Xử lý khi chọn file mới từ máy tính
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // Giải phóng URL cũ nếu có để tránh tràn bộ nhớ
      if (imgSrc.startsWith('blob:')) URL.revokeObjectURL(imgSrc);

      const url = URL.createObjectURL(file);
      setImgSrc(url);
      // setLastOriginalSrc(url);  // ĐỂ DÙNG KHI BẤM RESET
      // setIsLocalFile(true); // Đánh dấu là file từ máy tính
      setData(prev => ({ ...prev, source_type: 'upload', original_url: '', nail_image: file }))

      if (!isCrop) {
        loadImageFromUrl(url);
      }
    }
  }

  // Khởi tạo khung crop khi ảnh load xong
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    // const { width, height } = e.currentTarget
    const { width, height, naturalWidth, naturalHeight } = e.currentTarget
    // Mặc định tạo khung crop vuông 50% ở giữa
    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 50 }, 1, width, height), width, height))

    // Lưu metadata cho Canvas ẩn (Dùng natural size để tính ratio chuẩn)
    const ratio = Math.min(600 / naturalWidth, 800 / naturalHeight);
    (window as any).__imgMeta = {
      ratio,
      offsetX: (600 - naturalWidth * ratio) / 2,
      offsetY: (800 - naturalHeight * ratio) / 2,
    };
  }

  const loadImageFromUrl = (url: string | null) => {
    if (!url) return;
    const fullUrl = (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('http')) 
      ? url 
      : `${pathUpload}/${url}`;

    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d")!

      const canvasWidth = canvas.width
      const canvasHeight = canvas.height

      const ratio = Math.min(
        canvasWidth / img.width,
        canvasHeight / img.height
      )

      const newWidth = img.width * ratio
      const newHeight = img.height * ratio

      const offsetX = (canvasWidth - newWidth) / 2
      const offsetY = (canvasHeight - newHeight) / 2

      ctx.strokeStyle = "red"
      ctx.strokeRect(offsetX, offsetY, newWidth, newHeight)
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight)

      // lưu lại để dùng cho click mapping
      window.__imgMeta = {
        ratio,
        offsetX,
        offsetY
      }
    }

    if (fullUrl)
      img.src = fullUrl
  }

  const toggleCropMode = async (val: boolean) => {
    if (val === false) {
      // KHI TẮT CROP: Cần vẽ lại nội dung từ vùng đã Crop
      // Logic này sẽ được useEffect phía dưới đảm nhận dựa trên biến isCrop
    }
    setIsCrop(val);
  };

  const handleClick = async (e: any) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();

    // Tọa độ click chuẩn trên Canvas (từ 0-600 và 0-800)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const xCanvas = (e.clientX - rect.left) * scaleX;
    const yCanvas = (e.clientY - rect.top) * scaleY;
    const newPoint = { x: Math.round(xCanvas), y: Math.round(yCanvas) };
    setPoints(prev => [...prev, newPoint]);

    // Gửi chính cái Canvas hiện tại lên
    const blobImg: Blob = await new Promise<Blob>((res: any) => canvas.toBlob(res, "image/jpeg", 0.7));
    const formData = new FormData();
    // const pointsHeader = points.map(p => `${p.x},${p.y}`).join(";")

    // if (points.length >= 2) {
      formData.append("file", blobImg, "image.jpg");
      formData.append("point", `${Math.round(xCanvas)},${Math.round(yCanvas)}`)
      formData.append("mode", "nail_charm")

      const res = await fetch('http://localhost:3333/api/v1/nails/point', {
        method: 'POST',
        headers: {
          "X-CSRF-TOKEN": getCsrfToken() || "",
        },
        body: formData,
        credentials: "include"
      })
      const resultBlob = await res.blob()

      drawMask(resultBlob)

      drawLinesOnClient(points)
    // } else {
    //   formData.append("file", blobImg, "image.png");
    //   formData.append("x", String(Math.round(xCanvas))); // Gửi tọa độ canvas
    //   formData.append("y", String(Math.round(yCanvas)));
    //   formData.append("mode", "nail_charm")

    //   const res = await fetch('http://localhost:3333/api/v1/nails/point', {
    //     method: 'POST',
    //     headers: {
    //       "X-CSRF-TOKEN": getCsrfToken() || "",
    //     },
    //     body: formData,
    //     credentials: "include"
    //   })
    //   const resultBlob = await res.blob()

    //   drawMask(resultBlob)
    // }
  }

  const drawLinesOnClient = (currentPoints: {x: number, y: number}[]) => {
    const canvas = maskCanvasRef.current;
    if (!canvas || currentPoints.length < 2) return;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Thiết lập style cho đường nối
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(currentPoints[0].x, currentPoints[0].y);

    for (let i = 1; i < currentPoints.length; i++) {
      ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
    }

    // Nếu muốn tự động đóng vùng (nối điểm cuối về điểm đầu)
    if (currentPoints.length > 2) {
      ctx.closePath();
    }
    
    ctx.stroke();

    // Vẽ lại các nốt chấm cho dễ nhìn
    ctx.fillStyle = 'red';
    currentPoints.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const rotateCanvas = (degrees: number) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    
    // 1. Lưu nội dung hiện tại ra một canvas tạm hoặc image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCanvas.getContext('2d')?.drawImage(canvas, 0, 0);

    // 2. Clear canvas chính
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 3. Di chuyển tâm tọa độ về giữa canvas
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // 4. Xoay context
    ctx.rotate((degrees * Math.PI) / 180);

    // 5. Vẽ lại ảnh từ tâm (lùi lại nửa chiều rộng/cao)
    ctx.drawImage(tempCanvas, -canvas.width / 2, -canvas.height / 2);

    ctx.restore();
  };

  const drawImageFinal = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !imgSrc) return;
    const ctx = canvas.getContext('2d')!;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `${pathUpload}/${imgSrc}`;

    img.onload = () => {
      // 1. Luôn xóa sạch trước khi vẽ lại từ ảnh gốc (Chống mờ)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      
      // 2. Di chuyển tâm vẽ về giữa canvas
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      // 3. Xoay context
      ctx.rotate((angle * Math.PI) / 180);

      // 4. Tính toán tỉ lệ để ảnh không bị tràn hoặc bị cắt
      // Nếu bạn muốn ảnh luôn nằm gọn trong khung 600x800 kể cả khi xoay:
      const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
      
      // Nếu xoay góc lẻ (như 45 độ), bạn có thể cần giảm ratio thêm một chút (0.7-0.8) 
      // để các góc không bị chém mất, hoặc chấp nhận bị cắt nhẹ ở góc.
      const drawW = img.width * ratio * scale; // Kết hợp với biến scale (zoom) của bạn
      const drawH = img.height * ratio * scale;

      // 5. Vẽ ảnh với tâm ảnh trùng với tâm Canvas
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

      ctx.restore();
    };
  };

  const _fReset = () => {
    setScale(1);
    setRotate(0);
    setPoints([]);
    setCompletedCrop(undefined);

    // setDisplaySrc(originalSrc);
    // 2. Quay về ảnh gốc (Dù là ảnh server hay ảnh vừa chọn từ máy)
    const originalImg = collection?.img || nail?.img || '';
    setImgSrc(originalImg);

    // 3. Xóa sạch Canvas
    const maskCanvas = maskCanvasRef.current;
    // 4. Cập nhật lại Form data để xóa file local vừa chọn bị lỗi
    setData(prev => ({
      ...prev,
      nail_image: null,
      source_type: originalImg ? 'library' : 'upload',
      original_url: originalImg
    }));

    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 600; // Reset cứng buffer
      canvas.height = 800;
      
      if (originalImg) {
        loadImageFromUrl(originalImg);
      }
      }

    if (maskCanvas) {
      const ctx = maskCanvas.getContext('2d');
      ctx?.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    }

    // 3. Vẽ lại ảnh gốc lên canvas chính
    // Bạn gọi lại hàm loadImageFromUrl đã viết sẵn ở trên
    // if (imgSrc) {
    //   loadImageFromUrl(`${pathUpload}/${imgSrc}`);
    // }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if ((!completedCrop && !nail?.id) || (!imgRef.current && !nail?.id)) return;

    const image = imgRef.current; console.log(image)
    if (!image) return;

    const meta = (window as any).__imgMeta;
    let processMode = 'none';
    if (isCrop && completedCrop) processMode = 'crop';
    else if (!isCrop && points.length > 0) processMode = 'polygon';

    // --- TRƯỜNG HỢP 1: UPDATE TEXT (Không có thao tác xử lý ảnh) ---
    if (processMode === 'none') {
      router.post(route('admin.nails.store'), { ...data, process_mode: 'none' });
      return;
    }

    // --- TẠO CANVAS ĐỂ XỬ LÝ ẢNH ---
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    if (processMode === 'crop') {
      // Logic Cắt (Crop)
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = completedCrop!.width * scaleX;
      canvas.height = completedCrop!.height * scaleY;

      ctx.save();
      ctx.translate(-completedCrop!.x * scaleX, -completedCrop!.y * scaleY);
      ctx.translate(image.naturalWidth / 2, image.naturalHeight / 2);
      ctx.rotate((rotate * Math.PI) / 180);
      ctx.scale(scale, scale);
      ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);
      ctx.drawImage(image, 0, 0);
      ctx.restore();
    } 
    else if (processMode === 'polygon') {
      // Logic Xoay nguyên tấm (Polygon)
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotate * Math.PI) / 180);
      ctx.scale(scale, scale);
      ctx.drawImage(image, -canvas.width / 2, -canvas.height / 2);
      ctx.restore();
    }

    // --- XUẤT BLOB VÀ GỬI DUY NHẤT 1 LẦN ---
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'processed_nail.png', { type: 'image/png' });
        
        // Tính toán tọa độ polygon (nếu có)
        const actualPoints = processMode === 'polygon' 
          ? points.map(p => ({
              x: Math.round((p.x - meta.offsetX) / meta.ratio),
              y: Math.round((p.y - meta.offsetY) / meta.ratio)
            }))
          : null;

        router.post(route('admin.nails.store'), {
          ...data,
          nail_image: file, // File đã được Canvas xử lý (Xoay/Crop)
          process_mode: processMode,
          use_ai: processAi,
          polygon_data: actualPoints ? JSON.stringify(actualPoints) : null,
        }, { forceFormData: true });
      }
    }, 'image/png', 1.0);
  };

  const drawMask = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    
    // Lưu lại vào DisplaySrc để làm "Snapshot"
    // Dùng Base64 ở đây để lưu trữ trạng thái bền vững hơn URL tạm
    const reader = new FileReader();
    reader.onloadend = () => {
      setDisplaySrc(reader.result as string);
    };
    reader.readAsDataURL(blob);

    // Vẽ lên canvas hiện tại
    const img = new Image();
    img.onload = () => {
      const bgCanvas = canvasRef.current!;
      const ctx = bgCanvas.getContext("2d")!;
      ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      ctx.drawImage(img, 0, 0, bgCanvas.width, bgCanvas.height);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  useEffect(() => {
    // loadImageFromUrl(`${pathUpload}/${imgSrc}`) // local public folder
    // Đợi một nhịp để Canvas mount xong vào DOM
    if (!isCrop && imgSrc) {
      // Nếu imgSrc là Base64 (từ canvas) hoặc URL (từ server) đều chạy được
      loadImageFromUrl(`${pathUpload}/${imgSrc}`);
    }

  }, [isCrop, imgSrc])

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
                onChange={(val: number) => setData('status', val)}
              />
            </div>

            {/* Trạng thái */}
            <div className="mb-4">
              <FormSwitch 
                label="Sử dụng AI để tách móng"
                description=""
                enabled={processAi}
                onChange={(val: number) => setProcessAi(val)}
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
              {/* <div className="relative inline-block overflow-hidden rounded-lg bg-black/5 p-2 mb-4 w-full" style={{ minHeight: '400px' }}> */}
              {/* <div className="relative w-full h-[600px]"> */}
              
              {imgSrc ? 
                isCrop ? (
                  <div className="relative inline-block overflow-hidden rounded-lg bg-black/5 p-2 mb-4 w-full" style={{ minHeight: '400px' }}>
                  <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)}>
                    <img 
                      alt="Source" 
                      src={getDisplayUrl(imgSrc)}
                      crossOrigin="anonymous" // Cực kỳ quan trọng để canvas không bị lỗi
                      onLoad={onImageLoad}
                      style={{
                        // Đảm bảo ảnh hiển thị đúng 800px chiều cao để khớp với Canvas
                        height: '800px', 
                        width: 'auto',   // Để chiều rộng tự co giãn theo tỉ lệ
                        maxWidth: 'none', // Chặn CSS global bóp nhỏ ảnh
                        transform: `scale(${scale}) rotate(${rotate}deg)`,
                        transition: 'transform 0.1s' 
                      }}
                    />
                  </ReactCrop>
                  </div>
                ) : (
                  <div className="relative inline-block border" style={{ width: '600px', height: '800px' }}>
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={800}
                    onClick={handleClick}
                    className="absolute top-0 left-0 z-0"
                  />
                  <canvas
                    ref={maskCanvasRef}
                    width={600} // Phải set width/height attribute ở đây
                    height={800}
                    className="absolute top-0 left-0 z-10 pointer-events-none"
                    style={{
                      width: '100%', // Hoặc 600px tùy layout của bạn
                      height: 'auto',
                      objectFit: 'contain' // Đảm bảo khớp với cách hiển thị của canvas gốc
                    }}
                  />
                  </div>
                )
                 : (
                <div className="flex h-[400px] items-center justify-center text-gray-400 italic">
                  Vui lòng chọn ảnh để bắt đầu tách móng
                </div>
              )}
              <img
                ref={imgRef}
                src={getDisplayUrl(imgSrc)}
                crossOrigin="anonymous"
                style={{
                  position: 'fixed',
                  top: -10000,
                  left: -10000,
                  visibility: 'hidden'
                }}
              />
              {/* </div> */}
            
            {/* Toolbar điều khiển nhanh */}
            <div className="flex items-center justify-center gap-4 border-t pt-4">
              {/* <button type="button" onClick={() => setRotate(r => (r + 90) % 360)} className="px-3 py-1 bg-gray-100 rounded text-xs dark:bg-dark-3">XOAY 90°</button> */}
              <div className="flex items-center gap-2">
                <FormSwitchBoolean 
                  label="Crop"
                  enabled={isCrop}
                  onChange={toggleCropMode}
                />
              </div>
              <div className="flex items-center gap-1 bg-gray-50 dark:bg-dark-3 p-1 rounded-lg">
                <button
                  type="button" 
                  onClick={() => {
                    const newRotate = rotate - 5;
                    setRotate(newRotate);
                    if (!isCrop) {
                      drawImageFinal(newRotate);
                    }
                  }}
                  className="w-10 h-8 flex items-center justify-center hover:bg-white rounded shadow-sm transition-all"
                >
                  -5°
                </button>
                <span className="text-xs font-mono font-bold w-12 text-center border-x px-2">
                  {rotate}°
                </span>
                <button 
                  type="button" 
                  onClick={() => {
                    const newRotate = rotate + 5;
                    setRotate(newRotate);
                    if (!isCrop) {
                      drawImageFinal(newRotate);
                    }
                  }}
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
              <button type="button" onClick={() => _fReset()} className="px-3 py-1 bg-gray-100 rounded text-xs dark:bg-dark-3">RESET</button>
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