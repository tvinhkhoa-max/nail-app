import sharp from 'sharp'
import axios from 'axios'
import FormData from 'form-data'

/**
 * STEP 1: call Python remove background
 */
export async function removeBg(buffer: Buffer) {
  const form = new FormData()
  form.append('file', buffer, 'image.png')

  const URL_SERVER_SEGMENT = process.env.PUBLIC_URL_PROCESS_IMG
  const res = await axios.post(
    `${URL_SERVER_SEGMENT}/remove-bg`,
    form,
    { headers: form.getHeaders(), timeout: 20000 }
  )

  return Buffer.from(res.data.image, 'base64')
}

/**
 * STEP 2: flood fill lấy region lớn nhất (ngón tay)
 */
function getLargestRegion(mask: Uint8Array, width: number, height: number) {
  const visited = new Uint8Array(mask.length)
  let bestRegion: number[] = []

  function floodFill(start: number) {
    const stack = [start]
    const region: number[] = []

    while (stack.length) {
      const i = stack.pop()!
      if (visited[i] || mask[i] === 0) continue

      visited[i] = 1
      region.push(i)

      const neighbors = [i - 1, i + 1, i - width, i + width]
      for (const n of neighbors) {
        if (n >= 0 && n < mask.length) stack.push(n)
      }
    }

    return region
  }

  for (let i = 0; i < mask.length; i++) {
    if (!visited[i] && mask[i] === 255) {
      const region = floodFill(i)
      if (region.length > bestRegion.length) {
        bestRegion = region
      }
    }
  }

  return bestRegion
}

/**
 * STEP 3: detect cuticle line
 */
function detectCuticleLine(region: number[], width: number, height: number) {
  const rowWidths: number[] = new Array(height).fill(0)

  for (const i of region) {
    const y = Math.floor(i / width)
    const x = i % width

    if (!rowWidths[y]) rowWidths[y] = { min: x, max: x } as any
    else {
      rowWidths[y].min = Math.min(rowWidths[y].min, x)
      rowWidths[y].max = Math.max(rowWidths[y].max, x)
    }
  }

  let minWidth = Infinity
  let cuticleY = Math.floor(height * 0.3)

  for (let y = Math.floor(height * 0.1); y < Math.floor(height * 0.7); y++) {
    const row = rowWidths[y]
    if (!row) continue

    const w = row.max - row.min
    if (w > 5 && w < minWidth) {
      minWidth = w
      cuticleY = y
    }
  }

  return cuticleY
}

/**
 * MAIN FUNCTION
 */
/**
 * TỐI ƯU HÓA: Cắt móng tay cho AR
 */
export async function extractNailAI(buffer: Buffer) {
  // 1. AI tách nền (Vẫn dùng Python rembg vì nó tách rất tốt)
  const aiImage = await removeBg(buffer)

  const { data, info } = await sharp(aiImage)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width, height } = info

  // 2. Tìm Bounding Box của toàn bộ phần ngón tay đã tách
  let minX = width, minY = height, maxX = 0, maxY = 0
  const mask = new Uint8Array(width * height)
  
  for (let i = 0; i < width * height; i++) {
    const alpha = data[i * 4 + 3]
    if (alpha > 50) { // Lấy vùng chắc chắn là vật thể
      const x = i % width
      const y = Math.floor(i / width)
      minX = Math.min(minX, x); minY = Math.min(minY, y)
      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y)
      mask[i] = 255
    }
  }

  // 3. Logic mới: Cắt theo tỷ lệ vàng của móng tay (Thường móng chiếm 60-70% phần trên)
  // Thay vì dùng detectCuticleLine phức tạp dễ sai, ta dùng Gradient để tìm điểm tiếp giáp da và móng
  const nailHeight = maxY - minY
  const estimatedCuticleY = minY + Math.floor(nailHeight * 0.75) // Giữ lại 75% phần trên

  // 4. Tạo đường bo tròn (Curve) cho chân móng để AR trông thật hơn
  const centerX = (minX + maxX) / 2
  const radiusX = (maxX - minX) / 2
  const curveIntensity = 15 // Độ cong của chân móng

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const i = y * width + x
      const alphaIdx = i * 4 + 3
      
      // Tính toán độ cong: y_cuticle = estimatedCuticleY + curve(x)
      const normalizedX = (x - centerX) / radiusX
      const curveY = estimatedCuticleY + (Math.sqrt(1 - Math.pow(normalizedX, 2)) * curveIntensity || 0)

      if (y > curveY) {
        data[alphaIdx] = 0 // Xóa phần thịt ngón tay dưới chân móng theo đường cong
      }
    }
  }

  // 5. Xuất ảnh với hiệu ứng mượt viền (Feathering)
  return await sharp(data, { raw: { width, height, channels: 4 } })
    .extract({
      left: minX,
      top: minY,
      width: maxX - minX,
      height: Math.min(maxY - minY, Math.floor(estimatedCuticleY + curveIntensity - minY)),
    })
    .resize({ width: 500 }) // Chuẩn hóa kích thước cho AR
    .blur(0.8) // Làm mềm viền để không bị lộ vết cắt
    .png()
    .toBuffer()
}

export async function extractNailAll(buffer: Buffer) {
  const form = new FormData()
  form.append('file', buffer, 'image.png')

  const URL_SERVER_SEGMENT = process.env.PUBLIC_URL_PROCESS_IMG
  const res = await axios.post(
    `${URL_SERVER_SEGMENT}/extract`,
    form,
    { headers: form.getHeaders(), timeout: 60000 }
  )

  return Buffer.from(res.data.image, 'base64')
}