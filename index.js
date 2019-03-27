// Require Node.js Dependencies
const { readFileSync } = require("fs");

// Require Third-party Dependencies
const jsdocExtractor = require("jsdoc-extractor");

// CONSTANTS
const ARROBASE = "@".charCodeAt(0);

function* parseJSDocBlock(buf) {

}

const buf = readFileSync("./temp/beta.js");
const objs = [];
for (const block of jsdocExtractor(buf)) {
    objs.push(...parseJSDocBlock(block));
}
console.log(objs);
