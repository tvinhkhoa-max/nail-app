import { createClient } from '@supabase/supabase-js'
import imageCompression from 'browser-image-compression'
import { randomUUID } from 'crypto'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)
// export const compressionFile = async(file: Buffer) => {
//   return await imageCompression(file, {
//     maxSizeMB: 0.5,
//     maxWidthOrHeight: 1024,
//   })
// }

// export const uploadImage = async (file: Buffer, fileName: string, filePath: string, compression: boolean = false) => {
//   // const fileName = `${Date.now()}-${file.name}`
//   // let fileCompress: Buffer | null = null
//   // if (compression)
//   //   fileCompress = await compressionFile(file)
//   // else
//   //   fileCompress = file

//   const { data, error } = await supabase.storage
//     .from('images')
//     .upload(`${filePath}\/${filePath}`, file, {
//       upsert: true
//     })

//   if (error) throw error

//   const { data: publicUrl } = supabase.storage
//     .from('images')
//     .getPublicUrl(fileName)

//   return {
//     url: publicUrl.publicUrl,
//     path: filePath,
//   }
// }
export const removeImageStorage = async (pathFile: String) => {
  const { data, error } = await supabase.storage
  .from('images') // tên bucket
  .remove(['collections/abc.jpg']) // path đầy đủ

  if (error) throw error;
}

export const uploadImage = async (
  buffer: Buffer,
  collection: string,
  type: string = 'jpg'
) => {
  const fileName = `${randomUUID()}.${type}`

  // 🔥 normalize để tránh lỗi double slash hoặc thiếu slash
  const folder = collection.replace(/^\/|\/$/g, '')

  const filePath = `${folder}/${fileName}`

  console.log('UPLOAD PATH:', filePath)

  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, buffer,  {
      contentType: `image/${type}`
    })

  if (error) throw error

  const { data: publicData } = supabase.storage
    .from('images')
    .getPublicUrl(filePath)

  return {
    path: filePath,
    url: publicData.publicUrl
  }
}