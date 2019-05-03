declare namespace jsdoc {
    interface linkBlock {
        _orphans: block[];
        [name: string]: block;
    }

    interface block {
        [key: string]: string;
        members?: block[];
    }

    interface response {
        [file: string]: linkBlock;
    }
}

declare function jsdoc(dir: string, include?: string[]): Promise<jsdoc.response>;

export as namespace jsdoc;
export = jsdoc;
