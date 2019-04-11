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
const jsdoc = require("@slimio/jsdoc");

async function main() {
    const response = await jsdoc(process.cwd());
    console.log(JSON.stringify(response, null, 2));
}
main().catch(console.error);
```

## API
TBC

## Examples

<details><summary>Orphans</summary>
<br />

Take the given JSDoc:
```js
/**
 * @func sayHello
 * @desc hello world
 */

/**
 * @const foo
 * @type {String}
 */
```

After parsing it will produce the following object:
```js
{
    "_orphans": [
        {
            "func": "sayHello",
            "desc": true
        },
        {
            "const": "foo",
            "type": {
                "required": false,
                "opt": false,
                "desc": "",
                "type": "String",
                "defaultValue": null,
                "name": ""
            }
        }
    ]
}
```
</details>

<details><summary>Members</summary>
<br />

Take the given JSDoc:
```js
/**
 * @namespace Utils
 */

/**
 * @func sayHello
 * @memberof Utils
 */
```

After parsing it will produce the following object:
```js
{
    "_orphans": [],
    "utils": {
        "namespace": "Utils",
        "members": [
            {
                "func": "sayHello",
                "memberof": "Utils"
            }
        ]
    }
}
```
</details>

## License
MIT
