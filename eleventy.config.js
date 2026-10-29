export default function(config) {
  config.addPassthroughCopy({ "assets": "assets" });
  config.addPassthroughCopy({ "public": "/" });
  config.addWatchTarget("content/");
  config.addGlobalData("site", {
    name: "十一课件",
    url: "https://11edu.cc",
    description: "小学数学互动课件、同步教学资源与课堂演示"
  });
  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "dist" },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
}
