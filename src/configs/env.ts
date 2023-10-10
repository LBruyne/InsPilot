export const isProd = process.env.NODE_ENV === 'production';
export const isLocal = process.env.NODE_ENV === 'development';

const defaultUrl = "http://127.0.0.1:5000"
const prodApiUrl = "http://127.0.0.1:5000"
const localApiUrl = "http://127.0.0.1:5000"
export const baseUrl = isProd ? prodApiUrl : isLocal ? localApiUrl : defaultUrl;