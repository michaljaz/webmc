declare module 'macaddress' {
  export type MacAddresCallback = (err: any, data: any) => void;

  export type MacAddressOneCallback = (err: any, mac: string) => void;

  export function one(callback: MacAddressOneCallback): void;
  export function one(iface?: string): Promise<string>;
  export function one(iface: string, callback: MacAddressOneCallback): void;

  export function all(callback: MacAddresCallback): void;
  export function all(): Promise<any>;

  export function networkInterfaces(): any;
}
