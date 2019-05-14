// Require Node.js Dependencies
const { readFile } = require("fs").promises;

// Require Third-party Dependencies
const jsdocExtractor = require("jsdoc-extractor");
const { scan, TOKENS } = require("jsdoc-tokenizer");

// Require Internal
const { getJavascriptFiles } = require("./src/utils");

// CONSTANTS
const CHAR_EXCLA = "!".charCodeAt(0);
const CHAR_EQUAL = "=".charCodeAt(0);
const CHAR_SPACE = " ".charCodeAt(0);
const CHAR_EOL = "\n".charCodeAt(0);

const TYPES = new Map([
    ["{".charCodeAt(0), { close: "}".charCodeAt(0), name: "type" }],
    ["}".charCodeAt(0), { close: CHAR_EOL, name: "arg" }],
    ["]".charCodeAt(0), { close: CHAR_EOL, name: "arg" }],
    ["[".charCodeAt(0), { close: "]".charCodeAt(0), name: "argdef" }]
]);

const LIGHT_TYPE = new Set(["throws", "typedef"]);

/**
 * @func parseJSDoc
 * @param {!Buffer} buf Node.js buffer
 * @returns {any}
 */
function parseJSDoc(buf) {
    const ret = Object.create(null);
    let currKeyword = null;
    let currType = null;
    let currLinker = null;
    let lastSignChar = 0;
    let lastTypeName = null;
    let lastToken = null;
    let checkForMultipleLine = false;

    for (const [token, chars] of scan(buf)) {
        switch (token) {
            case TOKENS.SYMBOL: {
                checkForMultipleLine = chars === CHAR_EOL && lastToken === TOKENS.IDENTIFIER;
                lastSignChar = chars;

                if (currType !== null && currType.close === chars) {
                    lastTypeName = currType.name;
                    currType = null;
                }

                if (TYPES.has(chars)) {
                    currType = TYPES.get(chars);
                }
                break;
            }

            case TOKENS.KEYWORD: {
                checkForMultipleLine = false;
                if (currKeyword !== null && !Reflect.has(ret, currKeyword)) {
                    ret[currKeyword] = { value: true };
                }
                currKeyword = String.fromCharCode(...chars.slice(1));
                break;
            }

            case TOKENS.IDENTIFIER: {
                if (currKeyword === null) {
                    break;
                }
                if (currType === null) {
                    if (Reflect.has(ret, currKeyword)) {
                        if (checkForMultipleLine) {
                            const strValue = String.fromCharCode(...chars);
                            ret[currKeyword].value = ret[currKeyword].value.concat(`\n${strValue}`);
                        }
                        checkForMultipleLine = false;
                    }
                    else {
                        ret[currKeyword] = { value: String.fromCharCode(...chars) };
                    }
                    break;
                }

                switch (currType.name) {
                    case "type": {
                        // Note: force optional to false if required
                        const required = chars[0] === CHAR_EXCLA ? true : chars[chars.length - 1] === CHAR_EQUAL;
                        const codes = chars.filter((char) => char !== CHAR_EQUAL && char !== CHAR_EXCLA);

                        const isLightNode = LIGHT_TYPE.has(currKeyword);
                        const value = String.fromCharCode(...codes);
                        const obj = isLightNode ? { value } : { value, default: null, required };

                        if (Reflect.has(ret, currKeyword)) {
                            const isArray = Array.isArray(ret[currKeyword]);
                            if (isArray) {
                                ret[currKeyword].push(obj);
                            }
                            else {
                                ret[currKeyword] = [ret[currKeyword], obj];
                            }
                        }
                        else {
                            ret[currKeyword] = obj;
                        }

                        currLinker = obj;
                        break;
                    }

                    case "arg": {
                        let offset = 0;
                        while (chars[offset] !== CHAR_SPACE && offset < chars.length) {
                            offset++;
                        }

                        if (lastTypeName === "argdef") {
                            if (chars.length !== 0) {
                                currLinker.desc = String.fromCharCode(...chars).trim();
                            }
                        }
                        else {
                            const u8Desc = chars.slice(offset + 1);
                            currLinker.name = String.fromCharCode(...chars.slice(0, offset));
                            if (u8Desc.length !== 0) {
                                currLinker.desc = String.fromCharCode(...u8Desc).trim();
                            }
                        }
                        break;
                    }

                    case "argdef": {
                        const valueStr = String.fromCharCode(...chars);
                        currLinker[lastSignChar === CHAR_EQUAL ? "default" : "name"] = valueStr;
                        break;
                    }
                }

                break;
            }
        }

        lastToken = token;
    }

    return ret;
}

function groupData(blocks) {
    // DO WORK HERE!
}

/**
 * @async
 * @generator
 * @func parseFile
 * @param {!String} location file location
 * @returns {AsyncIterableIterator<any>}
 *
 * @throws {TypeError}
 */
async function* parseFile(location) {
    if (typeof location !== "string") {
        throw new TypeError("location must be a string");
    }
    const buf = await readFile(location);

    for (const [doc] of jsdocExtractor(buf)) {
        yield parseJSDoc(doc);
    }
}

module.exports = { parseJSDoc, parseFile };
