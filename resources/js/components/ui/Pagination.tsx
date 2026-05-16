import React from 'react'
import { Link } from '@inertiajs/react'

// Định nghĩa cấu trúc meta chuẩn của AdonisJS v6 Paginate
interface PaginationMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  firstPage: number
}

interface PaginationProps {
  meta: PaginationMeta | null | undefined
}

interface PaginationLink {
  url: string | null
  label: string
  active: boolean
}

export interface PaginatedData<T> {
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
    firstPage: number
  }
  links: PaginationLink[] // Inertia thường bọc sẵn danh sách link hoặc bạn tự sinh từ meta
  data: T[]
}

// Hàm logic tính toán dấu ba chấm (...)
function generatePagination(currentPage: number, lastPage: number) {
  if (lastPage <= 5) {
    return Array.from({ length: lastPage }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];
  pages.push(1);

  const leftBound = Math.max(2, currentPage - 1);
  const rightBound = Math.min(lastPage - 1, currentPage + 1);

  if (leftBound > 2) {
    pages.push('...');
  }

  for (let i = leftBound; i <= rightBound; i++) {
    pages.push(i);
  }

  if (rightBound < lastPage - 1) {
    pages.push('...');
  }

  pages.push(lastPage);
  return pages;
}

export function Pagination({ meta }: PaginationProps) {
  // Nếu không có dữ liệu meta hoặc chỉ có 1 trang duy nhất thì không hiển thị thanh phân trang
  if (!meta || meta.lastPage <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-stroke px-6 py-5 dark:border-dark-3">
      {/* Giao diện Mobile (Chỉ có nút Trước / Sau để tránh vỡ màn hình) */}
      <div className="flex flex-1 justify-between sm:hidden">
        {meta.currentPage > meta.firstPage ? (
          <Link
            href={`?page=${meta.currentPage - 1}`}
            className="relative inline-flex items-center rounded-md border border-stroke bg-white px-4 py-2 text-sm font-medium text-dark hover:bg-gray-50 dark:border-dark-3 dark:bg-dark dark:text-white"
          >
            Trước
          </Link>
        ) : (
          <span className="relative inline-flex items-center rounded-md border border-stroke bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400 dark:border-dark-3 dark:bg-dark-3">
            Trước
          </span>
        )}
        
        {meta.currentPage < meta.lastPage ? (
          <Link
            href={`?page=${meta.currentPage + 1}`}
            className="relative ml-3 inline-flex items-center rounded-md border border-stroke bg-white px-4 py-2 text-sm font-medium text-dark hover:bg-gray-50 dark:border-dark-3 dark:bg-dark dark:text-white"
          >
            Sau
          </Link>
        ) : (
          <span className="relative ml-3 inline-flex items-center rounded-md border border-stroke bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400 dark:border-dark-3 dark:bg-dark-3">
            Sau
          </span>
        )}
      </div>
      
      {/* Giao diện Desktop (Đầy đủ thông số và số trang kèm dấu ...) */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-body-color dark:text-dark-6">
            Hiển thị từ <span className="font-medium">{(meta.currentPage - 1) * meta.perPage + 1}</span> đến{' '}
            <span className="font-medium">{Math.min(meta.currentPage * meta.perPage, meta.total)}</span> trong tổng số{' '}
            <span className="font-medium">{meta.total}</span> kết quả
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            
            {/* Nút lùi về trang đầu tiên « */}
            <Link
              href="?page=1"
              className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-medium border border-stroke dark:border-dark-3 ${
                meta.currentPage === 1 
                  ? 'text-gray-300 pointer-events-none dark:text-dark-6' 
                  : 'text-dark bg-white hover:bg-gray-50 dark:bg-dark dark:text-white dark:hover:bg-dark-3'
              }`}
            >
              «
            </Link>

            {/* Tạo danh sách các nút số và dấu ba chấm */}
            {generatePagination(meta.currentPage, meta.lastPage).map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-400 border border-stroke bg-white dark:border-dark-3 dark:bg-dark"
                  >
                    ...
                  </span>
                );
              }

              const isActive = page === meta.currentPage;
              return (
                <Link
                  key={`page-${page}`}
                  href={`?page=${page}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 ${
                    isActive
                      ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                      : 'text-dark border border-stroke bg-white hover:bg-gray-50 focus:outline-offset-0 dark:border-dark-3 dark:bg-dark dark:text-white dark:hover:bg-dark-3'
                  }`}
                >
                  {page}
                </Link>
              );
            })}

            {/* Nút tiến đến trang cuối cùng » */}
            <Link
              href={`?page=${meta.lastPage}`}
              className={`relative inline-flex items-center rounded-r-md px-3 py-2 text-sm font-medium border border-stroke dark:border-dark-3 ${
                meta.currentPage === meta.lastPage 
                  ? 'text-gray-300 pointer-events-none dark:text-dark-6' 
                  : 'text-dark bg-white hover:bg-gray-50 dark:bg-dark dark:text-white dark:hover:bg-dark-3'
              }`}
            >
              »
            </Link>

          </nav>
        </div>
      </div>
    </div>
  )
}