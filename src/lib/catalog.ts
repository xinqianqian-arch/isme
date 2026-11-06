/* 教材目录：把 textbooks/<版本>/*.yaml 和 lessons、units 里的 Markdown 对应起来，算出每一页的网址。
   网址规则（北师大版和旧站一致）：/textbooks/<版本>/grade-4/volume-1/unit-04/lesson-02/ */
import { getCollection, type CollectionEntry } from 'astro:content';
import { EDITIONS, editionByName, type Edition } from './editions';

export const CN = ['', '一', '二', '三', '四', '五', '六'];
/** 课时 Markdown 正文达到这么多字，才让搜索引擎收录这一课 */
export const SEO_MIN_CHARS = 150;

export interface Lesson {
  id: string; order: number; title: string; url: string;
  edition: Edition; grade: number; volume: number; volumeName: string; revision: string;
  unit: Unit; book: Book;
  entry?: CollectionEntry<'lessons'>;
  /** 有完整备课（正文够长，会被搜索引擎收录） */
  indexable: boolean;
  updated: Date;
  /** 知识点：开头信息的“知识点”，不写就从“标题”里《课题》后面那段取 */
  topic?: string;
  /** 列表缩略图：正文里第一张 webp 插画 */
  thumb?: string;
  /** 教材页码，如“第 2–3 页” */
  pages?: string;
}
export interface Unit {
  id: string; order: number; title: string; url: string;
  focus: string; pitfall: string; activity: string;
  edition: Edition; grade: number; volume: number; volumeName: string; revision: string;
  book: Book; lessons: Lesson[];
  entry?: CollectionEntry<'units'>;
  updated: Date;
}
export interface Book {
  edition: Edition; grade: number; volume: number; volumeName: string; label: string;
  revision: string; updated: Date; url: string; units: Unit[];
}
/** 一册的配图：第一个写了“封面”的课的封面（单元封面），没有就用年级插画 */
export function bookImage(b: Book) {
  return b.units.flatMap(u => u.lessons).find(l => l.entry?.data.封面)?.entry?.data.封面 ?? null;
}
export interface Grade { edition: Edition; grade: number; url: string; books: Book[] }
export interface Catalog {
  books: Book[]; units: Unit[]; lessons: Lesson[]; grades: Grade[];
  /** 有教材目录的版本，按 editions.ts 里的顺序 */
  editions: { edition: Edition; url: string; books: Book[]; grades: Grade[] }[];
}

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
const fileName = (e: { filePath?: string; id: string }) => e.filePath ?? e.id;

let cache: Promise<Catalog> | undefined;
export function getCatalog() {
  return (cache ??= build());
}

async function build(): Promise<Catalog> {
  const vol = (x: string) => (x === '上册' ? 1 : 2);
  const raw = (await getCollection('textbooks')).map(e => {
    const slug = (e.filePath ?? '').split('/').slice(-2, -1)[0];
    const edition = EDITIONS.find(x => x.slug === slug);
    if (!edition) throw new Error(`${fileName(e)}：教材目录要放在 src/content/textbooks/<版本缩写>/ 下，可用的版本：${EDITIONS.map(x => x.slug).join('、')}（见 src/lib/editions.ts）`);
    return { edition, d: e.data };
  });
  raw.sort((a, b) => EDITIONS.indexOf(a.edition) - EDITIONS.indexOf(b.edition) || a.d.年级 - b.d.年级 || vol(a.d.册) - vol(b.d.册));

  const books: Book[] = [], units: Unit[] = [], lessons: Lesson[] = [];
  const seen = new Set<string>();
  for (const { edition, d: r } of raw) {
    const volume = vol(r.册), label = `${CN[r.年级]}年级${r.册}`;
    const key = `${edition.name}${label}`;
    if (seen.has(key)) throw new Error(`教材目录里有两份“${key}”，请删掉一份`);
    seen.add(key);
    const book: Book = { edition, grade: r.年级, volume, volumeName: r.册, label, revision: r.版本, updated: r.更新,
      url: `/textbooks/${edition.slug}/grade-${r.年级}/volume-${volume}/`, units: [] };
    r.单元.forEach((u, i) => {
      const unit: Unit = { id: `unit-${pad(i + 1)}`, order: i + 1, title: u.名称, url: `${book.url}unit-${pad(i + 1)}/`,
        focus: u.重点, pitfall: u.易错, activity: u.活动, edition, grade: book.grade, volume, volumeName: r.册,
        revision: r.版本, book, lessons: [], updated: r.更新 };
      u.课时.forEach((t, k) => {
        const lesson: Lesson = { id: `lesson-${pad(k + 1)}`, order: k + 1, title: t, url: `${unit.url}lesson-${pad(k + 1)}/`,
          edition, grade: book.grade, volume, volumeName: r.册, revision: r.版本, unit, book, indexable: false, updated: r.更新 };
        unit.lessons.push(lesson); lessons.push(lesson);
      });
      book.units.push(unit); units.push(unit);
    });
    books.push(book);
  }

  /** Markdown 开头写的“教材”（不写默认北师大版）+“年级” → 对应的那一册 */
  const bookOf = (editionName: string, label: string, file: string) => {
    const ed = editionByName(editionName);
    if (!ed) throw new Error(`${file}：没有“${editionName}”这个教材版本，可用的有：${EDITIONS.map(x => x.name).join('、')}`);
    const g = parseLabel(label);
    const b = g && books.find(x => x.edition === ed && x.grade === g.grade && x.volume === g.volume);
    if (!b) throw new Error(`${file}：教材目录里没有“${ed.name}${label}”`);
    return b;
  };

  // 课时讲解 Markdown → 对应的课时
  for (const e of await getCollection('lessons')) {
    const file = fileName(e);
    const b = bookOf(e.data.教材, e.data.年级, file);
    let hits = b.units.flatMap(u => u.lessons).filter(l => l.title === e.data.课题);
    if (e.data.单元) hits = hits.filter(l => l.unit.title === e.data.单元);
    if (hits.length === 0) {
      throw new Error(`${file}：${b.edition.name}${b.label}没有《${e.data.课题}》这一课。这一册的课题有：\n` +
        b.units.map(u => `  ${u.title}：${u.lessons.map(l => l.title).join('、') || '（还没录入课题）'}`).join('\n'));
    }
    if (hits.length > 1) throw new Error(`${file}：${b.label}有 ${hits.length} 个《${e.data.课题}》，请加一行“单元: 单元名称”区分`);
    const l = hits[0];
    if (l.entry) throw new Error(`${file}：《${l.title}》已经有一篇课时讲解了（${l.entry.filePath}）`);
    l.entry = e;
    l.indexable = plainLength(e.body) >= SEO_MIN_CHARS;
    l.topic = e.data.知识点 ?? /》([^：:》]+?)教学设计/.exec(e.data.标题 ?? '')?.[1]?.trim();
    l.thumb = /\]\((https:\/\/media\.11aike\.com\/[^\s)]+\.webp)/.exec(e.body ?? '')?.[1];
    l.pages = e.data.页码;
    l.updated = later(l.updated, e.data.日期);
  }

  // 单元补充 Markdown → 对应的单元
  for (const e of await getCollection('units')) {
    const file = fileName(e);
    const b = bookOf(e.data.教材, e.data.年级, file);
    const u = b.units.find(x => x.title === e.data.单元);
    if (!u) throw new Error(`${file}：${b.edition.name}${b.label}没有“${e.data.单元}”单元。这一册的单元有：${b.units.map(x => x.title).join('、')}`);
    if (u.entry) throw new Error(`${file}：“${u.title}”单元已经有一篇补充说明了（${u.entry.filePath}）`);
    u.entry = e;
    u.updated = later(u.updated, e.data.日期);
  }

  const editions = EDITIONS.map(edition => {
    const eb = books.filter(b => b.edition === edition);
    const grades = [1, 2, 3, 4, 5, 6]
      .map(grade => ({ edition, grade, url: `/textbooks/${edition.slug}/grade-${grade}/`, books: eb.filter(b => b.grade === grade) }))
      .filter(g => g.books.length > 0);
    return { edition, url: `/textbooks/${edition.slug}/`, books: eb, grades };
  }).filter(x => x.books.length > 0);
  return { books, units, lessons, grades: editions.flatMap(x => x.grades), editions };
}
