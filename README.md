# jsdoc
![version](https://img.shields.io/badge/version-0.1.0-blue.svg)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/is/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)

JSDoc Generator for SlimIO Projects

## Requirements
- Node.js v10 or higher

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

async function getBlocks(file) {
    const result = [];
    for await (const block of parseFile(file)) {
        result.push(block);
    }

    return result;
}

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
TBC

## Examples
TBC

## License
MIT
