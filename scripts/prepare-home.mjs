import fs from 'node:fs';

// Enhance the generated copy only; keep the original landing page and animation source intact.
const site = JSON.parse(fs.readFileSync('src/_data/site.json', 'utf8'));
const catalog = JSON.parse(fs.readFileSync('content/textbooks/bsd/catalog.json', 'utf8'));
const escape = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let html = fs.readFileSync('index.html', 'utf8');
if (!/<head[\s>]/i.test(html) || !/<body[\s>]/i.test(html)) throw new Error('Invalid original homepage');
const title = '十一课件 · 北师大版小学数学课程目录与互动教学';
html = html.replace(/<title>[\s\S]*?<\/title>/i, '<title>' + escape(title) + '</title>');
html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, '<meta name="description" content="' + escape(site.description) + '">');
html = html.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi, '');
const schema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: site.url + '/', inLanguage: 'zh-CN', description: site.description }).replace(/</g, '\\u003c');
const metadata = '<link rel="canonical" href="' + site.url + '/">\n' +
  '<meta property="og:type" content="website">\n' +
  '<meta property="og:title" content="' + escape(title) + '">\n' +
  '<meta property="og:description" content="' + escape(site.description) + '">\n' +
  '<meta property="og:url" content="' + site.url + '/">\n' +
  '<link rel="stylesheet" href="/css/topbar.css">\n' +
  '<link rel="stylesheet" href="/css/home-navigation.css">\n' +
  '<script type="application/ld+json">' + schema + '</script>\n';
html = html.replace(/<\/head>/i, metadata + '</head>');
// 顶部导航与内页 src/_includes/layouts/base.njk 的 header 保持同样的结构，样式都在 css/topbar.css
const nav = '<header class="topbar"><div class="top-inner"><a class="logo" href="/"><img src="/assets/avatar.webp" width="40" height="40" alt="">十一课件</a>' +
  '<nav aria-label="主导航"><a href="/textbooks/bsd/">教材目录</a><a href="/courses/">课件展厅</a><a href="/articles/">教学文章</a><a href="/about/">关于我</a></nav>' +
  '<a class="nav-xhs" href="' + escape(site.social.xiaohongshu) + '" target="_blank" rel="noopener noreferrer nofollow">小红书 ↗</a></div></header>';
html = html.replace(/<body([^>]*)>/i, '<body$1>\n' + nav);
const names = ['一', '二', '三', '四', '五', '六'];
const cards = names.map((name, index) => {
  const grade = index + 1;
  const books = catalog.books.filter(book => book.grade === grade);
  return '<article class="edu-grade"><a class="pic" href="/textbooks/bsd/grade-' + grade + '/" tabindex="-1" aria-hidden="true"><img src="/assets/lessons/g' + grade + 'a.webp" alt="" loading="lazy"></a><div class="body"><span>GRADE ' + grade + '</span><h3><a href="/textbooks/bsd/grade-' + grade + '/">' + name + '年级数学</a></h3><p>按单元查看知识重点与课堂活动</p><div class="vols">' + books.map(book => '<a href="/textbooks/bsd/grade-' + grade + '/volume-' + book.volume + '/">' + (book.volume === 1 ? '上册' : '下册') + ' →</a>').join('') + '</div></div></article>';
}).join('');
const catalogSection = '<section class="edu-catalog" id="curriculum"><div class="wrap"><div class="sec-head"><h2>按教材找到下一节课 📚</h2><p>北师大版 · 一到六年级 · 按上下册和单元查看教学重点</p></div><div class="edu-grades">' + cards + '</div><p class="edu-footnote">本站为独立教学网站，并非教材出版社官方网站。</p></div></section>';
const insertion = /<section\s+class="works"\s+id="works">/;
if (!insertion.test(html)) throw new Error('Cannot locate original works section; homepage has changed');
html = html.replace(insertion, catalogSection + '\n$&');
html = html.replace('完整目录见小红书主页', '<a href="/textbooks/bsd/">完整教材目录在这里 →</a>');
html = html.replace('全套课件，在小红书薯店等你 🛒', '原创课件与最新进度，在小红书查看');
html = html.replaceAll('去小红书薯店下单 →', '查看小红书主页 →').replaceAll('去小红书下单 →', '查看小红书主页 →');
// All existing card destinations temporarily use the profile, as requested.
html = html.replaceAll('l.href || XHS', 'XHS');
html = html.replace(/href="https:\/\/(?:www\.)?xiaohongshu\.com\/[^"\s]+"/g, 'href="' + escape(site.social.xiaohongshu) + '"');
fs.writeFileSync('dist/index.html', html);
console.log('Homepage enhanced: original hero retained, 6 grade / 12 volume links and canonical added.');
