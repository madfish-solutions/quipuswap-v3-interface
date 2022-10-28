import { OperationEntry, BlockResponse } from "@taquito/rpc";
import { TezosToolkit } from "@taquito/taquito";
export declare const SYNC_INTERVAL: number;
export declare const CONFIRM_TIMEOUT: number;
export declare type ConfirmOperationOptions = {
    initializedAt?: number;
    fromBlockLevel?: number;
    signal?: AbortSignal;
};
export declare function confirmOperation(tezos: TezosToolkit, opHash: string, { initializedAt, fromBlockLevel, signal }?: ConfirmOperationOptions): Promise<OperationEntry>;
export declare function findOperation(block: BlockResponse, opHash: string): Promise<OperationEntry>;
export declare function getOriginatedContractAddress(opEntry: OperationEntry): string;
