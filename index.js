// Require Node.js Dependencies
const { readFileSync } = require("fs");

// Require Third-party Dependencies
const jsdocExtractor = require("jsdoc-extractor");

// CONSTANTS
const C_ARROBASE = "@".charCodeAt(0);
const C_SPACE = " ".charCodeAt(0);
const C_EOL = "\n".charCodeAt(0);
const PARSE_PARAM = new Set(["param", "returns", "return", "arg", "argument", "typedef", "type", "property", "throws", "member"]);
const STD_PARAM = new Set(["return", "returns", "throws"]);

/**
 * @func toLowerCase
 * @param {!Buffer} buf Node.js buffer
 * @returns {Buffer}
 */
function toLowerCase(buf) {
    for (let i = 0; i < buf.length; i++) {
        const char = buf[i];
        buf[i] = char < 65 || char > 90 ? char : char + 32;
    }

    return buf;
}

/**
 * @func sliceTo
 * @param {!Buffer} buf Node.js buffer
 * @param {!Number} pos start position
 * @param {!Number} carac char code
 * @returns {Buffer}
 */
function sliceTo(buf, pos, carac) {
    let offset = pos;
    while (buf[offset] !== carac) {
        offset++;
    }

    return buf.slice(pos + 1, offset);
}

/**
 * @func parseJSDocBlock
 * @param {!Buffer} buf Node.js buffer
 * @returns {any}
 */
function parseJSDocBlock(buf) {
    const ret = Object.create(null);

    for (let i = 0; i < buf.length; i++) {
        if (buf[i] !== C_ARROBASE) {
            continue;
        }
        const bufName = toLowerCase(sliceTo(buf, i, C_SPACE));
        i += bufName.length;

        const nameStr = bufName.toString().replace(/\n/, "");
        const lineBuf = sliceTo(buf, i, C_EOL);
        i += lineBuf.length;
        if (PARSE_PARAM.has(nameStr)) {
            const line = lineBuf.toString();
            const result = /^\s*{(?<required>[!])?(?<type>[\w|<>,\s()*]+)}\s?(?<name>[[\w\]]+)?\s?(?<desc>.*)?/.exec(line);
            if (result === null) {
                continue;
            }

            let toAssign = null;
            if (STD_PARAM.has(nameStr)) {
                toAssign = result.groups.type || "";
            }
            else {
                const required = result.groups.required || false;
                toAssign = {
                    required: required === "!" ? true : required,
                    desc: result.groups.desc || "",
                    type: result.groups.type || "",
                    name: (result.groups.name || "").toLowerCase()
                };
            }

            if (Reflect.has(ret, nameStr)) {
                if (Array.isArray(ret[nameStr])) {
                    ret[nameStr].push(toAssign);
                }
                else {
                    const arr = [ret[nameStr], toAssign];
                    ret[nameStr] = arr;
                }
            }
            else {
                ret[nameStr] = toAssign;
            }
        }
        else {
            const line = lineBuf.toString().trim().normalize();
            ret[nameStr] = line === "" ? true : line;
        }
    }

    return ret;
}

const buf = readFileSync("./temp/beta.js");

console.time("parse");
const objs = [];
for (const block of jsdocExtractor(buf)) {
    objs.push(parseJSDocBlock(block));
}
console.timeEnd("parse");
// console.log(JSON.stringify(objs, null, 4));
