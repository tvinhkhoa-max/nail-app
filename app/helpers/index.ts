import axios from 'axios'
import fs from 'fs/promises'
import config from '@adonisjs/core/services/config'

export const changeStatus = (value: number) => {
  const statusText = config.get('custom.statusMap') as any;

  return statusText[value] as string;
};

export const getImageUpload = (path: string | null) => {
  if (!path) return '/placeholder-nail.png'; // Ảnh mặc định nếu data trống

  if (path.startsWith('http')) return path;

  // const baseUrl = process.env.SUPABASE_URL_STATIC_IMAGE
  const baseUrl = (process.env.APP_ENV && process.env.APP_ENV != 'development' ? process.env.SUPABASE_URL_STATIC_UPLOAD : process.env.LOCAL_URL_STATIC_UPLOAD)

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
};

export const getPathImageUpload = () => {

  return (process.env.APP_ENV && process.env.APP_ENV != 'development' ? process.env.SUPABASE_URL_STATIC_UPLOAD : process.env.LOCAL_URL_STATIC_UPLOAD);

}

// Helper để lấy Buffer từ bất kỳ nguồn nào
export async function getImageBuffer(urlOrPath: string) {
  if (urlOrPath.startsWith('http')) {
    // Nếu là link CDN
    const response = await axios.get(urlOrPath, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  } else {
    // Nếu là file cục bộ (sau khi upload)
    // return await fs.readFile(publicPath(urlOrPath));
    return await fs.readFile((urlOrPath));
  }
}