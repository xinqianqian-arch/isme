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
  '<link rel="stylesheet" href="/css/home-navigation.css">\n' +
  '<script type="application/ld+json">' + schema + '</script>\n';
html = html.replace(/<\/head>/i, metadata + '</head>');
const nav = '<nav class="edu-nav" aria-label="主导航"><a class="edu-brand" href="/">十一课件</a><div><a href="/textbooks/bsd/">教材目录</a><a href="/courses/">课件展厅</a><a href="/articles/">教学文章</a><a href="/about/">关于我</a></div></nav>';
html = html.replace(/<body([^>]*)>/i, '<body$1>\n' + nav);
const names = ['一', '二', '三', '四', '五', '六'];
const cards = names.map((name, index) => {
  const grade = index + 1;
  const books = catalog.books.filter(book => book.grade === grade);
  return '<article class="edu-grade"><span>GRADE ' + grade + '</span><h3><a href="/textbooks/bsd/grade-' + grade + '/">' + name + '年级数学</a></h3><p>按单元查看知识重点与课堂活动</p><div>' + books.map(book => '<a href="/textbooks/bsd/grade-' + grade + '/volume-' + book.volume + '/">' + (book.volume === 1 ? '上册' : '下册') + ' →</a>').join('') + '</div></article>';
}).join('');
const catalogSection = '<section class="edu-catalog" id="curriculum"><div class="wrap"><p class="edu-kicker">北师大版 · 小学数学</p><h2>按教材找到下一节课</h2><p class="edu-summary">从一年级到六年级，按上下册、单元和课题查找教学参考。未制作完成的课件会标注状态，后续更新不改变课程入口。</p><div class="edu-grades">' + cards + '</div><p class="edu-footnote">不同修订版教材的目录可能不同，请核对手中教材。本站为独立教学参考网站，并非教材出版社官方网站。</p></div></section>';
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
