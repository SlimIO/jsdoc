// Require Node.js Dependencies
const { readFileSync } = require("fs");

// Require Third-party Dependencies
const jsdocExtractor = require("jsdoc-extractor");

// Require Internal
const { sliceTo, toLowerCase, hasMember } = require("./src/utils");

// CONSTANTS
const C_ARROBASE = "@".charCodeAt(0);
const C_SPACE = " ".charCodeAt(0);
const C_EOL = "\n".charCodeAt(0);
const C_STAR = "*".charCodeAt(0);
const C_ASLASH = "/".charCodeAt(0);

const PARSE_PARAM = new Set([
    "param", "returns", "return", "arg", "argument", "typedef", "type", "property", "throws", "member"
]);
const STD_PARAM = new Set([
    "return", "returns", "throws"
]);

/**
 * @func parseJSDocBlock
 * @param {!Buffer} buf Node.js buffer
 * @returns {any}
 */
function parseJSDocBlock(buf) {
    const ret = Object.create(null);
    let offset = 0;
    let multiLine = null;

    for (let i = 0; i < buf.length; i++) {
        // eslint-disable-next-line
        if (multiLine !== null && (buf[i] === C_ARROBASE || (buf[i - 1] === C_STAR && buf[i] === C_ASLASH))) {
            const line = buf.slice(offset, i - 1).toString().trim().replace(/\*/g, "");
            ret[multiLine] = line === "" ? true : line;
            multiLine = null;
        }

        if (buf[i] !== C_ARROBASE) {
            continue;
        }

        const bufName = toLowerCase(sliceTo(buf, i, C_SPACE));
        i += bufName.length;

        const nameStr = bufName.toString().replace(/\n/, "");
        offset = i;
        while (buf[offset] !== C_EOL && buf[offset] !== C_STAR) {
            offset++;
        }

        const lineBuf = buf.slice(i + 1, offset);
        i += lineBuf.length;
        if (PARSE_PARAM.has(nameStr)) {
            const line = lineBuf.toString();
            const result = /\s*{(?<required>[!])?(?<type>[\w.|<>,\s()*]+)}\s?(?<name>[[\w\]]+)?\s?(?<desc>.*)?/.exec(line);
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
        else if (nameStr === "example" || nameStr === "desc") {
            offset = i + 1;
            multiLine = nameStr;
        }
        else {
            const line = lineBuf.toString().trim().normalize();
            ret[nameStr] = line === "" ? true : line;
        }
    }

    return ret;
}

/**
 * @func linkJSDocBlocks
 * @param {Array<any>} blocks blocks
 * @returns {Object}
 */
function linkJSDocBlocks(blocks) {
    if (!Array.isArray(blocks)) {
        throw new TypeError("blocks must be instanceof Array");
    }

    const ret = Object.create(null);
    ret._orphans = [];
    const link = new Set();

    for (const block of blocks) {
        const [has, name] = hasMember(block);
        if (has) {
            const memberName = block[name].toLowerCase();
            block.members = [];
            ret[memberName] = block;
            link.add(memberName);
            continue;
        }

        sub: if (Reflect.has(block, "memberof")) {
            const memberOf = block.memberof.toLowerCase();
            if (!link.has(memberOf)) {
                break sub;
            }

            ret[memberOf].members.push(block);
            continue;
        }

        ret._orphans.push(block);
    }

    return ret;
}

const buf = readFileSync("./temp/beta.js");

console.time("parse");
const objs = [];
for (const block of jsdocExtractor(buf)) {
    objs.push(parseJSDocBlock(block));
}
const ret = linkJSDocBlocks(objs);
console.timeEnd("parse");
console.log(JSON.stringify(ret, null, 4));
