# 配图规范

每篇的配图大致是：5 张左右示意图（SVG，手绘）、1–2 张情境插画（Poe 生成）、1 张分享封面（Poe 生成）。图片都放在 Cloudflare R2 上，样板的全部图片在 `https://media.11aike.com/lessons/pep-3a-lines/`。仓库里不放图片，规则见 `docs/media-storage.md`。

## 放在哪、怎么写

- **文件夹**：一课一个，R2 路径是 `lessons/<版本缩写>-<年级册>-<主题英文>/`，比如 `lessons/pep-3a-lines/`。三年级上册写 `3a`，下册写 `3b`。
- **工作流程**：在临时目录（如 `/tmp`）里画图、转 webp，再用 `npm run media -- put <文件> lessons/<文件夹>/<文件名>` 逐个上传（要带 Cloudflare 环境变量）。替换已上线的图加 `--overwrite`。
- **写法**：Markdown 里单独占一行：

  ```markdown
  ![图片内容的具体描述](https://media.11aike.com/lessons/pep-3a-lines/relation.svg "图下面显示的图注")
  ```

- **方括号里写什么**：具体描述画面内容，看不到图的人、搜索引擎和 AI 都会读。
- **引号里写什么**：图注。练习类的图把答案写在图注里。
- 单独占一行的图片会自动变成带图注的插图，构建时从 R2 读出宽高，并加上延迟加载（见 `src/lib/figure-plugin.mjs`）。图片还没上传或路径写错时，构建会报出是哪张图。

## 哪里配什么图

| 位置 | 图 | 怎么做 |
| --- | --- | --- |
| 一、编排意图 | 知识关系图（比如线段 → 射线 → 直线） | SVG |
| 四、情境导入 | 导入场景插画 | Poe |
| 四、比较辨析 / 练习 | “考考你”变式图，答案写在图注里 | SVG |
| 五、趣味设计 | 活动插画（手势、游戏） | Poe |
| 六、AI 赋能 | 课前 → 课中 → 课后 → 教研闭环，中间写“老师把关”；卡片内容换成本课的 | SVG |
| 七、板书设计 | 黑板板书 | SVG |
| 九、易错点 | 正误对比图 | SVG |
| 开头信息 `封面` | 分享封面，不在正文显示 | Poe |
| 六、课中 | 真实互动课件截图 | **由用户提供**，不要用 AI 生成课件界面 |
| 需要演示过程时 | 课件操作录屏（短视频）、朗读音频 | 用户提供原片 → `npm run media` 转换后上传 R2，见下文 |

数学内容（图形、端点、字母、刻度）一律用 SVG 手绘，不交给 AI 画，AI 很容易画错。

## SVG 示意图

### 尺寸与颜色

- **尺寸**：`viewBox` 宽 600，高按内容定，`width` 和 `height` 也写上。网页上最大显示 640 宽，手机上约 354 宽。
- **字号**（手机上会缩到约 0.59 倍）：
  - 说明文字 18–19；
  - 标签、字母 20–22；
  - 最小 17。
- **背景**：`<rect width="600" height="…" rx="18" fill="#FFFBF5"/>`。卡片用白底，描边 `#F0E6D8`。
- **配色**（和网站一致）：
  - 主文字 `#2E3A59`，说明文字 `#5B6170`；
  - 珊瑚红 `#FF7B5C`，深一点的强调色 `#E0603F`；
  - 阳光黄 `#FFC845`，上面的字用 `#6B4A00`；
  - 薄荷绿 `#3DC9A4`；
  - 天蓝 `#5B9DFF`，深一点的强调色 `#3A7BE0`。
- **字体**：

  ```css
  text{font-family:'PingFang SC','HarmonyOS Sans SC','MiSans','Microsoft YaHei','Noto Sans CJK SC',sans-serif;fill:#2E3A59}
  ```

- **板书**：
  - 黑板 `#2F5545`，木框 `#B98A5A`；
  - 粉笔白 `#F4F1E8`，彩色粉笔用黄 `#FFE38A`、粉 `#FFB8A8`、蓝 `#A9D2FF`；
  - 字体用楷体：`'Kaiti SC','STKaiti','KaiTi','楷体','PingFang SC','Microsoft YaHei',serif`。

### 数学画法以课本为准

- 射线只画一个端点，不画箭头；直线不画端点。
- 点用实心圆，半径 5.5–7；字母用斜体加粗。
- **讲解用的图**：想表现“无限延伸”时，可以让线条渐隐（`linearGradient` 渐变到 `stop-opacity="0"`），再配一行小字“无限延长 →”。
- **练习用的图**：严格按课本画法，不加任何提示。

### 动手画与检查

- 新图从样板里最接近的一张改起（先从 `https://media.11aike.com/lessons/pep-3a-lines/` 下载）：`relation.svg`、`variants.svg`、`ai-flow.svg`、`board.svg`、`ray-ab-ba.svg`。
- 画完要用浏览器打开检查：文字不溢出、不重叠，手机宽度下也看得清。
- 用 shell 循环批量生成 SVG 时，含空格的参数要加引号。踩过的坑：“AI 听课伙伴”被拆成了两个参数。

## Poe 插画

### Key 与生成

- Poe key 由用户在对话里给出。**只用环境变量临时传入，不写进任何文件。**
- 生成命令：

  ```bash
  curl -so /tmp/g3a.webp https://media.11aike.com/courseware/covers/g3a.webp   # 风格参考图
  POE_KEY=… python3 -I .claude/skills/lesson-article/scripts/poe_img.py <模型> <输出前缀> <提示词文件> /tmp/g3a.webp
  ```

  最后一个参数是风格参考图（网站统一的黏土风），每次都传。
- 输出文件和提示词文件放在临时目录（比如 `/tmp`），不要放进仓库。

### 选模型

| 模型 | 特点 |
| --- | --- |
| `gpt-image-2` | 构图清楚、人物表情生动；手势、多格画面优先用它 |
| `nano-banana-pro` | 快，风格统一；场景插画效果也不错 |

重要的图两个模型各生成一张，挑好的那张。

### 提示词

模板见 [prompts.md](prompts.md)。必写的几句：

- `No text, no letters, no numbers, no watermark.`
- 有人物时：`exactly two arms and two hands per kid`。
- 有数学物件时，按课本画法写清楚，比如 `no arrowheads`。

### 逐张检查

- 手和脚的数量对不对；
- 数学画法对不对：有没有箭头、端点画得对不对；
- 有没有乱码文字。

不合格就改提示词重新生成。踩过的坑：

- 手势图第一版多画了手臂。改成“三格、每格一个孩子 T 字姿势”后才对。
- 封面第一版把射线和直线画成了带箭头的样子。改成“线的一端变成光，渐渐消失”。

### 转成 webp

```bash
python3 .claude/skills/lesson-article/scripts/to_webp.py <输入.png> <输出.webp>           # 正文插画：宽度不超过 1440
python3 .claude/skills/lesson-article/scripts/to_webp.py <输入.png> <输出.webp> --cover   # 封面：居中裁成 1200×630
```

转好后每张插画大约 30–40KB。

### 备份原图

挑剩的图和原图，连同提示词文件，一起备份到 R2 私有桶，放在 `originals/lessons/<文件夹>/`：

```bash
npm run media -- put <原图.png> originals/lessons/pep-3a-lines/<原图.png> --private
```

同样要带上 Cloudflare 的环境变量。备份完再删掉临时目录。

## 视频和音频（Cloudflare R2）

- 视频、音频不放进仓库。先转换格式，再上传到公开桶 `11aike-media`，在文章里用 `https://media.11aike.com/…` 引用，写法和图片一样。
- 视频必须配一张同名的 `-poster.webp` 封面，`npm run media -- video` 会自动截一张。
- 目录、格式、命令和权限都写在 `docs/media-storage.md`。
- 构建时会检查页面里引用的 R2 素材能不能打开。
