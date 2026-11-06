/* 教材版本：网址里的英文缩写、显示名称、版本首页的介绍文字。
   新增版本：在这里加一项，再在 src/content/textbooks/<缩写>/ 下放每册的 .yaml */
export interface Edition {
  slug: string;
  name: string;
  /** 版本首页（/textbooks/<slug>/）的标题、导语和提示 */
  heading: string;
  lead: (bookCount: number) => string;
  note: string;
  /** 教材目录总页上这个版本卡片的说明 */
  card: string;
}

export const EDITIONS: Edition[] = [
  {
    slug: 'bsd',
    name: '北师大版',
    heading: '北师大版数学课件与教材目录',
    lead: n => `覆盖一年级至六年级、上下册，共${n}册数学教材的单元知识地图。每个单元配有知识重点、易错提醒和课堂活动建议，原创互动课件在小红书持续更新。`,
    note: '提示：不同年级正逐步使用修订版教材；页面已注明对应目录版本，选课前请核对手中教材封面和单元名称。',
    card: '一年级至六年级、上下册教材目录与原创备课介绍',
  },
  {
    slug: 'pep',
    name: '人教版',
    heading: '人教版数学备课资料与教材目录',
    lead: () => '人教版（2024 年起新版）小学数学逐课备课：吃透教材、教学设计、趣味活动，以及 AI 互动课件怎么用。按教学进度持续更新。',
    note: '提示：人教版新教材正按年级逐步换版；页面已注明对应目录版本，选课前请核对手中教材封面和单元名称。',
    card: '新教材逐课备课：教材解读、教学设计与 AI 互动课件',
  },
];

export const editionBySlug = (slug: string) => EDITIONS.find(e => e.slug === slug);
export const editionByName = (name: string) => EDITIONS.find(e => e.name === name);
