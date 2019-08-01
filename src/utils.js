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

module.exports = { hasMember };
