"use strict";

// Require Node.js Dependencies
const { join } = require("path");

// Require Internal Dependencies
const { parseJSDoc, parseFile, groupData } = require("../index");
const is = require("@slimio/is");

// CONSTANTS
const FIXTURES = join(__dirname, "fixtures");

function assertJSDoc(ret) {
    if (!is.plainObject(ret)) {
        return false;
    }

    for (const value of Object.values(ret)) {
        if (!is.array(value) && !is.plainObject(value)) {
            return false;
        }

        if (is.array(value)) {
            const ret = value.every((row) => Reflect.has(row, "value"));
            if (!ret) {
                return false;
            }
        }
        else if (!Reflect.has(value, "value")) {
            return false;
        }
    }

    return true;
}

test("must parse a simple JSDoc annotation with @const & @name tag", () => {
    const ret = parseJSDoc(Buffer.from(`/**
    @const name
    @type {String}
    **/`));

    expect(assertJSDoc(ret)).toStrictEqual(true);
    expect(ret).toMatchSnapshot();
});

test("must parse a JSDoc annotation which contains multiple line @summary & a complete @property", () => {
    const ret = parseJSDoc(Buffer.from(`/**
    @summary A mutiline
    comment
    @property {String} [foo="bar"] a foo property
    **/`));

    expect(assertJSDoc(ret)).toStrictEqual(true);
    expect(ret).toMatchSnapshot();
});

test("must parse a JSDoc annotation with multiple tag & an @example", () => {
    const ret = parseJSDoc(Buffer.from(`/**
    @throws {TypeError}
    @throws {Error}
    @throws {SyntaxError}
    @example
    const str = "hello world!";
    console.log(str);
    **/`));

    expect(assertJSDoc(ret)).toStrictEqual(true);
    expect(ret).toMatchSnapshot();
});

test("must parse a JSDoc annotation of a generic class Method", () => {
    const ret = parseJSDoc(Buffer.from(`/**
    @async
    @method sayHello
    @property {!String} name a given name
    @property {Boolean=} recursive
    @returns {Promise<void>}
    **/`));

    expect(assertJSDoc(ret)).toStrictEqual(true);
    expect(ret).toMatchSnapshot();
});

test("must parse JSDoc from a Javascript file", async() => {
    const it = parseFile(join(FIXTURES, "caseA.js"));
    const blocks = [];
    for await (const block of it) {
        blocks.push(block);
    }
    expect(blocks).toMatchSnapshot();

    const linked = groupData(blocks);
    expect(linked.orphans).toHaveLength(1);
    expect(Object.keys(linked.members)).toHaveLength(1);
    expect(linked).toMatchSnapshot();
});

test("groupData blocks argument must be an Array like Object", async() => {
    try {
        groupData({});
        expect(true).toBe(false);
    }
    catch (error) {
        expect(error.name).toStrictEqual("TypeError");
        expect(error.message).toStrictEqual("blocks must be instanceof <Array>");
    }
});
