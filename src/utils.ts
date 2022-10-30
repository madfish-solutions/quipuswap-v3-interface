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
    if (~validateAddress(address)) {
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

/**
 * @category Utils
 * @description Utility class to represent a Tezos Nat type which is a BigNumber
 * @example
 * const nat = new Nat('100')
 */
export class Nat {
  _nat: BigNumber;
  constructor(number: BigNumber) {
    if (number < new BigNumber(0) && !number.isInteger()) {
      throw new Error(`Invalid nat: ${number}`);
    }
    this._nat = number;
  }
  toString(): string {
    return this._nat.toString();
  }
  toFixed(): string {
    return this._nat.toFixed();
  }
  fromPrecision(
    precision: number,
    roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_DOWN,
  ): BigNumber {
    return this._nat
      .dividedBy(new BigNumber(10).pow(precision))
      .integerValue(roundingMode);
  }
  toPrecision(precision: number) {
    return this._nat.multipliedBy(new BigNumber(10).pow(precision));
  }
}

/**
 * @category Utils
 * @description Utility class to represent a Tezos Int type which is a BigNumber
 * @example
 * const int = new Int('-100')
 */
export class Int {
  _int: BigNumber;
  constructor(number: BigNumber) {
    if (!number.isInteger()) {
      throw new Error(`Invalid int: ${number}`);
    }
    this._int = number;
  }
  toString(): string {
    return this._int.toString();
  }
  toFixed(): string {
    return this._int.toFixed();
  }

  fromPrecision(
    precision: number,
    roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_DOWN,
  ): BigNumber {
    return this._int
      .dividedBy(new BigNumber(10).pow(precision))
      .integerValue(roundingMode);
  }
}

export function batchify<B extends tezosTypes.Batch>(
  batch: B,
  transfers: TransferParams[],
): B {
  for (const tParams of transfers) {
    batch.withTransfer(tParams);
  }
  return batch;
}

export const sendBatch = async (
  tezos: TezosToolkit,
  operationParams: TransferParams[],
) => await batchify(tezos.wallet.batch([]), operationParams).send();
