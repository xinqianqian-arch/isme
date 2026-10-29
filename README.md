# 十一课件 · Eleventy 内容站

这是 11edu.cc 的新版静态 SEO 网站架构。**本分支只做架构演示，不覆盖线上 Cloudflare Pages 项目。** 原始 `index.html`、`aaa.html`、`assets/` 仍然保留。

## 开发

```bash
npm install
npm run dev
npm run build
```

构建目录是 `dist/`，可用 Cloudflare Pages Direct Upload 或 Wrangler 部署。建议先在 Pages 预览环境验证。

## Markdown 内容

- 品牌介绍：`src/about/index.md`
- 教学文章：`content/articles/*.md`
- 课件内容草稿：`content/courses/*.md`
- 教材列表：`src/_data/editions.json`

注意：`content/` 在 Eleventy 输入目录之外。文章和课件内容须由对应的数据加载器或模板挂载才会自动生成页面；当前文章示例请移动到 `src/articles/` 后生成。课件草稿尚未自动发布，避免意外索引占位内容。

## URL

- /textbooks/{pep|jj|bsd}/grade-{1..6}/volume-{1|2}/
- /courses/{stable-slug}/
- /articles/{slug}/
- /about/

## 下一步

迁移现有漂亮首页（保留所有动画与素材），按真实教材版次录入单元和课时、增加课件 Markdown 渲染及购买追踪，最后检查 Sitemap、robots、canonical 和国内访问效果。
