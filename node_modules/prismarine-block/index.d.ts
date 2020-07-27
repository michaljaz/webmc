/// <reference types="vec3" />
/// <reference types="prismarine-biome" />

import {Vec3} from 'vec3';
import {Biome} from 'prismarine-biome';

declare class Block {
    constructor(type: number, biomeId: number, metadata: number, stateId?: number);

    type: number;
    metadata: number;
    light: number;
    skyLight: number;
    biome: Biome;
    position: Vec3;
    stateId?: number;
    name: string;
    displayName: string;
    hardness: number;
    boundingBox: string;
    diggable: boolean;
    material?: string | null;
    harvestTools?: { [k: string]: boolean };
    drops?: Array<number | { minCount?: number, maxCount?: number, drop: number | { id: number, metadata: number } }>;
    signText?: string;
    painting?: object;

    canHarvest(heldItemType: number | null): boolean;
    digTime(heldItemType: number | null, creative: boolean, inWater: boolean, notOnGround: boolean): number;
    fromStateId(stateId: number, biomeId: number): Block;
}

export declare function loader(mcVersion: string): typeof Block;