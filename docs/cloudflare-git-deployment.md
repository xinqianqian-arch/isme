# Cloudflare Pages + GitHub 自动发布

本项目采用 Cloudflare Pages 原生 GitHub 集成，不是 Direct Upload。继续使用现有绑定 11edu.cc 的 Pages 项目，不需要新建项目、改 DNS、上传 ZIP 或申请额外的部署 Token。

## 首页在哪里？

原始精美首页一直在仓库根目录 `index.html`。图片、贴纸等在 `assets/`。

`npm run build` 会生成 `dist/index.html`：保留首页原有主体与动画代码，再加入教材入口、Canonical 和分享信息。`scripts/prepare-home.mjs` 只写入 `dist/index.html`，不会修改根目录原稿。

## 控制台一次性设置

打开 Cloudflare → Workers & Pages → 现有 Pages 项目 → Settings → Builds & deployments（部分界面显示 Build）。

| 字段 | 填写值 |
| --- | --- |
| Git repository | xinqianqian-arch/isme（保留现有连接） |
| Production branch | main |
| Framework preset | None / 无（手动填写下面两项） |
| Build command | npm run build |
| Build output directory | dist |
| Root directory | 留空，使用仓库根目录 |
| Node.js | 仓库 `.nvmrc` 已指定 22；若控制台有 NODE_VERSION，设置为 22，避免覆盖成其他版本 |

Production 和 Preview 的构建设置均应保持一致。确认生产分支自动部署已启用；如设置过 build watch paths，不要只监控 index.html，需覆盖 src/、content/、public/、assets/、scripts/ 及配置文件。首次迁移建议保留默认全部文件监控。

特别注意：Eleventy 的预设默认目录可能是 `_site`，本仓库自定义为 `dist`。不要发布仓库根目录 `.`，也不要填 `src`、`public` 或 `dist/index.html`。

Cloudflare 会安装 package.json 中的构建依赖。不要设置会省略 devDependencies 的安装选项，否则无法找到 Eleventy。

## 首次迁移顺序

1. 在控制台先保存上述设置。此操作不会把 PR 内容自动合并到 main。
2. 在 PR #1 的构建检查通过且确认内容发布范围后，将 PR 合并到 main。
3. Cloudflare 自动从 main 安装依赖、运行 npm run build，并发布 dist/。
4. 在 Cloudflare Deployments 中确认生产部署对应的 commit 与合并后的 main 一致，状态为 Success。
5. 检查首页、/textbooks/bsd/、/sitemap.xml、/robots.txt、/llms.txt。

注意：在 PR 合并前，旧 main 尚无 package.json；不要在这个阶段用新配置手动重试旧提交。若误触发，旧提交会构建失败，不代表新版本失败。

## 两套系统各做什么？

- GitHub Actions（`.github/workflows/static.yml`）：检查 JavaScript 语法、构建、验证 SEO 文件和首页、保存 dist ZIP 作为构建产物。
- Cloudflare GitHub 集成：监听 main 推送，独立执行 npm run build，并将 dist 发布到现有域名。

这两条流程是并行的，Cloudflare 不会等待 GitHub Actions 的 ZIP。关键的部署检查因此已包含在 npm run build 中，Cloudflare 本身构建失败就不会发布这次构建。

原先 static.yml 中的 GitHub Pages 发布步骤已替换为纯检查，避免把整仓库源码作为网站发布。没有配置第二条 Wrangler 推送流程，也没有往仓库存放 Cloudflare 凭证。

## 今后怎么更新？

修改 index.html、Markdown 课程/文章、教材数据或图片 → 提交 PR → 查看检查结果 → 合并 main → Cloudflare 自动构建发布。

无需手工修改 dist，无需手工上传 ZIP。Sitemap 和 AI 摘要随每次构建重新生成。

## 常见排查

- 还是老首页且没有教材目录：核对生产部署 commit 是否来自合并后的 main，检查输出目录是否确为 dist。
- eleventy: command not found：检查依赖安装日志，以及是否错误省略 devDependencies。
- 找不到 dist：检查 Build command 是否仍为空或 exit 0；应为 npm run build。
- GitHub 检查绿灯但正式站未更新：到 Cloudflare Deployments 查看；GitHub 检查不等于 Cloudflare 已部署。
- 已发布但需要回退：在 Cloudflare 的部署历史中使用上一个成功的生产部署；不要删除项目或改 DNS。

## 内容状态不因部署而改变

当前数据包含 12 册、81 个单元和 323 个课时导航。目录版次仍待逐项复核；课时没有独立完善内容时保持 noindex。构建成功不代表全部内容完整或已经获得搜索流量。

## 官方参考

- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://developers.cloudflare.com/pages/configuration/build-configuration/
- https://developers.cloudflare.com/pages/configuration/build-image/
