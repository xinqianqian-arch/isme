import grades from "./catalogGrades.js";
export default () => grades().flatMap(x => [1,2].map(volume => ({...x, volume})));
