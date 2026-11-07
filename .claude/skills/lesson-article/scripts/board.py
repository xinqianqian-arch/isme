# 小黑板板书生成器：写一个 JSON，生成网站统一风格的黑板 SVG（绿色黑板、木框、粉笔字、彩色粉笔）。
# 用法: python3 -I board.py <板书.json> <输出.svg>
#
# JSON 格式：
# {
#   "title": "去奶奶家",
#   "rows": [
#     {"cols": [["!火车 [y]115×4＝460（千米）[/]", "汽车 45×2＝90（千米）"], ["^[p]一共 550 千米[/]"]], "w": [3, 2]},
#     {"rule": true},
#     {"lines": ["先画图分段，再分别算，最后合起来"]},
#     {"raw": "<line x1='0' y1='10' x2='528' y2='10' stroke='#F4F1E8'/>", "h": 30}
#   ]
# }
# - rows 从上往下排：cols 是并排的几栏（w 是各栏宽度比例，不写就平分）；lines 是占满一行的几行字；rule 是一条虚线；
#   raw 是自己画的小图（坐标从板书内容区左上角算起，内容区宽 528），h 是它占的高度；gap 是空几像素。
# - 每行字的开头可以加：
#     "!"  大字加粗（结论、算式），"~" 小字（补充说明），"^" 这一行居中，"[]" 给这一行加粉笔框（可以叠用，如 "^![]"）
# - 行内彩色粉笔：[y]黄[/]  [p]粉[/]  [b]蓝[/]  [g]绿[/]
# - 一行太长会自动折行。数学符号用全角：×、÷、＝、＋、－（和课本一致）。行首可以用全角空格“　”缩进（接续上一行的算式）。
# - raw 里的彩色字直接写 fill 属性即可，例如 <text x='0' y='20' fill='#FFE38A'>。
import json, re, sys, html

W, FRAME, PAD = 600, 12, 36
CW = W - 2 * PAD                      # 内容区宽 528
SIZE = {'k': 24, 'd': 20, 's': 18}
LH = {'k': 38, 'd': 33, 's': 29}
COLORS = {'y': '#FFE38A', 'p': '#FFB8A8', 'b': '#A9D2FF', 'g': '#B6E8C8'}
CHALK = '#F4F1E8'

def char_w(ch, size):
    o = ord(ch)
    if ch == ' ': return size * 0.32
    if 0x2000 <= o < 0x2E80 or ch in '×÷': return size * 1.0   # 箭头、≥、弯引号等按整字宽算，宁宽勿窄
    if o < 0x2000: return size * (0.62 if ch.isupper() else 0.56)
    return size * 1.0

def parse(line):
    """'![y]12×4[/] 人' → 样式标记 + [(文字, 颜色), …]"""
    flags = {'big': False, 'small': False, 'center': False, 'box': False}
    while True:
        if line.startswith('!'): flags['big'] = True; line = line[1:]
        elif line.startswith('~'): flags['small'] = True; line = line[1:]
        elif line.startswith('^'): flags['center'] = True; line = line[1:]
        elif line.startswith('[]'): flags['box'] = True; line = line[2:]
        else: break
    segs, color, pos = [], None, 0
    for m in re.finditer(r'\[(y|p|b|g)\]|\[/\]', line):
        if m.start() > pos: segs.append((line[pos:m.start()], color))
        color = m.group(1) if m.group(1) else None
        pos = m.end()
    if pos < len(line): segs.append((line[pos:], color))
    return flags, segs

TOKEN = re.compile(r'[A-Za-z0-9.%/]+|\s|.')
NO_START = set('，。、：；！？）」』”’,.:;!?)')

def wrap(segs, size, width):
    """按宽度折行（数字、字母连在一起不拆开，标点不放行首），返回多行，每行是 [(文字, 颜色)]"""
    lines, cur, cw = [], [], 0.0
    for text, color in segs:
        for tok in TOKEN.findall(text):
            w = sum(char_w(ch, size) for ch in tok)
            if cw + w > width and cur and tok not in NO_START and not tok.isspace():
                lines.append(cur); cur, cw = [], 0.0
            if tok.isspace() and not cur and lines:   # 折行后的新行不以空格开头；第一行的缩进（如全角空格）保留
                continue
            if cur and cur[-1][1] == color:
                cur[-1] = (cur[-1][0] + tok, color)
            else:
                cur.append((tok, color))
            cw += w
    lines.append(cur)
    return lines

def width_of(segs, size):
    return sum(char_w(ch, size) for t, _ in segs for ch in t)

def render_lines(lines, x0, width, y):
    """在 [x0, x0+width] 里排几行字，返回 (svg 片段, 新的 y)"""
    out = []
    for raw in lines:
        flags, segs = parse(raw)
        cls = 'k' if flags['big'] else ('s' if flags['small'] else 'd')
        size, lh = SIZE[cls], LH[cls]
        inner = width - (16 if flags['box'] else 0)
        parts = wrap(segs, size, inner)
        if len(parts) > 1:
            print(f'提醒：这一行太长，自动折成了 {len(parts)} 行：{raw}', file=sys.stderr)
        for part in parts:
            y += lh
            tw = width_of(part, size)
            x = x0 + (width - tw) / 2 if flags['center'] else x0 + (8 if flags['box'] else 0)
            spans = ''.join(f'<tspan{(" fill=" + chr(34) + COLORS[c] + chr(34)) if c else ""}>{html.escape(t)}</tspan>' for t, c in part)
            if flags['box']:
                out.append(f'<rect x="{x - 8:.1f}" y="{y - size - 7:.1f}" width="{tw + 16:.1f}" height="{size + 16}" rx="8" fill="none" stroke="#FFE38A" stroke-width="2"/>')
            out.append(f'<text class="{cls}" x="{x:.1f}" y="{y:.1f}">{spans}</text>')
    return ''.join(out), y

def build(spec):
    body, y = [], 70.0          # 标题基线 62，内容从这里往下排
    for row in spec['rows']:
        if row.get('rule'):
            y += 20
            body.append(f'<line x1="{PAD}" y1="{y:.1f}" x2="{W - PAD}" y2="{y:.1f}" stroke="{CHALK}" stroke-width="1.5" stroke-dasharray="8 8" opacity=".5"/>')
            y += 8
        elif 'gap' in row:
            y += row['gap']
        elif 'raw' in row:
            body.append(f'<g transform="translate({PAD},{y + 8:.1f})">{row["raw"]}</g>')
            y += row['h'] + 8
        elif 'lines' in row:
            frag, y = render_lines(row['lines'], PAD, CW, y)
            body.append(frag)
        elif 'cols' in row:
            ws = row.get('w') or [1] * len(row['cols'])
            gap = 24
            total = CW - gap * (len(ws) - 1)
            x, ys = PAD, []
            for col, wv in zip(row['cols'], ws):
                cw = total * wv / sum(ws)
                frag, ny = render_lines(col, x, cw, y)
                body.append(frag); ys.append(ny); x += cw + gap
            y = max(ys)
    h = int(y + 42)
    font = "'Kaiti SC','STKaiti','KaiTi','楷体','PingFang SC','Microsoft YaHei','Noto Sans CJK SC',serif"
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {h}" width="{W}" height="{h}">'
            f'<style>text{{font-family:{font}}}text:not([fill]){{fill:{CHALK}}}.h{{font-size:30px;font-weight:700;letter-spacing:4px}}'
            f'.k{{font-size:24px;font-weight:700}}.d{{font-size:20px}}.s{{font-size:18px;opacity:.92}}</style>'
            f'<rect width="{W}" height="{h}" rx="18" fill="#B98A5A"/>'
            f'<rect x="{FRAME}" y="{FRAME}" width="{W - 2 * FRAME}" height="{h - 2 * FRAME}" rx="10" fill="#2F5545" stroke="#264536" stroke-width="3"/>'
            f'<text class="h" x="{W / 2}" y="62" text-anchor="middle">{html.escape(spec["title"])}</text>'
            + ''.join(body) + '</svg>')

if __name__ == '__main__':
    spec = json.load(open(sys.argv[1], encoding='utf-8'))
    svg = build(spec)
    open(sys.argv[2], 'w', encoding='utf-8').write(svg)
    print(sys.argv[2], 'ok')
