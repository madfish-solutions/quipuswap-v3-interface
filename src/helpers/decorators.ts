import { Contract, TezosToolkit, TransferParams } from "@taquito/taquito";
import { BatchWalletOperation } from "@taquito/taquito/dist/types/wallet/batch-operation";
import { sendBatch } from "../utils";
import { confirmOperation } from "./confirmation";

export function paramsOnly<T>(
  contract: Contract,
  callback: (contract: Contract, ...params: T[]) => TransferParams,
  ...callParams: T[]
): TransferParams {
  try {
    const transferParams = callback(contract, ...callParams);

    return transferParams;
  } catch (error) {}
}

export async function send<T>(
  contract: Contract,
  tezos: TezosToolkit,
  callback: (contract: Contract, ...params: T[]) => TransferParams,
  ...callParams: T[]
): Promise<BatchWalletOperation> {
  try {
    const transferParams = callback(contract, ...callParams);
    const operation = await sendBatch(tezos, [transferParams]);
    return operation;
  } catch (error) {
    console.log(error);
  }
}

export async function sendAndConfirmation<T>(
  contract: Contract,
  tezos: TezosToolkit,
  callback: (contract: Contract, ...params: T[]) => TransferParams,
  SYNC_INTERVAL: number,
  CONFIRM_TIMEOUT: number,
  ...callParams: T[]
) {
  try {
    const transferParams = callback(contract, ...callParams);
    const operation = await sendBatch(tezos, [transferParams]);
    await confirmOperation(
      tezos,
      operation.opHash,
      CONFIRM_TIMEOUT,
      SYNC_INTERVAL,
    );
    return operation;
  } catch (error) {
    console.log(error);
  }
}

export async function extendCallQS<T>(
  target: Object,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const f = descriptor.value;

  descriptor.value = async function (...args: T[]) {
    const { callParams, callback } = f(...args);
    switch (this.callSettings[propertyKey]) {
      case "returnOperation":
        return send(this.contract, callback, this.tezos, ...callParams);
      case "returnConfirmatedOperation":
        return sendAndConfirmation(
          this.contract,
          callback,
          this.tezos,
          this.SYNC_INTERVAL,
          this.CONFIRM_TIMEOUT,
          ...callParams,
        );
      default:
        return paramsOnly(this.contract, callback, ...callParams);
    }
  };

  Object.defineProperty(target, propertyKey, descriptor);
}
