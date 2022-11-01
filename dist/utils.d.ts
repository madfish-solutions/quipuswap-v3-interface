import BigNumber from "bignumber.js";
import { tezosTypes } from "./types";
import { TezosToolkit, TransferParams } from "@taquito/taquito";
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
 * nat.toNumber() // 100
 * nat.toString() // '100'
 * nat.plus(1).toString() // '101'
 * nat.toPow(2).toString() // '10000'
 * nat.fromPow(2).toString() // '1'
 */
export declare class Nat extends BigNumber {
    constructor(number: BigNumber | number | string);
    fromPow(precision: number, roundingMode?: BigNumber.RoundingMode): BigNumber;
    toPow(precision: number, roundingMode?: BigNumber.RoundingMode): BigNumber;
}
/**
 * @category Utils
 * @description Utility class to represent a Tezos Int type which is a BigNumber
 * @example
 * const int = new Int('new BigNumber(-100)')
 * int.toString() // '-100'
 * int.toFixed() // '-100'
 * int.fromPrecision(6) // BigNumber(-0.0001)
 * int.toPrecision(6) // BigNumber(-1000000)
 */
export declare class Int extends BigNumber {
    constructor(number: BigNumber | number | string);
    fromPow(precision: number, roundingMode?: BigNumber.RoundingMode): BigNumber;
    toPow(precision: number, roundingMode?: BigNumber.RoundingMode): BigNumber;
}
export declare class Timestamp {
    _timestamp: string;
    constructor(timestamp: string);
    toString(): string;
}
/**
 * @category Utils
 */
export declare function batchify<B extends tezosTypes.Batch>(batch: B, transfers: TransferParams[]): B;
/** @category Utils
 * @description Utility function to send a batch of operations
 * @example
 * const batch = await sendBatch(tezos, [transferParams])
 */
export declare const sendBatch: (tezos: TezosToolkit, operationParams: TransferParams[]) => Promise<import("@taquito/taquito/dist/types/wallet/batch-operation").BatchWalletOperation>;
export {};
