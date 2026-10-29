/* 结构化数据（JSON-LD）：告诉搜索引擎和 AI 每个页面是什么、谁写的、在网站的哪个位置 */
import { SITE } from '../site.config';

export const abs = (path: string) => new URL(path, SITE.url).href;

export function person() {
  return {
    '@type': 'Person', '@id': abs('/#author'), name: SITE.author.name, jobTitle: SITE.author.jobTitle,
    description: SITE.author.description, homeLocation: SITE.author.location,
    url: abs('/about/'), image: abs('/assets/avatar.webp'), sameAs: [SITE.xhs.profile],
  };
}

export function website() {
  return {
    '@context': 'https://schema.org', '@type': 'WebSite', '@id': abs('/#website'), name: SITE.name, url: abs('/'),
    inLanguage: 'zh-CN', description: SITE.description, publisher: { '@id': abs('/#author') },
  };
}

export function breadcrumb(items: { name: string; url?: string }[]) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, ...(it.url ? { item: abs(it.url) } : {}) })),
  };
}

export function article(a: { title: string; description: string; url: string; date: Date; updated?: Date }) {
  return {
    '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.description, url: abs(a.url),
    inLanguage: 'zh-CN', datePublished: a.date.toISOString().slice(0, 10),
    dateModified: (a.updated ?? a.date).toISOString().slice(0, 10),
    author: { '@id': abs('/#author'), '@type': 'Person', name: SITE.author.name }, image: abs(SITE.shareImage),
  };
}

/** 单元页的“学什么 / 易错点 / 课堂活动”按问答标注，方便 AI 直接引用 */
export function faq(qa: [string, string][]) {
  return {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: qa.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}
