import React, { useState } from 'react'
import { Link } from '@inertiajs/react'

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-2 dark:bg-dark">
      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 w-[290px] h-screen transition-transform bg-white dark:bg-dark-2 border-r border-stroke dark:border-dark-3 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-stroke dark:border-dark-3">
          <Link href="/" className="text-xl font-bold text-primary">
            💅 NAIL MANAGER
          </Link>
        </div>

        <div className="py-6 px-4">
          <nav>
            <ul className="space-y-2">
              <SidebarItem href="/" label="Dashboard" icon="📊" active />
              <SidebarItem href="/admin/bookings" label="Lịch hẹn" icon="📅" />
              <SidebarItem href="/admin/services" label="Dịch vụ" icon="💅" />
              <SidebarItem href="/admin/staff" label="Nhân viên" icon="👩‍🎨" />
              <SidebarItem href="/admin/nails/cates" label="Loại Nail" icon="👩‍🎨" />
              <SidebarItem href="/admin/nails/collections" label="Bộ sưu tập Nail" icon="👩‍🎨" />
              <SidebarItem href="/admin/nails" label="Kiểu Nail" icon="👩‍🎨" />
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      {/* <div className="flex flex-col flex-1 w-full overflow-y-auto">
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-dark-2 border-b border-stroke dark:border-dark-3 lg:justify-end">
          <button
            onClick={() => setOpen(!open)}
            className="block lg:hidden text-dark dark:text-white"
          >
            ☰
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium dark:text-white">Admin QA</span>
            <div className="w-10 h-10 rounded-full bg-gray-300"></div>
          </div>
        </header>

        <main className="p-6">{children}</main> 
      </div>*/}
    </div>
  )
}

// Component con cho từng item menu
function SidebarItem({ href, label, icon, active = false }: any) {
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
        <span className="text-lg">{icon}</span>
        {label}
      </Link>
    </li>
  )
}