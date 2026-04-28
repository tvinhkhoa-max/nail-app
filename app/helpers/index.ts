import config from '@adonisjs/core/services/config'

export const changeStatus = (value: number) => {
  const statusText = config.get('custom.statusMap') as any;

  return statusText[value] as string;
};

export const getImageUpload = (path: string | null) => {
  if (!path) return '/placeholder-nail.png'; // Ảnh mặc định nếu data trống

  if (path.startsWith('http')) return path;

  // const baseUrl = process.env.SUPABASE_URL_STATIC_IMAGE
  const baseUrl = (process.env.NODE_ENV && process.env.NODE_ENV != 'development' ? process.env.SUPABASE_URL_STATIC_UPLOAD : process.env.LOCAL_URL_STATIC_UPLOAD)

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
};

export const getPathImageUpload = () => {

  return (process.env.NODE_ENV && process.env.NODE_ENV != 'development' ? process.env.SUPABASE_URL_STATIC_UPLOAD : process.env.LOCAL_URL_STATIC_UPLOAD);

}