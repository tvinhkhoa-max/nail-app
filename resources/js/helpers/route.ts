import { route as ziggyRoute } from 'ziggy-js'

export function route(name: string, params?: any): string {
  // Lấy config từ window (đảm bảo bạn đã gán window.Ziggy ở app.tsx)
  const config = (window as any).Ziggy

  // .toString() sẽ chuyển đổi đối tượng Router của Ziggy thành chuỗi URL
  // return ziggyRoute(name, params, true, config).toString()
  // Nếu config chưa tồn tại hoặc không có danh sách routes, báo lỗi rõ ràng
  if (!config || !config.routes) {
    return '#'
  }

  // Kiểm tra xem tên route có tồn tại trong danh sách không
  if (!config.routes[name]) {
    console.error(`Route name "${name}" was not found in Ziggy's route list.`)
    return '#'
  }

  try {
    return ziggyRoute(name, params, true, config as any).toString()
  } catch (e) {
    console.error(`Lỗi tạo route cho: ${name}`, e)
    return '#'
  }
}