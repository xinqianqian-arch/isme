/* 给 AI 读的完整内容摘要：/llms-full.txt */
import type { APIRoute } from 'astro';
import { getCatalog, CN } from '../lib/catalog';
import { SITE } from '../site.config';

export const GET: APIRoute = async () => {
  const { books } = await getCatalog();
  const B = SITE.url;
  const lines = [
    '# 十一课件 - 公开教学资源目录',
    '',
    '这是网站提供的机器可读内容摘要，不包含教材正文或付费资源。',
    '',
    ...books.flatMap(b => [
      `## 北师大版${CN[b.grade]}年级${b.volumeName}（${b.revision}）`,
      `链接：${B}${b.url}`,
      '',
      ...b.units.flatMap(u => [
        `### ${u.title}`,
        `教学重点：${u.focus}`,
        `常见易错：${u.pitfall}`,
        `课堂活动：${u.activity}`,
        `链接：${B}${u.url}`,
        '',
      ]),
    ]),
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
