/* 文章里单独占一段的图片、视频、音频：![说明](https://media.11aike.com/lessons/xx/light.webp "图注")
   图片 → <figure><img …><figcaption>图注</figcaption></figure>，补上宽高（加载时页面不跳）和延迟加载；
   .mp4 → 带封面的播放器（封面是同名的 -poster.webp），.mp3 → 音频条。
   这些文件都要先上传到 R2（npm run media -- put …，见 docs/media-storage.md）；文件不存在时构建会报出是哪一个。 */
import { MEDIA_URL } from './media.mjs';

export { MEDIA_URL };
const VIDEO = ['mp4', 'webm'], AUDIO = ['mp3', 'm4a', 'ogg'];

/** 读出图片的宽高：svg 看 viewBox，png / webp / jpg 看文件头 */
function size(buf, src) {
  if (src.endsWith('.svg')) {
    const m = /viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(buf.toString('utf8'));
    return m && [+m[1], +m[2]];
  }
  if (buf.readUInt32BE(0) === 0x89504e47) return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  if (buf.toString('ascii', 8, 12) === 'WEBP') {
    const kind = buf.toString('ascii', 12, 16);
    if (kind === 'VP8 ') return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
    if (kind === 'VP8L') { const b = buf.readUInt32LE(21); return [(b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1]; }
    if (kind === 'VP8X') return [buf.readUIntLE(24, 3) + 1, buf.readUIntLE(27, 3) + 1];
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    for (let i = 2; i + 9 < buf.length; i += 2 + buf.readUInt16BE(i + 2)) {
      const m = buf[i + 1];
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
    }
  }
  return null;
}

const el = (tagName, properties, children = []) => ({ type: 'element', tagName, properties, children });
const text = value => ({ type: 'text', value });

/** 视频、音频：<figure><video|audio …><figcaption>图注</figcaption></figure> */
function player(src, ext, alt, caption) {
  if (!src.startsWith(MEDIA_URL + '/')) throw new Error(`视频、音频 ${src} 要先上传到 R2（npm run media -- put …），再用 ${MEDIA_URL}/ 开头的网址`);
  const fallback = el('a', { href: src }, [text('下载' + (VIDEO.includes(ext) ? '视频' : '音频'))]);
  const media = VIDEO.includes(ext)
    ? el('video', { src, poster: src.replace(/\.\w+$/, '-poster.webp'), controls: true, preload: 'metadata', playsinline: true, 'aria-label': alt }, [fallback])
    : el('audio', { src, controls: true, preload: 'none', 'aria-label': alt }, [fallback]);
  return el('figure', {}, caption ? [media, el('figcaption', {}, [text(caption)])] : [media]);
}

/** 从 R2 读图片开头的一小段，算出宽高。同一次构建里同一张图只读一次 */
const sizes = new Map();
function remoteSize(src) {
  if (!sizes.has(src)) sizes.set(src, (async () => {
    let res;
    // 加一次性参数：图片还没上传时，别让 CDN 把“不存在”缓存到正式网址上
    try { res = await fetch(`${src}?size=${Date.now()}`, { headers: { Range: 'bytes=0-65535' } }); }
    catch (e) { console.warn(`⚠ 暂时读不到 ${src}（${e.message}），这张图先不写宽高`); return null; }
    if (res.status === 404) throw new Error(`文章里的图片 ${src} 在 R2 上找不到，先用 npm run media -- put 上传`);
    if (!res.ok) { console.warn(`⚠ 读取 ${src} 返回 ${res.status}，这张图先不写宽高`); return null; }
    return size(Buffer.from(await res.arrayBuffer()), src);
  })());
  return sizes.get(src);
}

/** 把 <p><img></p> 换成 <figure><img><figcaption>图注</figcaption></figure> */
async function figure(img) {
  const p = { ...img.properties };
  const src = String(p.src ?? '');
  const ext = src.split(/[?#]/)[0].split('.').pop().toLowerCase();
  if (VIDEO.includes(ext) || AUDIO.includes(ext)) return player(src, ext, String(p.alt ?? ''), p.title ? String(p.title) : '');
  if (src.startsWith('/')) throw new Error(`文章里的图片 ${src}：图片都放在 R2 上了，先用 npm run media -- put 上传，再写 ${MEDIA_URL}/ 开头的网址`);
  if (src.startsWith(MEDIA_URL + '/')) {
    const wh = await remoteSize(src);
    if (wh) [p.width, p.height] = wh;
  }
  p.loading = 'lazy';
  p.decoding = 'async';
  const caption = p.title;
  delete p.title;
  const children = [el('img', p)];
  if (caption) children.push(el('figcaption', {}, [text(String(caption))]));
  return el('figure', {}, children);
}

const blank = n => n.type === 'text' && !n.value.trim();

/** Astro 默认的 Markdown 处理器（Sätteri）的 HTML 插件 */
export default {
  name: 'figure',
  element: {
    filter: ['p'],
    async visit(node, ctx) {
      const kids = node.children.filter(k => !blank(k));
      if (kids.length === 1 && kids[0].type === 'element' && kids[0].tagName === 'img') ctx.replaceNode(node, await figure(kids[0]));
    },
  },
};
