export const isProd = process.env.NODE_ENV === 'production';
export const isLocal = process.env.NODE_ENV === 'development';

// const defaultUrl = "http://127.0.0.1:5000" 
// const prodApiUrl = "http://127.0.0.1:5000"
// const localApiUrl = "http://127.0.0.1:5000"

const defaultUrl = "http://refinity.pub.hsuni.top:15901" 
const prodApiUrl = "http://refinity.pub.hsuni.top:15901" 
const localApiUrl = "http://refinity.pub.hsuni.top:15901" 
export const baseUrl = isProd ? prodApiUrl : isLocal ? localApiUrl : defaultUrl;