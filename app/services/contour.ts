import sharp from 'sharp'

export async function extractContourFromAlpha(buffer: Buffer) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const contour: any[] = []

  const width = info.width
  const height = info.height

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4
      const alpha = data[idx + 3]

      if (alpha > 200) {
        // check nếu là edge pixel
        const neighbors = [
          data[idx - 4 + 3],
          data[idx + 4 + 3],
          data[idx - width * 4 + 3],
          data[idx + width * 4 + 3],
        ]

        if (neighbors.some((n) => n < 200)) {
          contour.push({ x, y })
        }
      }
    }
  }

  return contour
}