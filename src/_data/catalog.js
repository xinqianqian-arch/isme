import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";

const markdown = new MarkdownIt({html:false,linkify:true,typographer:true});
const CN = ["", "一", "二", "三", "四", "五", "六"];
export default function () {
  const pathToCatalog = path.join(process.cwd(),"content/textbooks/bsd/catalog.json");
  const source = JSON.parse(fs.readFileSync(pathToCatalog,"utf8"));
  const volumes=[], units=[], lessons=[], seen=new Set();
  for (const rawBook of source.books) {
    const root = `/textbooks/bsd/grade-${rawBook.grade}/volume-${rawBook.volume}/`;
    const book = {...rawBook, url:root, volumeName:rawBook.volume===1?"上册":"下册", units:[]};
    for (const rawUnit of rawBook.units) {
      const unitUrl = root + rawUnit.id + "/";
      if (seen.has(unitUrl)) throw new Error("Duplicated unit URL "+unitUrl);
      seen.add(unitUrl);
      const unit = {...rawUnit, edition:"bsd",grade:book.grade,volume:book.volume,volumeName:book.volumeName,revision:book.revision,source:book.source,bookUrl:root,url:unitUrl,lessons:[]};
      for (const rawLesson of rawUnit.lessons) {
        const lessonUrl=unitUrl+rawLesson.id+"/";
        if(seen.has(lessonUrl)) throw new Error("Duplicated lesson URL "+lessonUrl);
        seen.add(lessonUrl);
        const ref=`bsd-g${book.grade}v${book.volume}-${rawUnit.id}-${rawLesson.id}`;
        const overlay=path.join(process.cwd(),"content/lessons",ref+".md");
        let extra={}, html="", seoReady=false;
        if (fs.existsSync(overlay)) {
          const parsed=matter(fs.readFileSync(overlay,"utf8"));
          extra=parsed.data;
          html=markdown.render(parsed.content);
          seoReady=extra.publishSeo===true && parsed.content.trim().length>=250;
          if(extra.publishSeo===true && !seoReady) throw new Error("SEO lesson requires 250+ characters: "+ref);
        }
        const lesson={...rawLesson,ref,url:lessonUrl,grade:book.grade,volume:book.volume,volumeName:book.volumeName,revision:book.revision,unitTitle:unit.title,unitUrl:unitUrl,bookUrl:root,focus:unit.focus,pitfall:unit.pitfall,activity:unit.activity,courseStatus:extra.courseStatus||"planned",videoUrl:extra.videoUrl||"",shopUrl:extra.shopUrl||"",html,seoReady};
        lesson.schema={"@context":"https://schema.org","@type":"WebPage",name:`北师大版${CN[book.grade]}年级${book.volumeName}《${rawLesson.title}》教学内容介绍`,url:"https://11edu.cc"+lessonUrl,description:unit.focus,inLanguage:"zh-CN",isPartOf:{"@type":"CreativeWork",name:`北师大版${CN[book.grade]}年级${book.volumeName}`}};
        unit.lessons.push(lesson);
        lessons.push(lesson);
      }
      unit.schema={"@context":"https://schema.org","@type":"LearningResource",name:`北师大版${CN[book.grade]}年级${book.volumeName}《${unit.title}》单元备课指南`,description:unit.focus,inLanguage:"zh-CN",educationalLevel:"小学",learningResourceType:"教学参考",url:"https://11edu.cc"+unit.url,isAccessibleForFree:true};
      book.units.push(unit);
      units.push(unit);
    }
    volumes.push(book);
  }
  const grades=[1,2,3,4,5,6].map(grade=>({grade,url:`/textbooks/bsd/grade-${grade}/`,volumes:volumes.filter(b=>b.grade===grade)}));
  return {editions:[{slug:"bsd",name:"北师大版"}],grades,volumes,units,lessons,version:source.version};
}
