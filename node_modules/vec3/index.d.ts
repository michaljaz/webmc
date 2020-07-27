export class Vec3 {
    constructor(x: number, y: number, z: number);

    x: number;
    y: number;
    z: number;

    set(x: number, y: number, z: number): this;

    update(other: Vec3): this;

    floored(): Vec3;

    floor(): this;

    offset(dx: number, dy: number, dz: number): Vec3;

    translate(dx: number, dy: number, dz: number): this;

    add(other: Vec3): this;

    subtract(other: Vec3): this;

    plus(other: Vec3): Vec3;

    minus(other: Vec3): Vec3;

    scaled(scalar: number): Vec3;

    abs(): Vec3;

    volume(): number;

    modulus(other: Vec3): Vec3;

    distanceTo(other: Vec3): number;

    distanceSquared(other: Vec3): number;

    equals(other: Vec3): boolean;

    toString(): string;

    clone(): Vec3;

    min(other: Vec3): Vec3;

    max(other: Vec3): Vec3;

    dot(other: Vec3): number;

    cross(other: Vec3): Vec3;

    norm(): number;

    unit(): Vec3;

    normalize(): Vec3;

    scale(scalar): this;

    xyDistanceTo(other: Vec3): number;

    xzDistanceTo(other: Vec3): number;

    yzDistanceTo(other: Vec3): number;

    innerProduct(other: Vec3): number;

    manhattanDistanceTo(other: Vec3): number;

    toArray(): Array<number>;
}

export default function v(
    x: null | Array<number | string> | {x: number | string, y: number | string, z: number | string} | string,
    y?: number | string,
    z?: number | string
): Vec3;
