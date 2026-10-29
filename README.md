# 十一课件 · Eleventy 内容站

这是 [11edu.cc](https://11edu.cc) 的 Eleventy + Markdown 静态站架构。改造提交在独立分支，不会自动覆盖 Cloudflare Pages 线上网站。

**原始 `index.html`、`aaa.html`、`assets/` 完整保留，供后续迁移现有精美首页。** 当前新模板首页是结构验证版，并非原首页的视觉迁移。

## 开发与部署

```bash
npm install
npm run dev
npm run build
```

输出目录为 `dist/`，用于 Cloudflare Pages Direct Upload。部署前先确认导航、素材、Canonical、Sitemap 与 SEO 页面。

## 内容编辑

- 关于页面：`src/about/index.md`
- 教学文章：`src/articles/*.md`，写 `tags: article`
- 课件 Markdown 源文件：`content/courses/*.md`
- 课件详情页：`src/courses/detail.njk` 根据发布课件数据自动生成
- 教材版本：`src/_data/editions.json`

课件 Markdown 的 front matter 至少要有 `slug`、`title`、`description`、`edition`、`editionName`、`grade`、`volume`、`version`、`status: published`。草稿设置 `draft`。

**教材章节数据需要依据实际教材版次核实后再录入**；同一课件版本迭代保持同一个 URL。

## URL 结构

- `/textbooks/{pep|jj|bsd}/grade-{1..6}/`
- `/textbooks/{edition}/grade-{grade}/volume-{1|2}/`（只有已发布课件时生成）
- `/courses/{stable-slug}/`
- `/articles/{slug}/`
- `/about/`

## 安全与后续

不要将 Cloudflare API Token、商品后台凭证提交进仓库。用户曾在聊天中暴露 Token，应在 Cloudflare 中吊销并重新申请。

下一步将原主页样式迁入 `src/index.njk`，补全真实教材单元、课时、版本和课件信息，再部署预览。
