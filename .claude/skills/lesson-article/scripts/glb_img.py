# 用法: GLB_KEY=... python3 -I glb_img.py <模型> <输出文件前缀> <提示词文件> [参考图...] [--ratio 16:9]
# 用 glbgpt 开放接口生成图片（异步任务：提交 → 每 6 秒查一次 → 下载）。参数和 poe_img.py 一样，可以直接替换。
# 参考图：写 https 网址；本机文件只认得 g3a.webp（会换成它在 R2 上的网址），其他本机图片要先传到 R2。
# 常用模型：gpt-image-2（320 积分）、nano-banana-pro（500）、seedream-4.5（200）。可用模型：GET /v1/models?type=image
# key 只用环境变量临时传入，不要写进任何文件。
import json, os, sys, time, urllib.request

API = 'https://api2.glbgpt.com/ai-api/open/v1'
KNOWN = {'g3a.webp': 'https://media.11aike.com/courseware/covers/g3a.webp'}
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36'

args = sys.argv[1:]
ratio = '16:9'
if '--ratio' in args:
    i = args.index('--ratio'); ratio = args[i + 1]; del args[i:i + 2]
model, out, prompt_file, *refs = args
prompt = open(prompt_file, encoding='utf-8').read()
images = []
for r in refs:
    if r.startswith('http'):
        images.append(r)
    elif os.path.basename(r) in KNOWN:
        images.append(KNOWN[os.path.basename(r)])
    else:
        sys.exit(f'参考图 {r} 是本机文件：先用 npm run media -- put 传到 R2，再写网址')

def call(method, path, body=None):
    req = urllib.request.Request(API + path, method=method, data=json.dumps(body).encode() if body else None,
                                 headers={'Authorization': 'Bearer ' + os.environ['GLB_KEY'], 'Content-Type': 'application/json', 'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=120) as res:
        return json.load(res)

body = {'model': model, 'prompt': prompt, 'aspect_ratio': ratio}
if images: body['images'] = images
task = call('POST', '/tasks', body)
tid = task.get('id') or task.get('task_id')
print('任务', tid, task.get('status'))
for _ in range(100):
    time.sleep(6)
    t = call('GET', f'/tasks/{tid}')
    st = t.get('status')
    if st in ('succeeded', 'failed', 'canceled', 'cancelled'):
        break
print('状态', st)
if st != 'succeeded':
    sys.exit('生成失败：' + json.dumps(t, ensure_ascii=False)[:500])

def urls_of(x):
    """从返回结果里找出所有图片网址（字段名各模型可能不同）"""
    found = []
    if isinstance(x, dict):
        for v in x.values(): found += urls_of(v)
    elif isinstance(x, list):
        for v in x: found += urls_of(v)
    elif isinstance(x, str) and x.startswith('http') and any(k in x.lower() for k in ('.png', '.jpg', '.jpeg', '.webp', 'image', 'img')):
        found.append(x)
    return found

urls = list(dict.fromkeys(urls_of(t.get('output') or t.get('result') or t.get('data') or t)))
for i, u in enumerate(urls):
    data = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': UA}), timeout=120).read()
    ext = '.png' if data[:4] == b'\x89PNG' else ('.webp' if data[8:12] == b'WEBP' else '.jpg')
    fn = f'{out}-{i}{ext}'
    open(fn, 'wb').write(data)
    print('已保存', fn, len(data), '字节')
if not urls:
    sys.exit('没找到图片网址：' + json.dumps(t, ensure_ascii=False)[:500])
