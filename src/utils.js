/**
 * @namespace Utils
 */

// Require Node.js Dependencies
const { readdir, stat } = require("fs").promises;
const { join, extname } = require("path");

// CONSTANTS
const MEMBERS_PARAM = new Set([
    "class", "module", "namespace"
]);
const EXCLUDE_DIRS = new Set(["node_modules", "test", "tests", "coverage", ".vscode", ".git"]);

/**
 * @func toLowerCase
 * @desc Buffer toLowerCase
 * @memberof Utils
 * @param {!Buffer} buf Node.js buffer
 * @returns {Buffer}
 */
function toLowerCase(buf) {
    for (let id = 0; id < buf.length; id++) {
        const char = buf[id];
        buf[id] = char < 65 || char > 90 ? char : char + 32;
    }

    return buf;
}

/**
 * @func sliceTo
 * @memberof Utils
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
 * @func hasMember
 * @memberof Utils
 * @param {!Object} block JSDoc block
 * @returns {[Boolean, String]}
 */
function hasMember(block) {
    for (const name of MEMBERS_PARAM) {
        if (Reflect.has(block, name)) {
            return [true, name];
        }
    }

    return [false, null];
}

/**
 * @async
 * @generator
 * @func getJavascriptFiles
 * @memberof Utils
 * @param {!String} dir root directory
 * @returns {AsyncIterableIterator<String>}
 */
async function* getJavascriptFiles(dir) {
    const files = await readdir(dir);
    const tDirs = [];

    for (const file of files) {
        if (extname(file) === ".js") {
            yield join(dir, file);
            continue;
        }

        if (EXCLUDE_DIRS.has(file)) {
            continue;
        }
        tDirs.push(file);
    }

    for (const name of tDirs) {
        const st = await stat(join(dir, name));
        if (st.isDirectory()) {
            yield* getJavascriptFiles(join(dir, name));
        }
    }
}

module.exports = { toLowerCase, sliceTo, hasMember, getJavascriptFiles };
