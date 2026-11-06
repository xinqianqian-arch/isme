# 用法: python3 to_webp.py <输入图> <输出.webp> [最大宽度，默认 1440] [--cover]
#   --cover：居中裁成 1.905:1 再缩到 1200×630，做分享封面
# 需要 Pillow（pip install pillow）
import sys
from PIL import Image

args = [a for a in sys.argv[1:] if a != '--cover']
cover = '--cover' in sys.argv
src, dst = args[0], args[1]
width = 1200 if cover else int(args[2]) if len(args) > 2 else 1440

im = Image.open(src).convert('RGB')
if cover:
    h = round(im.width / 1.905)
    if h <= im.height:
        top = (im.height - h) // 2
        im = im.crop((0, top, im.width, top + h))
    else:
        w = round(im.height * 1.905)
        left = (im.width - w) // 2
        im = im.crop((left, 0, left + w, im.height))
if im.width > width:
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
im.save(dst, 'WEBP', quality=80, method=6)
print(dst, im.size)
