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

class Precision {
  static fromPrecision(precision: number) {
    return new BigNumber(10).pow(precision);
  }
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
export class Nat extends BigNumber {
  // _nat: BigNumber;
  constructor(number: BigNumber | number | string) {
    number = new BigNumber(number);
    if (number < new BigNumber(0) && !number.isInteger()) {
      throw new Error(`Invalid nat: ${number.toString()}`);
    }
    super(number);
  }

  fromPow(
    precision: number,
    roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_DOWN,
  ): BigNumber {
    return this.dividedBy(new BigNumber(10).pow(precision)).integerValue(
      roundingMode,
    );
  }
  toPow(
    precision: number,
    roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_DOWN,
  ): BigNumber {
    return this.multipliedBy(new BigNumber(10).pow(precision)).integerValue(
      roundingMode,
    );
  }
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

export class Int extends BigNumber {
  _int: BigNumber;
  constructor(number: BigNumber | number | string) {
    number = new BigNumber(number);
    if (!number.isInteger()) {
      throw new Error(`Invalid int: ${number}`);
    }
    super(number);
  }
  toString(): string {
    return this._int.toString();
  }
  toFixed(): string {
    return this._int.toFixed();
  }
  toBigNumber(): BigNumber {
    return this._int;
  }

  fromPow(
    precision: number,
    roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_DOWN,
  ): BigNumber {
    return this.dividedBy(new BigNumber(10).pow(precision)).integerValue(
      roundingMode,
    );
  }
  toPow(
    precision: number,
    roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_DOWN,
  ): BigNumber {
    return this.multipliedBy(new BigNumber(10).pow(precision)).integerValue(
      roundingMode,
    );
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
