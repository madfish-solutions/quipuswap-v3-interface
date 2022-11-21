import { Nat, quipuswapV3Types, tezosTypes } from "./types";
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
export declare const initTimedCumulatives: (time: any) => quipuswapV3Types.TimedCumulative;
export declare const initTimedCumulativesBuffer: (extraReservedSlots: Nat) => Promise<quipuswapV3Types.TimedCumulativesBuffer>;
export {};
