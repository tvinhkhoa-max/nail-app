// app/controllers/bookings_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
// import app from '@adonisjs/core/services/app'
// import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
// import { Boom } from '@hapi/boom'
// import qrcode from 'qrcode-terminal'

export default class BookingsController {
  /**
   * Hiển thị danh sách (Index)
   */
  async index({ inertia }: HttpContext) {
    const bookings = [
      { id: 1, customer: 'Chị Mai', service: 'Sơn Gel' }
    ]
    return inertia.render('bookings/index', { bookings })
  }

  /**
   * Hiển thị form tạo mới (Create)
   */
  async create({ inertia }: HttpContext) {
    return inertia.render('bookings/create')
  }

  /**
   * Xử lý lưu dữ liệu (Store)
   */
  async store({ request, response, session }: HttpContext) {
    // 1. Lấy dữ liệu từ form
    const data = request.all()
    
    // 2. Logic lưu database (Ví dụ: await Booking.create(data))
    console.log('Dữ liệu nhận được:', data)

    // 3. Thông báo và điều hướng
    session.flash('success', 'Đặt lịch thành công!')
    return response.redirect().toPath('/admin/bookings')
  }

  async reserve({ request }: HttpContext) {
    const payload = request.all()
    return await this.sendMessageTelegram(payload);
    // const GROUP_ID = "120363408407193729@g.us";
    // const message = `
    //   🌟 *CÓ LỊCH HẸN MỚI - NAILSXANH* 🌟
    //   ---------------------------
    //   👤 *Khách:* ${payload['name']}
    //   📞 *Di động:* ${payload['phone']}
    //   📅 *Ngày:* ${payload['date']}
    //   ⏰ *Giờ:* ${payload['time']}
    //   💅 *Dịch vụ:* ${payload['service'] || "Tư vấn"}
    //   ---------------------------
    //   _Team kiểm tra lịch và confirm nhé!_`;
    
    // const { state, saveCreds } = await useMultiFileAuthState(app.makePath('tmp/whatsapp_auth'))

    // const sock = makeWASocket({
    //   auth: state,
    //   // printQRInTerminal: true, // Quét lại QR nếu thấy trong terminal
    //   browser: ['NailsXanh', 'Chrome', '146.0.7680.80'], // Đặt tên app của bạn
    //   connectTimeoutMs: 60000,
    //   defaultQueryTimeoutMs: 0,
    // });

    // // 2. Lắng nghe sự kiện kết nối
    // sock.ev.on('connection.update', (update) => {
    //   // const { connection, lastDisconnect } = update
    //   const { connection, lastDisconnect, qr } = update

    //   if (connection === 'close') {
    //     const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
    //     console.log('Kết nối đóng do:', lastDisconnect?.error, ', đang thử lại:', shouldReconnect)
    //     // Nếu không phải do logout, bạn có thể gọi lại hàm khởi tạo ở đây
    //   } else if (connection === 'open') {
    //     console.log('Đã kết nối WhatsApp thành công!')
    //   }
    // })

    // sock.ev.on('creds.update', saveCreds)

    // try {
    //   // gửi message vào group
    //   setTimeout(async () => {
    //     await sock.sendMessage(
    //       GROUP_ID,
    //       { text: message }
    //     )
    //   }, 10000)
    // } catch (error) {
    //   console.error("Lỗi gửi tin nhắn:", error)
    //   return { success: false }
    // }
  }

  async sendMessageTelegram(data: any) {
    // #-3560405816
    const { name, phone, date, time } = data;
    const token = "8597210493:AAGddW8Irf55XC07R6lzB84pe_9kSpVPn8c"; // Token từ BotFather
    const chatId = "-5273394489"

    const message = `
  🌟 *CÓ ĐƠN ĐẶT LỊCH MỚI* 🌟
  -------------------------
  👤 *Khách hàng:* ${name}
  📞 *Số điện thoại:* ${phone}
  📅 *Ngày hẹn:* ${date}
  ⏰ *Giờ hẹn:* ${time}
  -------------------------
  _Tin nhắn tự động từ NailsXanh_
    `;

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown', // Để hiển thị in đậm, in nghiêng
        }),
      });

      return { success: res.ok };
    } catch (error) {
      console.error("Lỗi gửi Telegram:", error);
      return { success: false };
    }
  }

  async show({ inertia }: HttpContext) {
    return inertia.render('bookings/show')
  }
}