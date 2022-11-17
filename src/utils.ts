import BigNumber from "bignumber.js";
import { tezosTypes } from "./types";
import { TezosToolkit, TransferParams } from "@taquito/taquito";
const { validateAddress } = require("@taquito/utils");

/**
 * @category Utils
 */
class AddressPrimitive {
  _address: string;
  constructor(address: string) {
    if (validateAddress(address) != 3) {
      throw new Error(`Invalid address: ${address}`);
    }
    this._address = address.toString();
  }
  toString() {
    return this._address;
  }
}
/**
 * @category Utils
 */
export class Address extends AddressPrimitive {
  constructor(address: string) {
    super(address);
  }
}

export class Timestamp {
  _timestamp: string;
  constructor(timestamp: string) {
    let newTimestamp = Number(timestamp);

    if (isNaN(newTimestamp)) {
      newTimestamp = Math.round(Date.parse(timestamp) / 1000);
      if (isNaN(newTimestamp)) {
        throw new Error(`Invalid timestamp: ${timestamp}`);
      }
    } else if (newTimestamp < 0) {
      throw new Error(`Invalid timestamp: ${timestamp}`);
    }
    this._timestamp = newTimestamp.toString();
  }

  toString() {
    return this._timestamp;
  }
}

/**
 * @category Utils
 */
export function batchify<B extends tezosTypes.Batch>(
  batch: B,
  transfers: TransferParams[],
): B {
  for (const tParams of transfers) {
    batch.withTransfer(tParams);
  }
  return batch;
}

/** @category Utils
 * @description Utility function to send a batch of operations
 * @example
 * const batch = await sendBatch(tezos, [transferParams])
 */
export const sendBatch = async (
  tezos: TezosToolkit,
  operationParams: TransferParams[],
) => batchify(tezos.wallet.batch([]), operationParams).send();
