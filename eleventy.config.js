export default function (config) {
  config.addPassthroughCopy({ "index.html": "index.html" });
  config.addPassthroughCopy({ "assets": "assets" });
  config.addPassthroughCopy({ "public": "/" });
  config.addWatchTarget("content/");
  config.addFilter("json", value => JSON.stringify(value).replace(/</g, "\\u003c"));
  config.addFilter("number", value => Number(value).toLocaleString("zh-CN"));
  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "dist" },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
}
