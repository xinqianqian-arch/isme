# 十一课件 11edu.cc · 正式 SEO 内容站

基于 Eleventy 3、Markdown 和 Cloudflare Pages Direct Upload 的小学数学教学资源网站。

## 当前范围

- 保留现有精美首页及全部原始 `assets/`，增加教材检索入口。
- 北师大版 1—6 年级上下册共 12 册目录与 81 个原创单元备课指南。
- 按已核实课题建立课时导航（课件未完成时不承诺下载或出售）。
- Markdown 文章与课件独立更新。
- `robots.txt`、自动 `sitemap.xml`、`llms.txt`、`llms-full.txt`、`ai-index.json`、JSON-LD、Canonical、OpenGraph 和 404。
- 所有暂未填写商品链接的 CTA 暂时跳转到十一课件小红书创作者主页。

## 安装、构建

```bash
npm install
npm run build
npm run dev
```

`dist/` 是 Cloudflare Pages 的唯一部署目录。所有 12 册与单元、课程页由 Eleventy 自动生成。
`scripts/finish-build.mjs` 在 Eleventy 完成后自动统计索引页面并生成 sitemap 和 AI 索引文件。

## 编辑内容

- 主站简介：`src/about/index.md`
- 教学文章：`src/articles/*.md`
- 教材单元资料：`content/textbooks/bsd/catalog.json`
- 每一讲的原创补充与链接：`content/lessons/<ref>.md`
- 课件产品 Markdown：`content/courses/*.md`
- 公共模板：`src/_includes/layouts/base.njk`
- 课程单元模板：`src/textbooks/unit.njk`
- AI 摘要与 Sitemap 自动生成：`scripts/finish-build.mjs`

课时页只有填写足够原创内容并设置 `publishSeo: true` 后才允许被索引；这可以避免大量薄内容问题。

**教材提醒：** 按公开资料整理的目录包含新修订与既有版，不同学校的教材使用情况、版次和具体课题可能不同。请与实际教材核对。

## Cloudflare Pages Direct Upload

1. 先在 GitHub Actions 下载名为 `11edu-site-dist` 的构建产物，检查是否完整。
2. 预览上传到 Cloudflare Pages 的 preview 环境，重点测试首页、年级目录、移动端和 sitemap。
3. 验收后在正式 Pages 项目选择 Create deployment，上传 dist 文件。
4. 如以后希望自动部署，创建最小权限 Cloudflare API Token 并在 GitHub Secrets 设置 `CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`、`CLOUDFLARE_PAGES_PROJECT`，使用 Wrangler 部署。

之前在聊天中暴露过的 Token 必须撤销，**不要提交到仓库或工作流明文**。

当前开发分支为 `feature/eleventy-content-seo`，确认 CI 通过后再合并。
