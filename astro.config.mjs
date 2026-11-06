// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import figure from './src/lib/figure-plugin.mjs';

export default defineConfig({
  site: 'https://11aike.com',
  // 网址统一以 / 结尾，生成 xxx/index.html，和旧站完全一致
  trailingSlash: 'always',
  build: { format: 'directory' },
  outDir: './dist',
  markdown: {
    // 文章里的代码块是提示词，不需要语法高亮；保持浅色底，复制到公众号也不走样
    syntaxHighlight: false,
    // 单独一段的图片变成带图注的 figure，见 src/lib/figure-plugin.mjs
    processor: satteri({ hastPlugins: [figure] }),
  },
});
