/* 网站基本信息：名称、网址、小红书主页、创作者。改这里，全站跟着变。 */
export const SITE = {
  name: '十一课件',
  tagline: '让数学课动起来',
  url: 'https://11aike.com',
  description: '十一课件：北师大版小学数学1—6年级同步教材目录、单元知识点、课堂教学思路与原创互动课件更新。',
  homeTitle: '十一课件 · 北师大版小学数学课程目录与互动教学',
  /** 分享到微信、小红书等平台时显示的封面图 */
  shareImage: '/assets/art/teacher.webp',
  xhs: {
    profile: 'https://www.xiaohongshu.com/user/profile/5e502cc200000000010010c6',
    id: '834134750',
  },
  /** 访问统计：Google Analytics 衡量 ID、百度统计站点代码（hm.js? 后面那串）。只在正式构建时加入页面 */
  analytics: {
    google: 'G-3G5WMXPYVH',
    baidu: '83f6e606a8b0d4bac2c62a03372af4d4',
  },
  /** 创作者信息：用于搜索引擎和 AI 识别“十一课件”背后是谁 */
  author: {
    name: '十一老师',
    jobTitle: '小学数学教师',
    location: '天津',
    description: '一线小学数学老师，用 AI 自研 1–6 年级北师大版数学互动课件。',
  },
};
