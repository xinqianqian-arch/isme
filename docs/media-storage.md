# 图片、视频、音频怎么管理

**规则：网站用到的图片、视频、音频全部放在 Cloudflare R2 公开桶 `11aike-media`，通过 `https://media.11aike.com` 访问。** 仓库里只放代码和文字，`public/` 下不再放图片（构建检查会拦）。

| 放哪 | 放什么 |
| --- | --- |
| R2 公开桶 `11aike-media` → `https://media.11aike.com` | 网站上的所有图片（头像、贴纸、作品封面、文章插图和示意图）、视频、音频 |
| R2 私有桶 `11aike-vault`（不对外） | 暂时只有《线段、射线、直线》的 AI 原图备份。以后可以放课件源文件；目前课件放在百度网盘 |
| Git 仓库 | 代码、文章 Markdown、教材目录；`public/` 里只有天安门课件 `aaa.html`、`_headers`、`robots.txt` |

## 目录

```
11aike-media（公开）
  brand/avatar.webp                       头像（网站图标、导航、首页）
  brand/teacher.webp                      十一老师形象图（默认分享封面、首页横幅）
  brand/stickers/o01.webp …               黏土贴纸（首页漂浮贴纸、文章页头图标）
  courseware/covers/g1a.webp …            课件作品封面（works.yaml 的“图片”字段）
  courseware/xhs-notes/00.webp …          小红书笔记封面和课件截图（旧首页用过，暂未使用）
  lessons/pep-3a-lines/…                  一节课的插图、示意图（svg）、分享封面、视频、音频
  articles/<文章文件名>/…                 教学文章的配图
  courseware/<课件名>/…                   互动课件用的贴图、音效、模型

11aike-vault（私有）
  originals/lessons/pep-3a-lines/…        AI 生成原图 + 提示词 + 说明.txt
```

- **一节课一个文件夹**：`lessons/<版本缩写>-<年级册>-<主题英文>/`，比如人教版三上《线段、射线、直线》是 `pep-3a-lines`。
- **视频封面**：视频必须配一张封面，文件名 = 视频名 + `-poster.webp`，比如 `intro.mp4` 配 `intro-poster.webp`。
- **命名**：公开桶的路径会出现在网址里，只用小写英文、数字和 `- _ . /`。
- **换文件**：要换成新的，就直接覆盖（加 `--overwrite`），工具会马上刷新 CDN 缓存。版本管理以后再定。

## 格式

| 类型 | 格式 | 规格 |
| --- | --- | --- |
| 插画、照片 | webp | 宽不超过 1600，质量 80；分享封面 1200×630 |
| 示意图 | svg | 宽 600，字号不小于 17 |
| 视频 | MP4（H.264 + AAC） | 最宽 1280（720p），边下边播；一段 1–3 分钟、50MB 以内 |
| 音频 | MP3 | 朗读 64kbps 单声道，音乐 128kbps |

10 分钟以上的长视频，建议发到视频号、B 站，网站里放链接。

## 转换和上传

```bash
# 视频：转成网页用的 MP4，并截一张封面（同名 -poster.webp）；封面也可以换成自己做的图，文件名不变
npm run media -- video 录屏.mov intro.mp4

# 音频：朗读；配乐加 --music
npm run media -- audio 录音.m4a narration.mp3

# 上传到公开桶（会打印网址和 Markdown 写法）
CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=b71f81b110b4503677894266360bc757 \
  npm run media -- put light.webp lessons/pep-3a-lines/light.webp

# 替换已有文件
CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=b71f81b110b4503677894266360bc757 \
  npm run media -- put light.webp lessons/pep-3a-lines/light.webp --overwrite

# 上传到私有桶
CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=b71f81b110b4503677894266360bc757 \
  npm run media -- put 原图.png originals/lessons/pep-3a-lines/原图.png --private
```

- **token 只在命令行里临时写，不要存进任何文件。** 这个仓库是公开的。
- **token 需要的权限**：R2 编辑（上传）；11aike.com 的“缓存清除”（覆盖后刷新 CDN）。
- **修改已上线的 svg**：先下载 `https://media.11aike.com/…/xx.svg`，改好后再用 `--overwrite` 传回去。

## 在网站里怎么用

**文章（Markdown）**：单独占一行，图片、视频、音频写法一样：

```markdown
![图片内容的具体描述](https://media.11aike.com/lessons/pep-3a-lines/light.webp "图注")
![课件演示：拖动端点，射线一直延伸](https://media.11aike.com/lessons/pep-3a-lines/intro.mp4 "图注")
![课文朗读](https://media.11aike.com/lessons/pep-3a-lines/narration.mp3 "图注")
```

- **图片**：显示成带图注的插图，宽高在构建时从 R2 读出来。
- **视频**：`.mp4` 显示成带封面的播放器。
- **音频**：`.mp3` 显示成音频条。

**开头信息里的图片字段**：
- `封面` 写完整网址，比如 `https://media.11aike.com/lessons/pep-3a-lines/cover.webp`；
- `图标`（贴纸名）和 works.yaml 里的 `图片`（作品封面名）只写文件名，不带 `.webp`。

**网站代码**：用 `src/lib/media.mjs` 里的 `media('brand/avatar.webp')` 拼网址，不要写死域名。

**构建检查**：
- 页面和样式里引用的每个 R2 文件都会检查能不能打开，打不开就不发布。
- 文章里写了还没上传的图片，构建会报出是哪一张。
- 检查时都加了一次性参数，不会把“不存在”缓存到正式网址上。

## 费用

- R2 每月免费：10GB 存储、1000 万次读取、100 万次写入；出流量不收费。
- 前面有 CDN 缓存，大部分访问不会读到 R2。
- 按目前的用量（约 4MB 图片）是免费的。

## 当前状态（2026-11-06）

- [x] `media.11aike.com` 已绑定到 `11aike-media`，证书已生效（最低 TLS 1.2），`r2.dev` 公开地址已关闭。
- [x] 跨域只允许 `https://11aike.com`、`https://www.11aike.com` 和本地预览 `http://localhost:4321`，方法限 GET/HEAD。
- [x] 两个桶都会在 7 天后自动清理没传完的上传。
- [x] 原来 `public/assets/` 下的 87 张图片已全部搬到 R2，网站改为从 `media.11aike.com` 加载。
- [x] 旧的 `11aike.com/assets/…` 网址用 `public/_redirects` 永久跳转到 R2，搜索引擎收录过的图片、分享出去的链接不会失效。
- [x] 已验证：再次访问走 CDN 缓存；支持分段下载（视频可以拖动进度）；覆盖后刷新 CDN 缓存。
- [ ] 以后再定：课件版本管理；课件源文件是否从百度网盘搬到 `11aike-vault`；付费资源用临时链接发放；防盗链规则（发现被盗用时再加）。
