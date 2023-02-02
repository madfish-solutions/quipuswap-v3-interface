import { Contract, TezosToolkit, TransferParams } from '@taquito/taquito';
import { BatchWalletOperation } from '@taquito/taquito/dist/types/wallet/batch-operation';
export declare function paramsOnly<T>(contract: Contract, callback: (contract: Contract, ...params: T[]) => TransferParams, ...callParams: T[]): TransferParams;
export declare function send<T>(contract: Contract, tezos: TezosToolkit, callback: (contract: Contract, ...params: T[]) => TransferParams, ...callParams: T[]): Promise<BatchWalletOperation>;
export declare function sendAndConfirmation<T>(contract: Contract, tezos: TezosToolkit, callback: (contract: Contract, ...params: T[]) => TransferParams, SYNC_INTERVAL: number, CONFIRM_TIMEOUT: number, ...callParams: T[]): Promise<BatchWalletOperation>;
export declare function extendCallQS<T>(target: Object, propertyKey: string, descriptor: PropertyDescriptor): void;
