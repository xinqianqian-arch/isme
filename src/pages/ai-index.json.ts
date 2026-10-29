/* 给程序读的结构化教材目录：/ai-index.json */
import type { APIRoute } from 'astro';
import { getCatalog } from '../lib/catalog';
import { SITE } from '../site.config';

export const GET: APIRoute = async () => {
  const { books, units } = await getCatalog();
  const B = SITE.url;
  const updated = units.map(u => u.updated).sort((a, b) => b.getTime() - a.getTime())[0];
  const ai = {
    schemaVersion: '1.0',
    name: SITE.name,
    url: B,
    language: 'zh-CN',
    description: '北师大版小学数学教材导航与原创单元备课指南；原创互动课件在创作者小红书主页持续更新。',
    disclaimer: '独立原创教学参考网站，非北京师范大学出版社官方网站。教材章节以实际使用的教材版次为准。',
    author: { name: SITE.author.name, description: SITE.author.description, xiaohongshu: SITE.xhs.profile },
    primarySitemap: `${B}/sitemap.xml`,
    llms: `${B}/llms.txt`,
    catalogUpdated: updated.toISOString().slice(0, 10),
    catalog: books.map(b => ({
      edition: '北师大版', grade: b.grade, volume: b.volume, revision: b.revision, url: B + b.url,
      units: b.units.map(u => ({ title: u.title, url: B + u.url, description: u.focus, commonMistake: u.pitfall, activity: u.activity })),
    })),
  };
  return new Response(JSON.stringify(ai, null, 2) + '\n', { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
