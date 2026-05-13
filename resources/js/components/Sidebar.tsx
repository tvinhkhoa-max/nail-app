import React, { useState } from 'react'
import { Link, usePage } from '@inertiajs/react'

export default function Sidebar({ isCollapsed, children }: { isCollapsed: boolean, children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const { url } = usePage();

  return (
    <div className="flex h-screen bg-gray-2 dark:bg-dark">
      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-white dark:bg-dark-2 border-r border-stroke dark:border-dark-3 lg:static lg:translate-x-0 ${
          isCollapsed ? 'w-20' : 'w-[290px]'
        }`}
      >
        {/* LOGO AREA */}
        <div className="flex items-center h-[73px] px-6 border-b border-stroke dark:border-dark-3 overflow-hidden">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-2xl min-w-[32px]">💅</span>
            {/* Ẩn chữ khi thu gọn */}
            {!isCollapsed && (
              <span className="text-xl font-bold text-primary truncate whitespace-nowrap">
                NAIL MANAGER
              </span>
            )}
          </Link>
        </div>

        <div className="py-6 px-4 overflow-y-auto h-[calc(100vh-73px)] hide-scrollbar">
          <nav>
            <ul className="space-y-2">
              <SidebarItem href="/" label="Dashboard" icon="📊" active={url.startsWith('/admin/dashboard')} isCollapsed={isCollapsed} />
              <SidebarItem href="/admin/bookings" label="Lịch hẹn" icon="📅" active={url.startsWith('/admin/bookings')} isCollapsed={isCollapsed} />
              <SidebarItem href="/admin/services" label="Dịch vụ" icon="✨" active={url.startsWith('/admin/services')} isCollapsed={isCollapsed} />
              <SidebarItem href="/admin/staff" label="Nhân viên" icon="👥" isCollapsed={isCollapsed} />
              <SidebarItem href="/admin/nails/cates" label="Loại Nail" icon="📁" active={url.startsWith('/admin/nails/cates')} isCollapsed={isCollapsed} />
              <SidebarItem href="/admin/nails/collections" label="Bộ sưu tập" active={url.startsWith('/admin/nails/collections')} icon="🖼️" isCollapsed={isCollapsed} />
              <SidebarItem href="/admin/nails" label="Kiểu Nail" icon="🎨" isCollapsed={isCollapsed} />
              <SidebarItem href="/admin/news" label="Bản tin" icon="📰" active={url.startsWith('/admin/news')} isCollapsed={isCollapsed} />
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-full overflow-y-auto">
        <main className="w-full">{children}</main> 
      </div>
    </div>
  )
}

// Component con cho từng item menu
function SidebarItem({ href, label, icon, active = false, isCollapsed }: any) {
  return (
    <li>
      <Link
        href={href}
        className={`flex items-center gap-3 px-4 py-3 font-medium rounded-lg transition ${
          active
            ? 'bg-primary/5 text-primary'
            : 'text-body-color dark:text-dark-6 hover:bg-gray-2 dark:hover:bg-white/5'
        }`}
      >
        {/* <span className="text-lg truncate whitespace-nowrap">{icon}</span> */}
        <span className="text-xl min-w-[24px] flex justify-center">{icon}</span>

        {/* Chỉ hiện chữ khi không thu gọn */}
        {!isCollapsed && (
          <span className="truncate whitespace-nowrap animate-fadeIn">
            {label}
          </span>
        )}
      </Link>
    </li>
  )
}