"use strict";

/**
 * @namespace Utils
 */

// Require Node.js Dependencies
const { readdir, stat } = require("fs").promises;
const { join, extname } = require("path");

// CONSTANTS
const MEMBER_PARAM = new Set(["class", "module", "namespace"]);
const EXCLUDE_DIRS = new Set(["node_modules", "test", "tests", "coverage", ".vscode", ".git"]);

/**
 * @function hasMember
 * @memberof Utils
 * @param {!object} block JSDoc block
 * @returns {[boolean, string]}
 */
function hasMember(block) {
    for (const name of MEMBER_PARAM) {
        if (Reflect.has(block, name)) {
            return [true, name];
        }
    }

    return [false, null];
}

/**
 * @async
 * @generator
 * @function getJavascriptFiles
 * @memberof Utils
 * @param {!string} dir root directory
 * @returns {AsyncIterableIterator<string>}
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

module.exports = { getJavascriptFiles, hasMember };
