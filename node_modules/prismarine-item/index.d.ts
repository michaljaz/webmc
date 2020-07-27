/// <reference types="node" />

declare class Item {
    constructor(type: number, count: number, metadata?: number, nbt?: object);
    type: number;
    count: number;
    metadata: number;
    nbt: Buffer | null;
    name: string;
    displayName: string;
    stackSize: number;
    static equal(item1: Item, item2: Item): boolean;
    static toNotch(item: Item): NotchItem;
    static fromNotch(item: NotchItem): Item;
}
declare interface NotchItem {
    // 1.8 - 1.12
    blockId?: number;
    itemDamage?: number;
    // 1.13 - 1.15
    present?: boolean;
    itemId?: number;

    itemCount?: number;
    nbtData?: Buffer;
}
export declare function loader(mcVersion: string): keyof Item;