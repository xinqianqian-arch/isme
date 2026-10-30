/* 构建后检查（Cloudflare 和 GitHub Actions 都会跑）：任何一项不通过，这次就不会发布 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve('dist');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const exists = f => fs.existsSync(path.join(root, f));

// 1. 必须有的文件
for (const f of ['index.html', '404.html', 'robots.txt', 'sitemap.xml', 'llms.txt', 'llms-full.txt', 'ai-index.json',
  '_headers', 'aaa.html', 'assets/avatar.webp', 'textbooks/bsd/index.html', 'courses/index.html', 'about/index.html']) {
  assert(exists(f) && fs.statSync(path.join(root, f)).size > 0, `缺少文件或文件为空：${f}`);
}

// 2. 首页关键栏目都在
const home = read('index.html');
for (const id of ['hero', 'stickers', 'avatar', 'works', 'curriculum']) assert(home.includes(`id="${id}"`), `首页缺少栏目 #${id}`);
assert(home.includes('https://www.xiaohongshu.com/user/profile/5e502cc200000000010010c6'), '首页缺少小红书主页链接');
assert(home.includes('googletagmanager.com/gtag/js') && home.includes('hm.baidu.com/hm.js'), '首页缺少访问统计代码（Google Analytics / 百度统计）');

// 3. 网站地图里的每个网址：页面存在、没有 noindex、规范网址一致、有描述
const xml = read('sitemap.xml');
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
assert(urls.length > 100, `网站地图网址太少：${urls.length}`);
assert(new Set(urls).size === urls.length, '网站地图有重复网址');
for (const u of urls) {
  const url = new URL(u);
  assert(url.origin === 'https://11edu.cc' && url.pathname.endsWith('/') && !url.search, `网站地图网址不规范：${u}`);
  const file = path.join(root, decodeURIComponent(url.pathname), 'index.html');
  assert(fs.existsSync(file), `网站地图里的页面不存在：${u}`);
  const html = fs.readFileSync(file, 'utf8');
  assert(!/<meta name="robots" content="[^"]*noindex/.test(html), `网站地图里出现了 noindex 页面：${u}`);
  assert(html.includes(`<link rel="canonical" href="${u}">`), `规范网址不一致：${u}`);
  assert(/<meta name="description" content="[^"]+">/.test(html), `缺少页面描述：${u}`);
  assert(/<h1[\s>]/.test(html), `缺少 H1 标题：${u}`);
}

// 4. 所有页面都有标题；不在网站地图里的页面必须是 noindex（404 除外）
const all = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name === 'index.html') all.push(p); } })(root);
const inMap = new Set(urls.map(u => decodeURIComponent(new URL(u).pathname)));
let noindex = 0;
for (const f of all) {
  const html = fs.readFileSync(f, 'utf8');
  const p = '/' + path.relative(root, path.dirname(f)).split(path.sep).join('/') + '/';
  const page = p === '//' ? '/' : p;
  assert(/<title>[^<]+<\/title>/.test(html), `缺少 <title>：${page}`);
  if (!inMap.has(page)) { assert(/<meta name="robots" content="noindex/.test(html), `页面既不在网站地图也没有 noindex：${page}`); noindex++; }
}

// 5. robots、AI 索引
assert(read('robots.txt').includes('Sitemap: https://11edu.cc/sitemap.xml'), 'robots.txt 没有声明网站地图');
const ai = JSON.parse(read('ai-index.json'));
assert(ai.url === 'https://11edu.cc' && ai.catalog.length === 12, 'ai-index.json 内容不对');

// 6. 源码、私密资料不能被发布
for (const f of ['materials', 'xhs-profile.json', 'assets/profile.json', 'src', 'node_modules', 'package.json', '.env', 'wrangler.jsonc']) {
  assert(!exists(f), `不该发布的文件出现在 dist/ 里：${f}`);
}

console.log(`构建检查通过：${all.length} 个页面，网站地图 ${urls.length} 个网址，${noindex} 个页面不让收录`);
