// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://11aike.com',
  // 网址统一以 / 结尾，生成 xxx/index.html，和旧站完全一致
  trailingSlash: 'always',
  build: { format: 'directory' },
  outDir: './dist',
});
