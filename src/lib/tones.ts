/* 找课页面的配色：每个年级、每个单元一种颜色（和首页的黄、橙、绿、蓝、紫一致），卡片、编号、按钮按它染色 */
/** tone 主色，tint 浅底色，ink 浅底上的文字色，on 主色上的文字色 */
export interface Tone { tone: string; tint: string; ink: string; on: string }
export const TONES: Tone[] = [
  { tone: '#FFC845', tint: '#FFF6D9', ink: '#8A6200', on: '#6B4A00' }, // 黄
  { tone: '#FF7B5C', tint: '#FFEDE6', ink: '#C2492B', on: '#fff' }, // 橙红
  { tone: '#3DC9A4', tint: '#E3F8F1', ink: '#1E8A6C', on: '#fff' }, // 薄荷绿
  { tone: '#5B9DFF', tint: '#E8F1FF', ink: '#2F6FDB', on: '#fff' }, // 天蓝
  { tone: '#8C7BFF', tint: '#EFEBFF', ink: '#5A48D6', on: '#fff' }, // 葡萄紫
  { tone: '#FF9F6B', tint: '#FFF0E4', ink: '#C2622B', on: '#fff' }, // 桃橙
];
/** 第 n 个（从 1 开始）用哪种颜色 */
export const toneOf = (n: number) => TONES[(n - 1) % TONES.length];
/** 写进 style 属性的 CSS 变量 */
export const toneVars = (n: number) => { const t = toneOf(n); return `--tone:${t.tone};--tint:${t.tint};--tink:${t.ink};--on:${t.on}`; };
