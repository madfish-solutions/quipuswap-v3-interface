import BigNumber from "bignumber.js";
/**
 * @category Utils
 */
declare class AddressPrimitive {
    _address: string;
    constructor(address: string);
    toString(): string;
}
/**
 * @category Utils
 */
export declare class Address extends AddressPrimitive {
    constructor(address: string);
}
/**
 * @category Utils
 * @description Utility class to represent a Tezos Nat type which is a BigNumber
 * @example
 * const nat = new Nat('100')
 */
export declare class Nat {
    _nat: BigNumber;
    constructor(number: BigNumber);
    toString(): string;
    toFixed(): string;
    fromPrecision(precision: number, roundingMode?: BigNumber.RoundingMode): BigNumber;
    toPrecision(precision: number): BigNumber;
}
/**
 * @category Utils
 * @description Utility class to represent a Tezos Int type which is a BigNumber
 * @example
 * const int = new Int('-100')
 */
export declare class Int {
    _int: BigNumber;
    constructor(number: BigNumber);
    toString(): string;
    toFixed(): string;
    fromPrecision(precision: number, roundingMode?: BigNumber.RoundingMode): BigNumber;
}
export {};
