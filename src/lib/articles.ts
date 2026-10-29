import { getCollection } from 'astro:content';

/** 发布的文章（草稿不算），新的在前；文件名就是网址，只能用小写英文、数字和连字符 */
export async function getArticles() {
  const list = (await getCollection('articles', a => !a.data.草稿))
    .sort((a, b) => b.data.日期.getTime() - a.data.日期.getTime() || a.id.localeCompare(b.id));
  for (const a of list) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(a.id)) {
      throw new Error(`${a.filePath}：文章文件名会成为网址，只能用小写英文、数字和连字符（比如 tiananmen-guangchang.md）`);
    }
  }
  return list;
}
export const articleUrl = (id: string) => `/articles/${id}/`;
export const ymd = (d: Date) => d.toISOString().slice(0, 10);
