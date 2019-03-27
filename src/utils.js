/**
 * @namespace Utils
 */

// CONSTANTS
const MEMBERS_PARAM = new Set([
    "class", "module", "namespace"
]);

/**
 * @func toLowerCase
 * @desc Buffer toLowerCase
 * @memberof Utils#
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
 * @func hasMember
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

module.exports = { toLowerCase, sliceTo, hasMember };
