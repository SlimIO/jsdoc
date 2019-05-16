// Require Third-party Dependencies
const avaTest = require("ava");

// Require Internal Dependencies
const { parseJSDoc } = require("../index");
const is = require("@slimio/is");

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

avaTest("Assert doc 01 (Simple case)", (assert) => {
    const ret = parseJSDoc(Buffer.from(`/**
    @const name
    @type {String}
    **/`));

    assert.true(assertJSDoc(ret));
    assert.deepEqual(Object.keys(ret), ["const", "type"]);
    assert.is(ret.const.value, "name");
    assert.is(ret.type.value, "String");
});

avaTest("Assert doc 02 (multiline & complete property)", (assert) => {
    const ret = parseJSDoc(Buffer.from(`/**
    @summary A mutiline
    comment
    @property {String} [foo="bar"] a foo property
    **/`));

    assert.true(assertJSDoc(ret));
    assert.deepEqual(Object.keys(ret), ["summary", "property"]);
    assert.is(ret.summary.value, "A mutiline\ncomment");
    assert.deepEqual(ret.property, {
        value: "String",
        default: "\"bar\"",
        required: false,
        name: "foo",
        desc: "a foo property"
    });
});

avaTest("Assert doc 03 (example & multiple properties)", (assert) => {
    const ret = parseJSDoc(Buffer.from(`/**
    @throws {TypeError}
    @throws {Error}
    @example
    const str = "hello world!";
    console.log(str);
    **/`));

    assert.true(assertJSDoc(ret));
    assert.deepEqual(Object.keys(ret), ["throws", "example"]);
    assert.is(ret.example.value, "const str = \"hello world!\";    console.log(str);");
    assert.deepEqual(ret.throws, [{ value: "TypeError" }, { value: "Error" }]);
});

avaTest("Assert doc 04 (typedef)", (assert) => {
    const ret = parseJSDoc(Buffer.from(`/**
    @async
    @method sayHello
    @property {!String} name a given name
    @property {Boolean=} recursive
    @returns {Promise<void>}
    **/`));

    console.log(ret);
    assert.true(assertJSDoc(ret));
    assert.deepEqual(Object.keys(ret), ["async", "method", "property", "returns"]);
    assert.is(ret.async.value, true);
    assert.is(ret.method.value, "sayHello");
    assert.true(is.array(ret.property));
    assert.deepEqual(ret.returns, { value: "Promise<void>" });
});
