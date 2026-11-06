/* 网站素材上传到 Cloudflare R2，规划见 docs/media-storage.md
 *
 *   npm run media -- put <本地文件> <路径>                上传到公开桶 11aike-media → https://media.11aike.com/<路径>
 *   npm run media -- put <本地文件> <路径> --private      上传到私有桶 11aike-vault（AI 原图、课件源文件）
 *   npm run media -- video <输入视频> <输出.mp4>           转成网页用的 MP4，并截一张同名的 -poster.webp 封面
 *   npm run media -- audio <输入音频> <输出.mp3> [--music]  转成 MP3：朗读 64kbps 单声道；--music 用 128kbps 立体声
 *
 * 公开桶里已经有同名文件时，要加 --overwrite 才会覆盖，覆盖后自动刷新 CDN 缓存。
 * 上传需要环境变量 CLOUDFLARE_API_TOKEN 和 CLOUDFLARE_ACCOUNT_ID，只在命令行里临时传入，不要写进任何文件。 */
import { execFileSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { MEDIA_URL } from '../src/lib/figure-plugin.mjs';

const BUCKET = { public: '11aike-media', private: '11aike-vault' };
const ZONE_11AIKE = 'fcfdf137604487cb237b396b6fb582a9';
/** 公开桶的一级目录，网址只用小写英文、数字、- _ . / */
const PUBLIC_DIRS = ['lessons', 'articles', 'courseware', 'brand'];
const PRIVATE_DIRS = ['originals', 'courseware-src', 'backup'];
const TYPES = {
  webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', svg: 'image/svg+xml',
  mp4: 'video/mp4', webm: 'video/webm', mp3: 'audio/mpeg', m4a: 'audio/mp4', ogg: 'audio/ogg', wav: 'audio/wav',
  vtt: 'text/vtt; charset=utf-8', json: 'application/json; charset=utf-8', txt: 'text/plain; charset=utf-8', md: 'text/markdown; charset=utf-8',
  html: 'text/html; charset=utf-8', pdf: 'application/pdf', zip: 'application/zip', glb: 'model/gltf-binary', gltf: 'model/gltf+json',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  psd: 'image/vnd.adobe.photoshop',
};

const [cmd, ...rest] = process.argv.slice(2);
const flags = new Set(rest.filter(a => a.startsWith('--')));
const args = rest.filter(a => !a.startsWith('--'));
const fail = msg => { console.error(`✘ ${msg}`); process.exit(1); };
const run = (bin, a) => execFileSync(bin, a, { stdio: 'inherit' });

if (cmd === 'put') await put(args[0], args[1]);
else if (cmd === 'video') video(args[0], args[1]);
else if (cmd === 'audio') audio(args[0], args[1]);
else fail('用法见 scripts/media.mjs 开头的说明');

async function put(file, key) {
  if (!file || !key) fail('用法：npm run media -- put <本地文件> <路径> [--private] [--overwrite]');
  if (!existsSync(file)) fail(`找不到文件：${file}`);
  const priv = flags.has('--private');
  key = key.replace(/^\/+/, '');
  const dirs = priv ? PRIVATE_DIRS : PUBLIC_DIRS;
  if (!dirs.includes(key.split('/')[0])) fail(`路径要以 ${dirs.map(d => d + '/').join('、')} 开头：${key}`);
  if (!priv && !/^[a-z0-9][a-z0-9._\-/]*$/.test(key)) fail(`公开素材的路径只能用小写英文、数字和 - _ . /（会出现在网址里）：${key}`);
  const ext = key.split('.').pop().toLowerCase();
  const type = TYPES[ext];
  if (!type) fail(`不认识的文件类型 .${ext}，请在 scripts/media.mjs 的 TYPES 里补上`);
  for (const k of ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID']) if (!process.env[k]) fail(`缺少环境变量 ${k}`);

  const url = `${MEDIA_URL}/${key}`;
  let existed = false;
  if (!priv) {
    try { existed = (await fetch(url, { method: 'HEAD' })).ok; } catch { console.warn(`⚠ 暂时访问不了 ${MEDIA_URL}，跳过“是否已存在”的检查`); }
    if (existed && !flags.has('--overwrite')) fail(`${url} 已经有文件了。确定要替换就加 --overwrite`);
  }

  const mb = (statSync(file).size / 1048576).toFixed(1);
  console.log(`上传 ${file}（${mb}MB）→ ${priv ? BUCKET.private : BUCKET.public}/${key}`);
  run('npx', ['wrangler', 'r2', 'object', 'put', `${priv ? BUCKET.private : BUCKET.public}/${key}`, '--file', file,
    '--content-type', type, ...(priv ? [] : ['--cache-control', 'public, max-age=86400']), '--remote']);

  if (existed) {
    const r = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE_11AIKE}/purge_cache`, {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: [url] }),
    }).then(x => x.json()).catch(e => ({ success: false, errors: [{ message: e.message }] }));
    console.log(r.success ? '已刷新 CDN 缓存' : `⚠ CDN 缓存没刷新成功（${r.errors?.[0]?.message}），最迟一天后生效`);
  }
  if (!priv) {
    console.log(`\n网址：${url}\nMarkdown 里这样写：\n![说明这是什么](${url} "图注")`);
    if (['mp4', 'webm'].includes(ext)) console.log(`别忘了上传同名封面：${key.replace(/\.\w+$/, '-poster.webp')}`);
  }
}

function video(input, output) {
  if (!input || !output?.endsWith('.mp4')) fail('用法：npm run media -- video <输入视频> <输出.mp4>');
  // H.264 + AAC，最宽 1280（720p），moov 放到文件开头，边下边播
  run('ffmpeg', ['-hide_banner', '-y', '-i', input, '-vf', "scale='min(1280,iw)':-2", '-c:v', 'libx264', '-preset', 'slow',
    '-crf', '23', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', output]);
  const poster = output.replace(/\.mp4$/, '-poster.webp');
  run('ffmpeg', ['-hide_banner', '-y', '-ss', '1', '-i', output, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '80', poster]);
  console.log(`\n已生成 ${output} 和封面 ${poster}（封面也可以换成自己做的图，文件名不变）`);
}

function audio(input, output) {
  if (!input || !output?.endsWith('.mp3')) fail('用法：npm run media -- audio <输入音频> <输出.mp3> [--music]');
  const music = flags.has('--music');
  run('ffmpeg', ['-hide_banner', '-y', '-i', input, '-vn', '-c:a', 'libmp3lame', '-b:a', music ? '128k' : '64k', '-ac', music ? '2' : '1', output]);
}
