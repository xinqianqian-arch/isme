# 图片、视频、音频怎么管理

## 放在哪

| 放哪 | 放什么 | 为什么 |
| --- | --- | --- |
| Git 仓库 `public/assets/` | 网站界面图（贴纸、头像、作品封面）、SVG 示意图、文章里的小插画（单张 300KB 以内） | 跟文章一起修改、一起回退，构建时能检查图在不在 |
| R2 公开桶 `11aike-media` → `https://media.11aike.com` | 视频、音频、大图，课件用的贴图、音效、模型 | 出流量免费、走 CDN；网站发布的文件单个最大 25MB，视频放不下 |
| R2 私有桶 `11aike-vault`（不对外） | AI 生成的原图、PSD，PPT 和 HTML 课件源文件，付费资源，备份 | 不能公开的东西 |

现有的 `public/assets/` 不用搬。新增的大文件、视频和音频放进 R2。

## 目录

```
11aike-media（公开）
  lessons/pep-3a-lines/intro.mp4          和 public/assets/lessons/pep-3a-lines/ 同名，一课的素材一眼找全
  lessons/pep-3a-lines/intro-poster.webp  视频封面（必须有，文件名 = 视频名 + -poster.webp）
  lessons/pep-3a-lines/intro.vtt          字幕（可选）
  lessons/pep-3a-lines/narration.mp3
  articles/<文章文件名>/…
  courseware/<课件名>/…                   互动课件用的贴图、音效、模型
  brand/…                                 小红书、公众号通用的品牌素材

11aike-vault（私有）
  originals/lessons/pep-3a-lines/…        AI 生成原图 + 提示词、PSD、录屏原片
  courseware-src/<课件名>/…               PPT、HTML 课件源文件
  backup/…
```

- 一节课的文件夹名，和 `public/assets/lessons/` 下的文件夹名保持一致，比如 `pep-3a-lines`。
- 公开桶的路径会出现在网址里，只用小写英文、数字和 `- _ . /`。私有桶可以用中文文件名。
- 同一个文件要换成新的，就直接覆盖。版本管理以后再定。

## 格式

| 类型 | 格式 | 规格 |
| --- | --- | --- |
| 图片 | webp；示意图用 svg | 宽不超过 1600，质量 80；封面 1200×630 |
| 视频 | MP4（H.264 + AAC） | 最宽 1280（720p），边下边播；一段 1–3 分钟、50MB 以内；配封面，字幕可选 |
| 音频 | MP3 | 朗读 64kbps 单声道，音乐 128kbps 立体声 |

10 分钟以上的长视频，建议发到视频号、B 站，网站里放链接。这些平台还能带来流量。

## 转换和上传

```bash
# 视频：转成网页用的 MP4，并截一张封面（同名 -poster.webp）；封面也可以换成自己做的图，文件名不变
npm run media -- video 录屏.mov intro.mp4

# 音频：朗读；配乐加 --music
npm run media -- audio 录音.m4a narration.mp3

# 上传到公开桶（会打印网址和 Markdown 写法）
CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=b71f81b110b4503677894266360bc757 \
  npm run media -- put intro.mp4 lessons/pep-3a-lines/intro.mp4
CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=b71f81b110b4503677894266360bc757 \
  npm run media -- put intro-poster.webp lessons/pep-3a-lines/intro-poster.webp

# 上传到私有桶
CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=b71f81b110b4503677894266360bc757 \
  npm run media -- put cover-原图.png originals/lessons/pep-3a-lines/cover-原图.png --private
```

- **token 只在命令行里临时写，不要存进任何文件。** 这个仓库是公开的。
- **不要直接访问还没上传的网址**：CDN 会把“不存在”缓存约 3 分钟。工具和构建检查都已经避开了这个问题。
- **覆盖保护**：公开桶里已经有同名文件时，要加 `--overwrite` 才会替换。替换后工具会自动刷新 CDN 缓存。浏览器的缓存最迟一天更新。
- **用到的权限**：上传需要 token 有 R2 编辑权限；刷新缓存需要 11aike.com 的“缓存清除”权限。

## 文章里怎么用

和图片的写法一样，单独占一行：

```markdown
![课件演示：拖动端点，射线一直延伸](https://media.11aike.com/lessons/pep-3a-lines/intro.mp4 "图注")
![课文朗读](https://media.11aike.com/lessons/pep-3a-lines/narration.mp3 "图注")
```

- `.mp4` 显示成带封面的播放器，封面自动用同名的 `-poster.webp`；`.mp3` 显示成音频条。
- 视频、音频不能放在 `public/` 里，构建会报错，提示你先上传到 R2。
- 构建时会逐个检查页面里用到的 R2 素材（包括视频封面）能不能打开，打不开就不发布。

## 费用

- R2 每月免费：10GB 存储、1000 万次读取、100 万次写入。出流量不收费。
- 前面有 CDN 缓存，大部分访问不会读到 R2。
- 按目前的用量基本免费。超出后存储约 0.015 美元 / GB / 月。

## 当前状态（2026-11-06）

- [x] 两个桶已建好。`11aike-vault` 不对外。
- [x] `11aike-media` 的跨域只允许 `https://11aike.com`、`https://www.11aike.com` 和本地预览 `http://localhost:4321`，方法限 GET/HEAD。
- [x] 两个桶都会在 7 天后自动清理没传完的上传。
- [x] 《线段、射线、直线》的 AI 原图和提示词已备份到 `11aike-vault/originals/lessons/pep-3a-lines/`。
- [x] `media.11aike.com` 已绑定到 `11aike-media`，证书已生效（最低 TLS 1.2）。`r2.dev` 公开地址已关闭。
- [x] 已验证：再次访问走 CDN 缓存；支持分段下载（视频可以拖动进度）；跨域只对 11aike.com 放行。`brand/avatar.webp`（头像）是第一个文件。
- [ ] 可选：给 token 加上 11aike.com 的“缓存清除”权限。这样覆盖文件后会马上生效，否则 CDN 最迟一天后更新。
- [ ] 以后再定：课件版本管理、付费资源用临时链接发放、防盗链规则（发现被盗用时再加）。
