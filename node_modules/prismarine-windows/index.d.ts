/// <reference types="node" />
/// <reference types="prismarine-item" />

import {EventEmitter} from 'events';
import {Item} from 'prismarine-item';

declare class Window extends EventEmitter {
    constructor (id: number, type: number | string, title: string, slotCount: number, inventorySlotsRange: { start: number, end: number }, craftingResultSlot: number, requiresConfirmation: boolean);
    id: number;
    type: number | string;
    title: string;
    slots: Array<Item>;
    inventoryStart: number;
    inventoryEnd: number;
    craftingResultSlot: number;
    requiresConfirmation: boolean;
    selectedItem: Item | null;
    acceptClick(click: Click): void;
    acceptOutsideWindowClick(click: Click): void;
    acceptInventoryClick(click: Click): void;
    acceptNonInventorySwapAreaClick(click: Click): void;
    acceptNonInventorySwapAreaClick(click: Click): void;
    acceptSwapAreaLeftClick(click: Click): void;
    acceptCraftingClick(click: Click): void;
    updateSlot(slot: number, newItem: Item): void;
    findItemRange(start: number, end: number, itemType: number, metadata: number | null, notFull: boolean): Item | null;
    findInventoryItem(itemType: number, metadata: number | null, notFull: boolean): Item | null;
    firstEmptySlotRange(start: number, end: number): number | null;
    firstEmptyInventorySlot(): number | null;
    countRange(start: number, end: null, itemType: number, metadata: number | null): number;
    itemsRange(start: number, end: number): Array<Item>;
    count(itemType: number | string, metadata: number | null): number;
    items(): Array<Item>;
    emptySlotCount(): number;
    transactionRequiresConfirmation(click?: Click): boolean;
}
declare interface Click {
    mode: number;
    mouseButton: number;
    slot: number;
}
declare interface WindowInfo {
    type: number | string;
    inventory: { start: number, end: number };
    slots: number;
    craft: number;
    requireConfirmation: boolean;
}

declare interface WindowsExports {
    createWindow(id: number, type: number | string, title: string, slotCount?: number): Window;
    Window: typeof Window;
    windows: {[key: string]: WindowInfo};
}
export declare function loader(mcVersion: string): WindowsExports;