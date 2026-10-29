import editions from "./editions.json" with { type: "json" };
export default () => editions.flatMap(edition => [1,2,3,4,5,6].map(grade => ({ edition:edition.slug, name:edition.name, grade })));
