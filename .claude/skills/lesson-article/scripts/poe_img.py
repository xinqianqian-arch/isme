# 用法: POE_KEY=... python3 -I poe_img.py <model> <输出文件前缀> <提示词文件> [参考图...]
# key 只用环境变量临时传入，不要写进任何文件；输出图片放临时目录，挑好的用 to_webp.py 转好，再用 npm run media -- put 上传到 R2
import json, os, re, sys, base64, urllib.request
model, out, prompt_file, *refs = sys.argv[1:]
prompt = open(prompt_file, encoding='utf-8').read()
content = [{"type": "text", "text": prompt}]
for r in refs:
    b64 = base64.b64encode(open(r, 'rb').read()).decode()
    mime = 'image/webp' if r.endswith('.webp') else 'image/png'
    content.append({"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}})
body = {"model": model, "messages": [{"role": "user", "content": content if refs else prompt}], "stream": False}
req = urllib.request.Request("https://api.poe.com/v1/chat/completions", data=json.dumps(body).encode(),
                             headers={"Authorization": "Bearer " + os.environ["POE_KEY"], "Content-Type": "application/json"})
resp = json.load(urllib.request.urlopen(req, timeout=600))
text = resp["choices"][0]["message"]["content"]
urls = re.findall(r'\]\((https?://[^\s)]+)\)', text) or re.findall(r'https?://[^\s)\]"]+', text)
print("回复:", text[:300].replace("\n", " "))
for i, u in enumerate(urls):
    print("图片地址:", u[:120])
    data = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36"}), timeout=120).read()
    ext = '.png' if data[:4] == b'\x89PNG' else ('.webp' if data[8:12] == b'WEBP' else '.jpg')
    fn = f"{out}-{i}{ext}"; open(fn, 'wb').write(data); print("已保存", fn, len(data), "字节")
