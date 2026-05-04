import React, { useState } from 'react'
import Sidebar from '#resource/components/Sidebar';
import { ToastContainer } from '#resource/components/Toast';

export default function Layout({ children }: { children: React.ReactNode }) {

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-2 dark:bg-dark overflow-hidden">
      {/* 1. Backdrop Overlay (Chỉ hiện trên Mobile khi Sidebar mở) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. Sidebar Container */}
      <Sidebar children={<></>} />

      {/* 3. Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header tối ưu cho Mobile */}
        <header className="sticky top-0 z-30 flex items-center justify-between w-full px-4 py-3 bg-white dark:bg-dark-2 border-b border-stroke dark:border-dark-3">
          {/* Hamburger Button */}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center w-10 h-10 border rounded-md border-stroke lg:hidden text-dark dark:text-white"
          >
            ☰
          </button>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium dark:text-white">Admin QA</p>
            </div>
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Nail" 
              className="w-9 h-9 rounded-full border border-stroke" 
              alt="User" 
            />
          </div>
        </header>

        {/* Content có thể cuộn độc lập */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-full mx-auto">
            {children}
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  )
}

// function MenuItem({ href, label, icon, active = false }: any) {
//   return (
//     <li>
//       <Link
//         href={href}
//         className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all ${
//           active
//             ? 'bg-primary text-white shadow-lg shadow-primary/30'
//             : 'text-body-color dark:text-dark-6 hover:bg-gray-100 dark:hover:bg-white/5'
//         }`}
//       >
//         <span className="text-xl">{icon}</span>
//         {label}
//       </Link>
//     </li>
//   )
// }