# jsdoc
![version](https://img.shields.io/badge/version-0.1.0-blue.svg)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/is/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)

JSDoc Generator/Parser. (It use [jsdoc-extractor](https://github.com/fraxken/jsdoc-extractor) and [jsdoc-tokenizer](https://github.com/fraxken/jsdoc-tokenizer) under the hood).

## Requirements
- [Node.js](https://nodejs.org/en/) v10 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @slimio/jsdoc
# or
$ yarn add @slimio/jsdoc
```

## Usage example
The method will search all JavaScript files at the given location to parse the inner JSDoc.
```js
const { parseFile, groupData } = require("@slimio/jsdoc");

async function main() {
    const fileBlocks = [];
    for await (const block of parseFile("./yourFile.js")) {
        fileBlocks.push(block);
    }

    const finalResult = groupData(fileBlocks);
    console.log(JSON.stringify(finalResult, null, 4));
}
main().catch(console.error);
```

## API

<details><summary>parseJSDoc(buf: Buffer): Block</summary>
<br />

Parse a JSDoc block (in Buffer format). Return an Object described by the following interface:
```ts
interface Descriptor {
    value: any;
    name?: string;
    desc?: string;
    default?: any;
    required?: boolean;
}

interface Block {
    [key: string]: Descriptor | Descriptor[];
}
```

Take the following example:
```js
const block = parseJSDoc(Buffer.from(`/**
@const name
@type {String}
**/`));
console.log(block.const.value); // name
console.log(block.type.value); // String
```
</details>

<details><summary>parseFile(location: string): AsyncIterableIterator< Block ></summary>
<br />

This method will read a given file, extract and parse all JSDoc blocks. The method return a Asynchronous iterator to be able to stop the parsing at any time.
```js
const jsdoc = [];
const iterator = parseFile("./yourFile.js");
for await (const block of iterator) {
    jsdoc.push(block);
}
```
</details>

<details><summary>groupData(blocks: Block[]): LinkedBlock</summary>
<br />

Link (group) blocks by **namespace**, **modules** or **class** (Else the block will be handled as an orphan). The method return an Object described by the following interface:

```ts
interface LinkedBlock {
    orphans: Block[];
    members: {
        [name: string]: Block[];
    }
}
```

</details>

## Dependencies

|Name|Refactoring|Security Risk|Usage|
|---|---|---|---|
|[jsdoc-extractor](https://github.com/fraxken/jsdoc-extractor#readme)|⚠️Major|Low|Extract JSDoc annotations from Javascript Files|
|[jsdoc-tokenizer](https://github.com/fraxken/jsdoc_tokenizer#readme)|⚠️Major|Low|Parse JSDoc annotations and return Tokens|

## License
MIT
