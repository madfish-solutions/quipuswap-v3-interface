import { Contract, TezosToolkit, TransferParams } from "@taquito/taquito";
import { BatchWalletOperation } from "@taquito/taquito/dist/types/wallet/batch-operation";
import { CallMode } from "../types";
import { sendBatch } from "../utils";
import { confirmOperation } from "./confirmation";

export function paramsOnly<T>(
  contract: Contract,
  callback: (contract: Contract, ...params: T[]) => TransferParams,
  ...callParams: T[]
): TransferParams {
  const transferParams = callback(contract, ...callParams);
  return transferParams;
}

export async function send<T>(
  contract: Contract,
  tezos: TezosToolkit,
  callback: (contract: Contract, ...params: T[]) => TransferParams,
  ...callParams: T[]
): Promise<BatchWalletOperation> {
  const transferParams = callback(contract, ...callParams);
  const operation = await sendBatch(tezos, [transferParams]);
  return operation;
}

export async function sendAndConfirmation<T>(
  contract: Contract,
  tezos: TezosToolkit,
  callback: (contract: Contract, ...params: T[]) => TransferParams,
  SYNC_INTERVAL: number,
  CONFIRM_TIMEOUT: number,
  ...callParams: T[]
) {
  const transferParams = callback(contract, ...callParams);
  try {
    const operation = await sendBatch(tezos, [transferParams]);
    await confirmOperation(
      tezos,
      operation.opHash,
      CONFIRM_TIMEOUT,
      SYNC_INTERVAL,
    );
    return operation;
  } catch (error) {
    throw error;
  }
}

export function extendCallQS<T>(
  target: Object,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const f = descriptor.value;

  descriptor.value = async function (...args: T[]) {
    const { callParams, callback } = await f(...args);
    switch (this.callSettings[propertyKey]) {
      case CallMode.returnOperation:
        return send(this.contract, this.tezos, callback, ...callParams);
      case CallMode.returnConfirmatedOperation:
        return sendAndConfirmation(
          this.contract,
          this.tezos,
          callback,
          this.syncInterval,
          this.confirmtaionTimeout,
          ...callParams,
        );
      default:
        return paramsOnly(this.contract, callback, ...callParams);
    }
  };

  Object.defineProperty(target, propertyKey, descriptor);
}
