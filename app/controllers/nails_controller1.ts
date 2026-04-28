// app/controllers/nail_styles_controller.ts
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import NailService from '#services/nail_service'

@inject()
export default class NailStylesController {
  constructor(protected nailService: NailService) {}
  
  async uploadAndProcess({ request, response }: HttpContext) {
    const imageFile = request.file('nail_image')

    if (imageFile) {
      // 1. Đọc file ảnh
      const imagePath = imageFile.tmpPath!
      const image = await loadImage(imagePath)
      
      // 2. Load Model BodyPix
      const net = await bodyPix.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 0.75,
        quantBytes: 2
      })

      // 3. Chuyển ảnh thành Tensor
      const canvas = createCanvas(image.width, image.height)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0)
      const input = tf.browser.fromPixels(canvas as any)

      // 4. Phân đoạn (Segmentation) - Tách phần "người/tay" ra
      const segmentation = await net.segmentPerson(input)

      // 5. Xử lý xóa nền trên Canvas
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const newCanvas = createCanvas(canvas.width, canvas.height)
      const newCtx = newCanvas.getContext('2d')
      const newImageData = newCtx.createImageData(canvas.width, canvas.height)

      for (let i = 0; i < segmentation.data.length; i++) {
        const isPerson = segmentation.data[i] === 1
        // Nếu là người/tay thì giữ nguyên pixel, nếu là nền thì cho Alpha = 0 (trong suốt)
        newImageData.data[i * 4] = imageData.data[i * 4]
        newImageData.data[i * 4 + 1] = imageData.data[i * 4 + 1]
        newImageData.data[i * 4 + 2] = imageData.data[i * 4 + 2]
        newImageData.data[i * 4 + 3] = isPerson ? imageData.data[i * 4 + 3] : 0
      }
      newCtx.putImageData(newImageData, 0, 0)

      // 6. Lưu file PNG trong suốt
      const fileName = `${Date.now()}-processed.png`
      const filePath = join(app.publicPath('uploads/ar-nails'), fileName)
      const buffer = newCanvas.toBuffer('image/png')
      await writeFile(filePath, buffer)

      return response.ok({ url: `/uploads/ar-nails/${fileName}` })
    }
  }
}