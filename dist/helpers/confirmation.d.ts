import { OperationEntry, BlockResponse } from "@taquito/rpc";
import { TezosToolkit } from "@taquito/taquito";
export type ConfirmOperationOptions = {
    initializedAt?: number;
    fromBlockLevel?: number;
    signal?: AbortSignal;
};
export declare function confirmOperation(tezos: TezosToolkit, opHash: string, CONFIRM_TIMEOUT: number, SYNC_INTERVAL: number, { initializedAt, fromBlockLevel, signal }?: ConfirmOperationOptions): Promise<OperationEntry>;
export declare function findOperation(block: BlockResponse, opHash: string): Promise<OperationEntry>;
export declare function getOriginatedContractAddress(opEntry: OperationEntry): string;
