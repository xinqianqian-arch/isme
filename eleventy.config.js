import fs from "node:fs";
import crypto from "node:crypto";

/* 样式文件网址带上内容指纹（?v=xxxx）：文件一改网址就变，浏览器和 CDN 不会继续用旧缓存 */
export const assetUrl = url => url + "?v=" + crypto.createHash("md5").update(fs.readFileSync("public" + url)).digest("hex").slice(0, 8);

export default function (config) {
  config.addPassthroughCopy({ "index.html": "index.html" });
  /* 单文件互动课件（天安门广场），原样发布到 /aaa */
  config.addPassthroughCopy({ "aaa.html": "aaa.html" });
  config.addPassthroughCopy({ "assets": "assets" });
  config.addPassthroughCopy({ "public": "/" });
  config.addWatchTarget("content/");
  config.addFilter("asset", assetUrl);
  config.addFilter("json", value => JSON.stringify(value).replace(/</g, "\\u003c"));
  config.addFilter("cn", value => ["", "一", "二", "三", "四", "五", "六"][Number(value)] || value);
  config.addFilter("number", value => Number(value).toLocaleString("zh-CN"));
  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "dist" },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
}
