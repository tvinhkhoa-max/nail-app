import '../css/app.css'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'

const appName = import.meta.env.VITE_APP_NAME || 'AdonisJS'

const setupApp = () => {
  // Lấy dữ liệu thô từ DOM để kiểm tra
  const el = document.getElementById('app')
  if (!el) return
  
  // Parse dữ liệu từ thẻ div#app
  const pageData = JSON.parse(el.dataset.page || '{}')

  // Đánh chặn toàn cục sự kiện 'invalid'
  // router.on('invalid' as any, (event: any) => {
  //   // QUAN TRỌNG: Chặn đứng Modal mặc định của Inertia
  //   event.preventDefault()
    
  //   // Bạn có thể console.log để debug xem dữ liệu bay về đúng không
  //   console.log('Backend response:', event.detail.response.data)
  // })

  createInertiaApp({
    progress: { color: '#5468FF' },

    title: (title) => `${title} - ${appName}`,

    // Ép buộc dùng dữ liệu đã parse thủ công
    page: pageData,

    resolve: (name) =>
      resolvePageComponent(
        `./pages/${name}.tsx`,
        import.meta.glob('./pages/**/*.tsx')
      ) as Promise<any>,

    setup({ el, App, props }) {
      const ziggyData = (props.initialPage.props as any).ziggy
      // Kiểm tra nếu có dữ liệu thì gán
      if (ziggyData) {
        (window as any).Ziggy = ziggyData
      }

      if (el) {
        createRoot(el).render(<App {...props} />)
      } else {
        console.error("Lỗi: Không tìm thấy thẻ #app")
      }
    },
  })
}

document.addEventListener('DOMContentLoaded', setupApp)