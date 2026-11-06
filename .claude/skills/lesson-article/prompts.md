# Poe 插画提示词模板

提示词用英文写，效果更稳定。每段都以同一句风格描述开头，以“不要文字”结尾，中间写场景。

## 风格开头（每张都用）

```
3D clay / plasticine illustration in a cute, soft, rounded style with gentle pastel colors and warm soft lighting, matching a children's math courseware brand (match the clay style of the reference image).
```

## 结尾（每张都用）

```
No text, no letters, no numbers, no watermark.
```

## 情境导入（样板：手电筒的光，light.webp）

```
Scene: a cozy primary-school classroom with the curtains drawn. A cheerful kid (about 9 years old, made of clay) holds a flashlight. A bright straight beam of light starts exactly at the flashlight and shoots across the room, passes through an open window and keeps going far into a soft starry night sky, getting thinner toward the horizon so it feels like it never ends.
The beam must be one perfectly straight line. Composition: wide 16:9 landscape, the kid on the left third, the beam running to the right. Plain, uncluttered background.
```

写法要点：
- 把本课的数学要点变成一个画面，这里是“有起点、没有尽头”。
- 关键物件写清楚形状，比如 `one perfectly straight line`。
- 交代构图：画面比例、人物站在哪里。

## 活动 / 手势（样板：手臂比一比，arms.webp，用 gpt-image-2 生成）

```
Layout: three equal panels side by side with a small gap between them, wide 16:9 overall. Each panel shows ONE cheerful clay kid (about 9 years old), full body, facing the viewer, with exactly two arms stretched straight out sideways at shoulder height (a T-pose). Anatomically correct: exactly two arms and two hands per kid, nothing overlapping.
- Panel 1 (pale yellow background): both hands are clenched into round fists.
- Panel 2 (pale green background): the left hand is a round fist; the right hand is open and flat with fingers together, pointing straight outward.
- Panel 3 (pale blue background): both hands are open and flat with fingers together, pointing straight outward.
Fists and open hands must be large, clear and easy to tell apart.
```

写法要点：
- 几种情况要对比时，用“分格、每格一个人”。一个画面里放多个动作，容易画出多余的手。
- 每一格的差别要写得清清楚楚，并要求差别大、容易分辨。

## 分享封面（样板：cover.webp，用 gpt-image-2 生成）

```
Scene on a pastel yellow desk: a cute smiling clay ruler character with little eyes standing at the right, and a small clay flashlight beside it shining one straight soft beam of light toward the left.
In front of them, three perfectly straight thin clay rods lie in parallel horizontal rows (each rod clearly separated):
- top rod: short, with one round clay bead fixed at EACH end (two end points), both ends clearly stopped;
- middle rod: one round clay bead at the LEFT end only; the RIGHT end has NO bead and NO arrow tip — instead the rod turns into a glowing light that keeps going and gradually fades out toward the right edge of the image, as if it never ends;
- bottom rod: NO beads and NO arrow tips at all; BOTH ends turn into glowing light that fades out, extending past the edges, as if it never ends in either direction.
Absolutely no arrowheads, no cones, no pointed tips anywhere.
Keep the left 40% of the image as calm empty pastel background (space for a title added later). Wide landscape, aspect ratio about 1.9:1.
```

写法要点：
- 画面比例写约 1.9:1，生成后再用 `to_webp.py --cover` 裁成 1200×630。
- 左边 40% 留空，以后可以加标题。
- 用本课的“主角物件”做画面，并按课本画法写清楚哪些东西不能出现。

## 教材封面（每一册一张，样板：北师大版 12 册、人教版三上）

- **规格**：3:4 竖版；画面上方 35% 留空，网页会在那里叠书名“数学 · 三年级下册”；左下角叠版本名。画面里不要任何文字和数字。
- **生成**：用 `gpt-image-2`，风格参考图是年级插画 `https://media.11aike.com/courseware/covers/g3a.webp`。生成后居中裁成 3:4，缩到 600×800，存成 webp。
- **上传**：和全册目录网页同路径，`textbooks/<版本>/grade-N/volume-N/cover.webp`。再在这一册的 YAML 里写 `封面:` 填完整网址。
- **底色区分版本**：
  - 北师大版：暖杏奶油色，各年级略有深浅；
  - 人教版：浅灰绿、淡薄荷色；
  - 新的版本：另选一种低饱和颜色，比如浅雾蓝或浅藕粉，同一版本的所有册保持一致。
- **画面内容**：从这一册的单元里挑 3–4 个最有代表性的物件，摆成静物。比如三下用了：饮品店分组的杯子、翅膀对称的蝴蝶、绕着边线的绳子和树叶、拆开的盒子。
- **不要画展开图**：AI 画长方体、正方体的展开图经常拼错。要表现立体图形，就画盒子，或者用小正方体拼成的长方体。
- **检查**：
  - 物件数量对不对（例如“每盘 3 个”）；
  - 有没有冒出文字；
  - 上方是否留够了空。

```
3D clay / plasticine illustration in a soft, rounded, refined style with muted, low-saturation pastel colors and gentle warm studio lighting (match the clay material and look of the reference image). Elegant and calm, suitable for a professional teaching resource, not childish.
Scene: a primary-school math still-life for a grade 3 textbook: <从单元里挑的 3–4 个物件，写清楚数量和样子>.
Background: a smooth, soft warm apricot-cream color (pale apricot).
Portrait book-cover composition, aspect ratio 3:4. Keep the TOP 35% of the image as a calm, empty, plain background area (a title will be placed there later). Arrange 3 to 4 objects as a neat, balanced still-life in the lower 60%, resting on the same soft surface, with comfortable margins on all sides; nothing cut off. No text, no letters, no written numbers or digits anywhere, no watermark.
```
