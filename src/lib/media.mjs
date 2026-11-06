/* 图片、视频、音频都放在 Cloudflare R2 公开桶 11aike-media，用这个域名访问（见 docs/media-storage.md）。
   网站代码、文章插图、上传脚本、构建检查都从这里取，别处不要再写死。 */
export const MEDIA_URL = 'https://media.11aike.com';
/** media('brand/avatar.webp') → https://media.11aike.com/brand/avatar.webp */
export const media = path => `${MEDIA_URL}/${path.replace(/^\/+/, '')}`;
