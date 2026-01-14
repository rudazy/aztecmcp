// The "Trust Me" Shim
declare module '@aztec/pxe' {
    export const createPXEClient: (url: string) => any;
}

declare module '@aztec/accounts' {
    export const getSchnorrAccount: (pxe: any, secret: any, encryptionSecret: any, salt: any) => any;
}

declare module '@aztec/stdlib/fields' {
    export class Fr {
        static fromString(str: string): any;
        static ZERO: any;
    }
}
