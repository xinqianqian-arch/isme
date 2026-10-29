/* 内容格式规定：src/content 下的文件少写、写错字段时，构建会指出是哪个文件、哪个字段。 */
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse } from 'yaml';

/** “四年级上册”这样的写法 */
const 年级册 = z.string().regex(/^[一二三四五六]年级[上下]册$/, '请写成“四年级上册”这样的格式');
/** 以 _ 开头的文件（比如 _模板.md）只是模板，不发布 */
const md = (dir: string) => glob({ pattern: ['**/*.md', '!**/_*'], base: `./src/content/${dir}` });

const articles = defineCollection({
  loader: md('articles'),
  schema: z.object({
    标题: z.string(),
    /** 页面上显示的大标题，不写就用“标题” */
    大标题: z.string().optional(),
    简介: z.string(),
    日期: z.coerce.date(),
    更新: z.coerce.date().optional(),
    草稿: z.boolean().default(false),
  }),
});

const lessons = defineCollection({
  loader: md('lessons'),
  schema: z.object({
    年级: 年级册,
    课题: z.string(),
    /** 同一册里有重名的课题时才需要写 */
    单元: z.string().optional(),
    日期: z.coerce.date().optional(),
  }),
});

const units = defineCollection({
  loader: md('units'),
  schema: z.object({ 年级: 年级册, 单元: z.string(), 日期: z.coerce.date().optional() }),
});

const textbooks = defineCollection({
  loader: glob({ pattern: ['**/*.yaml', '!**/_*'], base: './src/content/textbooks' }),
  schema: z.object({
    年级: z.number().int().min(1).max(6),
    册: z.enum(['上册', '下册']),
    版本: z.string(),
    更新: z.coerce.date(),
    参考: z.string().optional(),
    单元: z.array(z.object({
      名称: z.string(),
      重点: z.string(),
      易错: z.string(),
      活动: z.string(),
      课时: z.array(z.string()).default([]),
    })).min(1),
  }),
});

const works = defineCollection({
  // 按文件里的顺序编号 01、02…，页面上按这个顺序显示
  loader: file('src/content/works.yaml', {
    parser: text => (parse(text) as object[]).map((w, i) => ({ id: String(i + 1).padStart(2, '0'), ...w })),
  }),
  schema: z.object({
    年级: z.number().int().min(1).max(6),
    图片: z.string(),
    色调: z.enum(['Y', 'M', 'S', 'P', 'L']),
    标题: z.string(),
    说明: z.string(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: 'about.md', base: './src/content' }),
  schema: z.object({ 标题: z.string(), 简介: z.string() }),
});

export const collections = { articles, lessons, units, textbooks, works, pages };
