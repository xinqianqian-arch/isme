import fs from "node:fs";
import path from "node:path";
const root = "content/courses";
export default function () {
  return fs.readdirSync(root).filter(n => n.endsWith(".md")).map(name => {
    const raw = fs.readFileSync(path.join(root,name),"utf8");
    const match = raw.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!match) throw new Error("Missing YAML front matter: " + name);
    // Lightweight metadata extraction; body is rendered by the Markdown template itself.
    const fields = {};
    for (const line of match[1].split("\n")) {
      const idx = line.indexOf(":");
      if (idx > 0) {
        const key=line.slice(0,idx).trim(), val=line.slice(idx+1).trim().replace(/^["']|["']$/g,"");
        fields[key] = /^\d+$/.test(val) ? Number(val) : val;
      }
    }
    return { ...fields, filename:name };
  }).filter(c => c.status === "published");
}
