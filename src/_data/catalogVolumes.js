import grades from "./catalogGrades.js";
import getCourses from "./courses.js";
export default () => {
  const live = new Set(getCourses().map(c => [c.edition,c.grade,c.volume].join(":")));
  return grades().flatMap(x => [1,2].map(volume => ({ ...x, volume }))).filter(x=>live.has([x.edition,x.grade,x.volume].join(":")));
};
