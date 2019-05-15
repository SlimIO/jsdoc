const { parseFile, groupData } = require("./");

async function getBlocks(file) {
    const result = [];
    for await (const block of parseFile(file)) {
        result.push(block);
    }

    return result;
}

async function main() {
    const result = await getBlocks("./test/doc.js");
    const link = groupData(result);

    console.log(JSON.stringify(link, null, 4));
}
main().catch(console.error);
