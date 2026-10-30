/* 给 AI 读的网站简介：/llms.txt */
import type { APIRoute } from 'astro';
import { getCatalog, CN } from '../lib/catalog';
import { SITE } from '../site.config';

export const GET: APIRoute = async () => {
  const { books } = await getCatalog();
  const B = SITE.url;
  const lines = [
    '# 十一课件（11aike.com）',
    '',
    '> 一个面向中国小学数学教师的原创互动课件品牌与教学参考站，提供北师大版1—6年级上下册教材导航、单元教学目标、易错提醒和课堂活动思路。',
    '',
    '网站语言：简体中文。本站并非教材出版社官方网站，教科书版次可能变化，请与实际使用的教材核对。',
    '',
    '## 主要入口',
    `- [网站首页](${B}/)`,
    `- [北师大版课程目录](${B}/textbooks/bsd/)`,
    `- [原创课件展厅](${B}/courses/)`,
    `- [教学文章](${B}/articles/)`,
    `- [创作者介绍](${B}/about/)`,
    `- [完整站点地图](${B}/sitemap.xml)`,
    `- [结构化课程索引(JSON)](${B}/ai-index.json)`,
    '',
    '## 教材导航',
    ...books.map(b => `- [北师大版${CN[b.grade]}年级${b.volumeName}（${b.revision}）](${B}${b.url})`),
    '',
    '## 创作者',
    `- ${SITE.author.name}：${SITE.author.description}（${SITE.author.location}）`,
    `- 小红书：${SITE.xhs.profile}（小红书号 ${SITE.xhs.id}）`,
    '',
    '## 内容与使用说明',
    '- 网站提供原创单元知识梳理、常见错误分析和课堂活动建议。',
    '- 原创互动课件的展示与获取方式，见创作者小红书主页。',
    '- 本站允许依法合规地搜索、引用与链接公开的原创内容；请保留来源与原始 URL。',
    '- 本文件旨在辅助发现公开内容，不构成任何搜索引擎或 AI 系统一定抓取、索引本站的保证。',
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
