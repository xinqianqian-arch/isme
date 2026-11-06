/* 找课搜索用的索引：/search.json。教材目录页和首页的搜索框第一次聚焦时才下载 */
import type { APIRoute } from 'astro';
import { getCatalog, CN } from '../lib/catalog';

export const GET: APIRoute = async () => {
  const { lessons, units } = await getCatalog();
  // “三下”“3下”“三年级下册”都能搜到
  const tags = (g: number, v: string) => `${CN[g]}年级${v} ${CN[g]}${v[0]} ${g}${v[0]}`;
  const items = [
    ...lessons.map(l => ({
      t: l.title, k: l.topic ?? '', u: l.url, b: `${l.edition.name}${CN[l.grade]}年级${l.volumeName}`,
      n: l.unit.title, p: l.pages ?? '', a: l.indexable ? 1 : 0, s: tags(l.grade, l.volumeName),
    })),
    ...units.map(u => ({
      t: u.title, k: '单元', u: u.url, b: `${u.edition.name}${CN[u.grade]}年级${u.volumeName}`,
      n: `${u.lessons.length} 课`, p: '', a: 0, s: tags(u.grade, u.volumeName), unit: 1,
    })),
  ];
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
