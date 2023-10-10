export const isProd = process.env.NODE_ENV === 'production';
export const isLocal = process.env.NODE_ENV === 'development';

export const showLogger = isLocal
    ? true
    : process.env.NEXT_PUBLIC_SHOW_LOGGER === 'true' ?? false;

// const defaultUrl =
// const prodApiUrl =
// const localApiUrl =
// export const baseUrl = isProd ? prodApiUrl : isLocal ? localApiUrl : defaultUrl;