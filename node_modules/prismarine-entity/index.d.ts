/// <reference types="node" />
/// <reference types="vec3" />
/// <reference types="prismarine-item" />

import {EventEmitter} from 'events';
import { Vec3 } from 'vec3';
import { Item } from 'prismarine-item';

declare module 'prismarine-entity' {
    export class Entity extends EventEmitter {
        constructor(id: number);
        type: EntityType;
        username?: string;
        mobType?: string;
        displayName?: string;
        entityType?: number;
        kind?: string;
        name?: string;
        objectType?: string;
        count?: number;
        position: Vec3;
        velocity: Vec3;
        yaw: number;
        pitch: number;
        height: number;
        onGround: boolean;
        equipment: Array<Item>;
        heldItem: Item;
        metadata: Array<object>;
        isValid: boolean;
        health?: number;
        food?: number;
        player?: object;
        setEquipment(index: number, item: Item): void;
    }

    export type EntityType = 'player' | 'mob' | 'object' | 'global' | 'orb' | 'other';
}