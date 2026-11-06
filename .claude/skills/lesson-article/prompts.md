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
