declare class Biome {
    id: number;
    name: string;
    color?: number;
    displayName?: string;
    rainfall: number;
    temperature: number;
    height?: number | null;
}
export declare function loader(mcVersion: string): keyof Biome;