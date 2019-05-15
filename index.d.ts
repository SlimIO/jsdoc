declare namespace jsdoc {
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

    interface LinkedBlock {
        orphans: Block[];
        members: {
            [name: string]: Block[];
        }
    }

    export function groupData(blocks: Block[]): LinkedBlock;
    export function parseJSDoc(buf: Buffer): Block;
    export function parseFile(location: string): AsyncIterableIterator<Block>;
}

export as namespace jsdoc;
export = jsdoc;
