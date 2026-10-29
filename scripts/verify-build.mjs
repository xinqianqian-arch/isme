import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

// Run after generation in BOTH Cloudflare and GitHub Actions.
const root = path.resolve('dist');
const required = ['index.html', '404.html', 'robots.txt', 'sitemap.xml', 'llms.txt',
  'llms-full.txt', 'ai-index.json', 'assets/avatar.webp',
  'css/site.css', 'css/home-navigation.css'];
for (const name of required) {
  const file = path.join(root, name);
  assert(fs.existsSync(file) && fs.statSync(file).size > 0, `Missing/empty output: ${name}`);
}
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const id of ['hero', 'avatar', 'stickers', 'works', 'curriculum']) {
  assert(home.includes(`id="${id}"`), `Original homepage or curriculum section missing: ${id}`);
}
assert(home.includes('https://www.xiaohongshu.com/user/profile/5e502cc200000000010010c6'),
  'Creator profile link missing');
assert(home.includes('href="/textbooks/bsd/"'), 'Homepage curriculum navigation missing');
const xml = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert(urls.length > 0, 'Sitemap has no URLs');
assert(new Set(urls).size === urls.length, 'Duplicate Sitemap URL');
for (const value of urls) {
  const url = new URL(value);
  assert(url.origin === 'https://11edu.cc' && !url.search && !url.hash,
    `Non-canonical Sitemap URL: ${value}`);
  assert(url.pathname.endsWith('/'), `Unexpected page URL: ${value}`);
  const file = path.resolve(root, '.' + decodeURIComponent(url.pathname), 'index.html');
  assert(file.startsWith(root + path.sep), 'Path escapes output directory');
  assert(fs.existsSync(file), `Sitemap page missing: ${value}`);
  const html = fs.readFileSync(file, 'utf8');
  assert(!/<meta\b[^>]*\bcontent=["'][^"']*noindex/i.test(html), `noindex URL in Sitemap: ${value}`);
  assert(/<link\b[^>]*rel=["']canonical["'][^>]*>/i.test(html), `Missing canonical: ${value}`);
  assert(html.includes(`href="${value}"`), `Canonical URL mismatch: ${value}`);
  assert(/<meta\b[^>]*name=["']description["'][^>]*>/i.test(html), `Missing description: ${value}`);
}
assert(fs.readFileSync(path.join(root, 'robots.txt'), 'utf8')
  .includes('Sitemap: https://11edu.cc/sitemap.xml'), 'robots.txt Sitemap declaration missing');
const report = JSON.parse(fs.readFileSync('build-report.json', 'utf8'));
const ai = JSON.parse(fs.readFileSync(path.join(root, 'ai-index.json'), 'utf8'));
assert(report.indexable === urls.length, 'Build report disagrees with Sitemap');
assert(ai.url === 'https://11edu.cc' && Array.isArray(ai.catalog), 'Invalid AI index');
// Publishing the repository root would expose source files. Only dist/ is deployable.
for (const name of ['.git', 'node_modules', 'src', 'content', 'package.json', '.env', 'build-report.json', 'assets/profile.json']) {
  assert(!fs.existsSync(path.join(root, name)), `Source/private file in published output: ${name}`);
}
console.log(`Deployment checks passed: original homepage sections retained, ${urls.length} Sitemap URLs verified.`);
