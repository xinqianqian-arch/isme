# 十一课件 · 11edu.cc

Eleventy + Markdown 静态教学内容站，使用现有 **Cloudflare Pages + GitHub 集成**发布。

## 原始首页保留在哪里？

根目录 `index.html` 是原始精美首页，`assets/` 保存原有图片和贴纸。构建不会改写这些源文件：只在生成的 `dist/index.html` 中增加教材导航与 SEO 元信息。

## 首次接通自动发布

在现有 Cloudflare Pages 项目设置：

- 生产分支：`main`
- 构建命令：`npm run build`
- 构建输出目录：`dist`
- 根目录：留空
- Framework preset：`None`（使用手动配置，避免默认 `_site`）
- Node.js：`.nvmrc` 指定 `22`；如有 `NODE_VERSION` 环境变量也用 `22`

然后将通过检查的 PR 合并到 main，Cloudflare 自动构建发布。**只修改 GitHub 工作流不会自动修改 Cloudflare 控制台的构建设置。**

详细步骤见 [Cloudflare Git 自动发布说明](docs/cloudflare-git-deployment.md)。不需要额外部署 Token，不需要上传 ZIP。

## 本地使用

```bash
npm install
npm run check
npm run build
```

`dist/` 为唯一发布目录，不要上传仓库根目录。开发时可使用 `npm run dev` 预览模板；正式首页增强、Sitemap 和 AI 索引以 `npm run build` 的完整产物为准。

## 构建流程

清理 dist → Eleventy 生成目录/文章/课时 → 保留首页并增加导航 → 生成 Sitemap 和 AI 摘要 → 验证发布文件。

验证包括：首页关键区块、Sitemap 对应文件及 Canonical、noindex 排除、robots 声明、AI JSON，以及防止源代码目录混入发布产物。

GitHub Actions 的 `.github/workflows/static.yml` 负责在 main、开发分支和 PR 中运行构建检查及打包；它不再发布 GitHub Pages。Cloudflare 在 Git 推送后独立构建，并不消费 Actions 中的 ZIP。

## 编辑位置

| 内容 | 文件 |
| --- | --- |
| 首页原始设计与动画 | `index.html` |
| 关于我 | `src/about/index.md` |
| 教学文章 | `src/articles/*.md` |
| 教材目录与单元介绍 | `content/textbooks/bsd/catalog.json` |
| 每一讲原创内容、演示和商品链接 | `content/lessons/<ref>.md` |
| 独立课件产品 | `content/courses/*.md` |
| 公共页面布局 | `src/_includes/layouts/base.njk` |
| 导流主页与站点信息 | `src/_data/site.json` |
| Sitemap / AI 索引 | `scripts/finish-build.mjs` |

未填写独立商品链接时暂时跳转至十一课件小红书主页。不要声称尚未制作的课件已可购买或下载。

## 当前内容范围与限制

目前数据包含北师大版 12 册、81 个主要单元、323 个课时导航。教材修订版与既有版仍需逐项复核。323 个课时页主要复用单元资料，默认 noindex，并非已完成的逐课 SEO 内容。独立补充后可设置 `publishSeo: true`；代码中的字数检查只是编辑防误发措施，不是搜索引擎质量规则。

自动生成 `robots.txt`、`sitemap.xml`、`llms.txt`、`llms-full.txt`、`ai-index.json`。AI 索引用于辅助发现公开内容，不保证抓取或收录；站点本身也不保证排名或获客。

之前在聊天中公开过的 Token 应撤销。不要把任何 Token 写入代码、工作流或构建产物。
