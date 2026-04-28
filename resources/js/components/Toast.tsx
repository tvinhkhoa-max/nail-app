import React, { useState, useEffect, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onClose: (id: string) => void;
}

export const Toast = ({ id, type, message, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 3000); // Tự đóng sau 3s
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const styles = {
    success: {
      bg: 'bg-[#22AD5C]',
      icon: <path d="M10.29 13.3l1.81 1.81 4.37-4.37" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    },
    error: {
      bg: 'bg-[#F23D3D]',
      icon: <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    },
    warning: {
      bg: 'bg-[#FBBF24]',
      icon: <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    },
    info: {
      bg: 'bg-primary',
      icon: <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    }
  };

  return (
    <div className={`flex w-full max-w-[360px] items-center justify-between rounded-lg ${styles[type].bg} py-4 px-5 shadow-lg animate-fade-in-up mb-3`}>
      <div className="flex items-center">
        <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-md bg-white bg-opacity-20">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {styles[type].icon}
          </svg>
        </div>
        <p className="text-sm font-medium text-white">{message}</p>
      </div>
      <button onClick={() => onClose(id)} className="text-white hover:opacity-70">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<{ id: string; type: ToastType; message: string }[]>([]);
  const { props } = usePage();

  // 1. Hàm thêm Toast (Tạo ID ngẫu nhiên để không bị trùng lặp)
  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  // 2. Hàm xóa Toast khi hết thời gian hoặc click đóng
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- LUỒNG 1: XỬ LÝ SESSION FLASH (Dùng sau khi return redirect) ---
  useEffect(() => {
    // Định nghĩa interface rõ ràng cho Flash
    interface FlashData {
      success?: string | string[];
      error?: string | string[];
      warning?: string | string[];
      info?: string | string[];
      flash_id?: number;
      // Dòng này cho phép truy cập index bằng string
      [key: string]: any;
    }
    const flash = props.flash as FlashData;
    if (!flash) return;

    // Quét qua các loại flash phổ biến
    const flashTypes: { key: string; type: ToastType }[] = [
      { key: 'success', type: 'success' },
      { key: 'error', type: 'error' },
      { key: 'warning', type: 'warning' },
      { key: 'info', type: 'info' },
    ];

    flashTypes.forEach(({ key, type }) => {
      if (flash[key]) {
        // Nếu Backend gửi mảng lỗi trong flash, lặp qua từng cái
        if (Array.isArray(flash[key])) {
          flash[key].forEach((msg: string) => addToast(type, msg));
        } else {
          addToast(type, flash[key]);
        }
      }
    });
  }, [props.flash, props.flash?.flash_id, addToast]);

  // --- LUỒNG 2: XỬ LÝ LỖI TRỰC TIẾP (Dùng cho response.status(400/500).send) ---
  useEffect(() => {
    // Lắng nghe sự kiện 'invalid' (Khi server trả về 400, 500...)
    const unbindInvalid = router.on('invalid'  as any, (event: any) => {
      event.preventDefault(); // Chặn Modal lỗi của Inertia
      
      const response = event.detail.response;
      handleServerError(response);
    });

    // Lắng nghe sự kiện 'error' (Lỗi mạng hoặc lỗi không xác định)
    const unbindError = router.on('error', (event) => {
      event.preventDefault();
      // Lỗi này thường là lỗi Validation từ useForm (422)
      // Nếu muốn hiện Toast cho cả lỗi validation thì code ở đây
    });

  // Hàm xử lý bóc tách lỗi
    const handleServerError = (response: any) => {
      if (response && typeof response.data === 'object') {
        const serverErrors = response.data.errors;
        if (Array.isArray(serverErrors)) {
          serverErrors.forEach((err: any) => addToast('error', err.message));
        } else {
          addToast('error', serverErrors?.message || response.data.message || 'Lỗi không xác định');
        }
      } else {
        addToast('error', `Máy chủ phản hồi lỗi: ${response?.status || '500'}`);
      }
    };

  return () => {
    unbindInvalid();
    unbindError();
  };
}, [addToast]);

  return (
    // pointer-events-none để lớp bọc ngoài không ngăn cản click vào form bên dưới
    <div className="fixed top-5 right-5 z-[9999] flex flex-col items-end gap-3 pointer-events-none w-full max-w-[400px]">
      {toasts.map((t) => (
        // pointer-events-auto để người dùng vẫn có thể click nút X trên Toast
        <div key={t.id} className="pointer-events-auto w-full flex justify-end">
          <Toast 
            id={t.id} 
            type={t.type} 
            message={t.message} 
            onClose={removeToast} 
          />
        </div>
      ))}
    </div>
  );
};

export const toast = {
  success: (msg: string) => 
    window.dispatchEvent(new CustomEvent('add-toast', { detail: { type: 'success', message: msg } })),
  error: (msg: string) => 
    window.dispatchEvent(new CustomEvent('add-toast', { detail: { type: 'error', message: msg } })),
  warning: (msg: string) => 
    window.dispatchEvent(new CustomEvent('add-toast', { detail: { type: 'warning', message: msg } })),
};