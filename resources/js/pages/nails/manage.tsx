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

    const image = imgRef.current;
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
      // 1. Tỉ lệ giữa ảnh hiển thị và ảnh gốc thực tế
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height
      // devicePixelRatio slightly increases sharpness on retina devices
      // at the expense of slightly slower render times and needing to
      // size the image back down if you want to download/upload and be
      // true to the images natural size.
      const pixelRatio = window.devicePixelRatio
      // const pixelRatio = 1

      canvas.width = Math.floor(completedCrop!.width * scaleX * pixelRatio)
      canvas.height = Math.floor(completedCrop!.height * scaleY * pixelRatio)

      ctx.scale(pixelRatio, pixelRatio)
      ctx.imageSmoothingQuality = 'high'

      const cropX = completedCrop!.x * scaleX
      const cropY = completedCrop!.y * scaleY

      const rotateRads = rotate * (Math.PI / 180)
      const centerX = image.naturalWidth / 2
      const centerY = image.naturalHeight / 2

      ctx.save()

      // 5) Move the crop origin to the canvas origin (0,0)
      ctx.translate(-cropX, -cropY)
      // 4) Move the origin to the center of the original position
      ctx.translate(centerX, centerY)
      // 3) Rotate around the origin
      ctx.rotate(rotateRads)
      // 2) Scale the image
      ctx.scale(scale, scale)
      // 1) Move the center of the image to the origin (0,0)
      ctx.translate(-centerX, -centerY)
      ctx.drawImage(
        image,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
      )

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
<div className="flex flex-col h-screen overflow-hidden -m-4 bg-slate-100">
      <Head title="Nail Design Studio" />

      {/* HEADER TOOLBAR */}
      <header className="h-16 bg-white dark:bg-dark-2 border-b border-stroke flex items-center justify-between px-6 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-primary uppercase tracking-wider">✨ Studio</h2>
          <div className="h-8 w-px bg-stroke mx-2" />
          <FormSwitchBoolean label="Chế độ Crop" enabled={isCrop} onChange={setIsCrop} />
        </div>

        {/* Floating Tool Group */}
        <div className="flex items-center gap-8 bg-slate-50 dark:bg-dark-3 px-6 py-1.5 rounded-full border border-stroke">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Zoom</span>
            <button onClick={() => setScale(s => s - 0.1)} className="w-8 h-8 rounded-full hover:bg-white shadow-sm">-</button>
            <span className="text-xs font-mono w-10 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => s + 0.1)} className="w-8 h-8 rounded-full hover:bg-white shadow-sm">+</button>
          </div>
          <div className="flex items-center gap-3 border-l pl-8">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Xoay</span>
            <button onClick={() => setRotate(r => r - 5)} className="w-8 h-8 rounded-full hover:bg-white shadow-sm">↺</button>
            <span className="text-xs font-mono w-10 text-center">{rotate}°</span>
            <button onClick={() => setRotate(r => r + 5)} className="w-8 h-8 rounded-full hover:bg-white shadow-sm">↻</button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={_fReset} className="text-sm text-gray-500 hover:text-red-500 mr-4">Làm mới</button>
          {/* <button onClick={handleSubmit} disabled={processing} className="bg-primary px-8 py-2.5 text-white font-bold rounded-lg shadow-lg hover:translate-y-[-1px] transition-all">
            {processing ? 'ĐANG LƯU...' : 'LƯU HỆ THỐNG'}
          </button> */}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR: Info only */}
        <aside className="w-80 bg-white dark:bg-dark-2 border-r border-stroke p-6 overflow-y-auto">
          <div className="space-y-5">
            <FormInput label="Tên kiểu Nail" value={data.name} onChange={e => setData('name', e.target.value)} />
            <SearchableSelect2 label="Danh mục" value={data.cate} options={optionCates} onChange={val => setData('cate', val)} />
            <SearchableSelect2 label="Bộ sưu tập" value={data.collection} options={optionCollections} onChange={val => setData('collection', val)} />
            <FormSwitch label="Hiển thị trên App" enabled={data.status} onChange={val => setData('status', val)} />
            <FormSwitch label="Tự động tách móng (AI)" enabled={processAi} onChange={setProcessAi} />
            <div className="pt-4 border-t">
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Thay đổi ảnh gốc</label>
              <input type="file" accept="image/*" onChange={onFileChange} className="text-xs w-full" />
            </div>
          </div><br/ >

          <div className="flex space-y-5 items-center gap-3">
            <button onClick={handleSubmit} disabled={processing} className="bg-primary px-8 py-2.5 text-white font-bold rounded-lg shadow-lg hover:translate-y-[-1px] transition-all">
              {processing ? 'ĐANG LƯU...' : 'LƯU HỆ THỐNG'}
            </button>
          </div>
        </aside>

        {/* MAIN WORKSPACE: Large Area */}
        <main className="flex-1 overflow-auto p-12 flex items-start justify-center bg-[#f8fafc]">
          <div className="shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-white leading-[0] relative">
            {imgSrc ? (
              isCrop ? (
                <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)}>
                  <img
                    ref={imgRef} // Gán ref trực tiếp vào đây
                    alt="Source" 
                    src={getDisplayUrl(imgSrc)}
                    crossOrigin="anonymous"
                    onLoad={onImageLoad}
                    style={{
                      height: '800px', 
                      width: 'auto',
                      maxWidth: 'none',
                      display: 'block', // Đảm bảo không có khoảng trống inline
                      transform: `scale(${scale}) rotate(${rotate}deg)`,
                      transition: 'transform 0.1s' 
                    }}
                  />
                </ReactCrop>
              ) : (
                <div className="relative border-[10px] border-white cursor-crosshair">
                  <canvas ref={canvasRef} width={800} height={1000} className="z-0" />
                  <canvas ref={maskCanvasRef} width={800} height={1000} className="absolute top-0 left-0 z-10 pointer-events-none" />
                </div>
              )
            ) : (
              <div className="w-[600px] h-[800px] flex items-center justify-center text-gray-400 italic bg-white">
                Vui lòng chọn ảnh để bắt đầu
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
    </>
  )
}

ManageNailStyle.layout = (page: React.ReactNode) => <Layout children={page} />