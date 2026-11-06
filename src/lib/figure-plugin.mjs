/* 文章里单独占一段的图片：![图片说明](/assets/xx.webp "图注")
   → <figure><img …><figcaption>图注</figcaption></figure>，并补上宽高（加载时页面不跳）和延迟加载。
   图片放在 public/ 下；路径写错时构建会报出是哪张图。 */
import { readFileSync } from 'node:fs';

const PUBLIC = new URL('../../public/', import.meta.url);

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

/** 把 <p><img></p> 换成 <figure><img><figcaption>图注</figcaption></figure> */
function figure(img) {
  const p = { ...img.properties };
  const src = String(p.src ?? '');
  if (src.startsWith('/')) {
    let buf;
    try { buf = readFileSync(new URL('.' + decodeURI(src), PUBLIC)); }
    catch { throw new Error(`文章里的图片 ${src} 找不到：图片要放在 public/ 下，路径从 /assets/ 开始写`); }
    const wh = size(buf, src);
    if (wh) [p.width, p.height] = wh;
  }
  p.loading = 'lazy';
  p.decoding = 'async';
  const caption = p.title;
  delete p.title;
  const children = [{ type: 'element', tagName: 'img', properties: p, children: [] }];
  if (caption) children.push({ type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: String(caption) }] });
  return { type: 'element', tagName: 'figure', properties: {}, children };
}

const blank = n => n.type === 'text' && !n.value.trim();

/** Astro 默认的 Markdown 处理器（Sätteri）的 HTML 插件 */
export default {
  name: 'figure',
  element: {
    filter: ['p'],
    visit(node, ctx) {
      const kids = node.children.filter(k => !blank(k));
      if (kids.length === 1 && kids[0].type === 'element' && kids[0].tagName === 'img') ctx.replaceNode(node, figure(kids[0]));
    },
  },
};
