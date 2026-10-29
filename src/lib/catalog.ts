/* 教材目录：把 textbooks/*.yaml 和 lessons、units 里的 Markdown 对应起来，算出每一页的网址。
   网址规则（和旧站一致）：/textbooks/bsd/grade-4/volume-1/unit-04/lesson-02/ */
import { getCollection, type CollectionEntry } from 'astro:content';

export const CN = ['', '一', '二', '三', '四', '五', '六'];
export const EDITION = { slug: 'bsd', name: '北师大版' };
const ROOT = `/textbooks/${EDITION.slug}/`;
/** 课时 Markdown 正文达到这么多字，才让搜索引擎收录这一课 */
export const SEO_MIN_CHARS = 150;

export interface Lesson {
  id: string; order: number; title: string; url: string;
  grade: number; volume: number; volumeName: string; revision: string;
  unit: Unit; book: Book;
  entry?: CollectionEntry<'lessons'>;
  indexable: boolean;
  updated: Date;
}
export interface Unit {
  id: string; order: number; title: string; url: string;
  focus: string; pitfall: string; activity: string;
  grade: number; volume: number; volumeName: string; revision: string;
  book: Book; lessons: Lesson[];
  entry?: CollectionEntry<'units'>;
  updated: Date;
}
export interface Book {
  grade: number; volume: number; volumeName: string; label: string;
  revision: string; updated: Date; url: string; units: Unit[];
}
export interface Catalog { books: Book[]; units: Unit[]; lessons: Lesson[]; grades: { grade: number; url: string; books: Book[] }[] }

const pad = (n: number) => String(n).padStart(2, '0');
/** “四年级上册” → { grade: 4, volume: 1 } */
export function parseLabel(s: string) {
  const m = /^([一二三四五六])年级([上下])册$/.exec(s);
  return m ? { grade: CN.indexOf(m[1]), volume: m[2] === '上' ? 1 : 2 } : null;
}
function plainLength(markdown = '') {
  return markdown.replace(/[#>*_`\-\[\]()!|]/g, '').replace(/\s+/g, '').length;
}
const later = (a: Date, b?: Date) => (b && b > a ? b : a);

let cache: Promise<Catalog> | undefined;
export function getCatalog() {
  return (cache ??= build());
}

async function build(): Promise<Catalog> {
  const raw = (await getCollection('textbooks')).map(e => e.data);
  const vol = (x: string) => (x === '上册' ? 1 : 2);
  raw.sort((a, b) => a.年级 - b.年级 || vol(a.册) - vol(b.册));
  const books: Book[] = [], units: Unit[] = [], lessons: Lesson[] = [];
  const seen = new Set<string>();
  for (const r of raw) {
    const volume = r.册 === '上册' ? 1 : 2, label = `${CN[r.年级]}年级${r.册}`;
    if (seen.has(label)) throw new Error(`教材目录里有两份“${label}”，请删掉一份`);
    seen.add(label);
    const book: Book = { grade: r.年级, volume, volumeName: r.册, label, revision: r.版本, updated: r.更新,
      url: `${ROOT}grade-${r.年级}/volume-${volume}/`, units: [] };
    r.单元.forEach((u, i) => {
      const unit: Unit = { id: `unit-${pad(i + 1)}`, order: i + 1, title: u.名称, url: `${book.url}unit-${pad(i + 1)}/`,
        focus: u.重点, pitfall: u.易错, activity: u.活动, grade: book.grade, volume, volumeName: r.册,
        revision: r.版本, book, lessons: [], updated: r.更新 };
      u.课时.forEach((t, k) => {
        const lesson: Lesson = { id: `lesson-${pad(k + 1)}`, order: k + 1, title: t, url: `${unit.url}lesson-${pad(k + 1)}/`,
          grade: book.grade, volume, volumeName: r.册, revision: r.版本, unit, book, indexable: false, updated: r.更新 };
        unit.lessons.push(lesson); lessons.push(lesson);
      });
      book.units.push(unit); units.push(unit);
    });
    books.push(book);
  }

  const bookOf = (label: string, file: string) => {
    const g = parseLabel(label);
    const b = g && books.find(x => x.grade === g.grade && x.volume === g.volume);
    if (!b) throw new Error(`${file}：教材目录里没有“${label}”`);
    return b;
  };

  // 课时讲解 Markdown → 对应的课时
  for (const e of await getCollection('lessons')) {
    const file = `src/content/lessons/${e.filePath?.split('/').pop() ?? e.id}`;
    const b = bookOf(e.data.年级, file);
    let hits = b.units.flatMap(u => u.lessons).filter(l => l.title === e.data.课题);
    if (e.data.单元) hits = hits.filter(l => l.unit.title === e.data.单元);
    if (hits.length === 0) {
      throw new Error(`${file}：${b.label}没有《${e.data.课题}》这一课。这一册的课题有：\n` +
        b.units.map(u => `  ${u.title}：${u.lessons.map(l => l.title).join('、')}`).join('\n'));
    }
    if (hits.length > 1) throw new Error(`${file}：${b.label}有 ${hits.length} 个《${e.data.课题}》，请加一行“单元: 单元名称”区分`);
    const l = hits[0];
    if (l.entry) throw new Error(`${file}：《${l.title}》已经有一篇课时讲解了（${l.entry.filePath}）`);
    l.entry = e;
    l.indexable = plainLength(e.body) >= SEO_MIN_CHARS;
    l.updated = later(l.updated, e.data.日期);
  }

  // 单元补充 Markdown → 对应的单元
  for (const e of await getCollection('units')) {
    const file = `src/content/units/${e.filePath?.split('/').pop() ?? e.id}`;
    const b = bookOf(e.data.年级, file);
    const u = b.units.find(x => x.title === e.data.单元);
    if (!u) throw new Error(`${file}：${b.label}没有“${e.data.单元}”单元。这一册的单元有：${b.units.map(x => x.title).join('、')}`);
    if (u.entry) throw new Error(`${file}：“${u.title}”单元已经有一篇补充说明了（${u.entry.filePath}）`);
    u.entry = e;
    u.updated = later(u.updated, e.data.日期);
  }

  const grades = [1, 2, 3, 4, 5, 6].map(grade => ({ grade, url: `${ROOT}grade-${grade}/`, books: books.filter(b => b.grade === grade) }));
  return { books, units, lessons, grades };
}
