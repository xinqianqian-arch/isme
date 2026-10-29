/* 允许搜索引擎收录的页面（= 网站地图的内容）。课时页只有写了足够长的课时讲解才收录。 */
import { getCatalog } from './catalog';
import { getArticles, articleUrl } from './articles';

export interface IndexedPage { url: string; lastmod?: Date }
const max = (ds: (Date | undefined)[]) => ds.filter(Boolean).sort((a, b) => b!.getTime() - a!.getTime())[0];

export async function getIndexedPages(): Promise<IndexedPage[]> {
  const { books, units, lessons, grades } = await getCatalog();
  const articles = await getArticles();
  const catalogDate = max(units.map(u => u.updated));
  const articleDate = max(articles.map(a => a.data.更新 ?? a.data.日期));
  return [
    { url: '/', lastmod: max([catalogDate, articleDate]) },
    { url: '/textbooks/', lastmod: catalogDate },
    { url: '/textbooks/bsd/', lastmod: catalogDate },
    ...grades.map(g => ({ url: g.url, lastmod: max(g.books.map(b => b.updated)) })),
    ...books.map(b => ({ url: b.url, lastmod: b.updated })),
    ...units.map(u => ({ url: u.url, lastmod: u.updated })),
    ...lessons.filter(l => l.indexable).map(l => ({ url: l.url, lastmod: l.updated })),
    { url: '/articles/', lastmod: articleDate },
    ...articles.map(a => ({ url: articleUrl(a.id), lastmod: a.data.更新 ?? a.data.日期 })),
    { url: '/about/' },
    { url: '/courses/' },
  ];
}
