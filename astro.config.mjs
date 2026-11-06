// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://11aike.com',
  // 网址统一以 / 结尾，生成 xxx/index.html，和旧站完全一致
  trailingSlash: 'always',
  build: { format: 'directory' },
  outDir: './dist',
  // 文章里的代码块是提示词、板书，不需要语法高亮；保持浅色底，复制到公众号也不走样
  markdown: { syntaxHighlight: false },
});
