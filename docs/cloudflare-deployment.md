# Cloudflare 发布说明

11edu.cc 由 Cloudflare **Worker `11ai`** 提供（Workers 静态资源，没有自定义脚本），不是 Pages 项目。
仓库根目录的 `wrangler.jsonc` 描述了这个 Worker：发布 `dist/` 目录，自定义域名 `11edu.cc`。

## 自动发布（Workers Builds）

`11ai` → Settings → Build 连接 GitHub 仓库 `xinqianqian-arch/isme`：

| 项目 | 值 |
| --- | --- |
| 分支 | `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` |
| 环境变量 | `NODE_VERSION` = `22` |

之后每次推送到 `main`，Cloudflare 会安装依赖、运行 `npm run build`（构建自带检查，失败就不会发布），再用 `wrangler deploy` 把 `dist/` 发布到 11edu.cc。
GitHub Actions（`.github/workflows/static.yml`）只做构建检查，不负责发布。

## 手动发布 / 预览（需要有 Workers Scripts 编辑权限的 API token）

```bash
npm ci && npm run build
export CLOUDFLARE_ACCOUNT_ID=b71f81b110b4503677894266360bc757 CLOUDFLARE_API_TOKEN=...   # 不要写进仓库
npx wrangler versions upload   # 只生成预览网址，不影响线上
npx wrangler deploy            # 发布到 11edu.cc
```

## 回退

Cloudflare 后台 → Workers & Pages → `11ai` → Deployments，选上一个版本 Rollback。

## 注意

- 发布内容只有 `dist/`；不要把仓库根目录直接上传。
- `content/xhs/profile.json` 是小红书原始资料（含个人信息），只作素材留档，不进入发布目录。
- 不要把任何 token 写进代码、配置或工作流。
