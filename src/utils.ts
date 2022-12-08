import BigNumber from "bignumber.js";
import {
  Int,
  Nat,
  quipuswapV3CallTypes,
  quipuswapV3Types,
  tezosTypes,
} from "./types";
import { TezosToolkit, TransferParams } from "@taquito/taquito";
import { QuipuswapV3 } from ".";
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

export const initTimedCumulatives = (
  time,
): quipuswapV3Types.TimedCumulative => {
  return {
    time: time,
    tick: {
      sum: new quipuswapV3Types.x128(0),
      blockStartValue: new Int(0),
    },
    spl: {
      sum: new quipuswapV3Types.x128(0),
      blockStartLiquidityValue: new Int(0),
    },
  };
};

export const initTimedCumulativesBuffer = async (
  extraReservedSlots: Nat,
): Promise<quipuswapV3Types.TimedCumulativesBuffer> => {
  return {
    map: quipuswapV3Types.CumulativeBufferMap.initCustom(
      extraReservedSlots.toNumber(),
    ),
    first: new Int(0),
    last: new Int(0),
    reservedLength: new Nat(extraReservedSlots.toNumber() + 1),
  };
};

/**
 * @x `isInRange` y $ (down, up)@ checks that @x@ is in the range @[y - down, y + up]@.
 */
export const isInRange = (
  x: BigNumber,
  y: BigNumber,
  marginDown: BigNumber,
  marginUp: BigNumber,
): boolean => {
  return x.isGreaterThanOrEqualTo(y.minus(marginDown)) &&
    x.isLessThanOrEqualTo(y.plus(marginUp))
    ? true
    : false;
};

/**
 * -Similar to `isInRange`, but checks that the lower bound cannot be less than 0.
 */
export const isInRangeNat = (
  x: BigNumber,
  y: BigNumber,
  marginDown: BigNumber,
  marginUp: BigNumber,
): boolean => {
  const upperBound = y.plus(marginUp);
  const lowerBound = marginDown.isLessThanOrEqualTo(y)
    ? y.minus(marginDown)
    : new BigNumber(0);
  return x.isGreaterThanOrEqualTo(lowerBound) &&
    x.isLessThanOrEqualTo(upperBound)
    ? true
    : false;
};

export function actualLength(buffer: quipuswapV3Types.TimedCumulativesBuffer) {
  return buffer.last.minus(buffer.first).plus(1);
}

/**
 * Check that values grow monothonically (non-strictly).
 */
export function isMonotonic<T>(l: T[]) {
  return l.every((v, i) => i === 0 || l[i - 1] <= v);
}

/**
 * -- All records.
 */
export function entries(
  storage: quipuswapV3Types.Storage,
): quipuswapV3Types.TimedCumulative[] {
  const buffer = storage.cumulativesBuffer;
  const map = buffer.map.map;
  return Object.entries(map)
    .filter(
      ([k, _]) =>
        buffer.first.lte(new BigNumber(k)) && new BigNumber(k).lte(buffer.last),
    )
    .map(([_, v]) => v);
}

export const safeObserve = async (pool: QuipuswapV3, time: BigNumber) => {
  try {
    const {
      tick_cumulative: tickCumulative,
      seconds_per_liquidity_cumulative: secondsPerLiquidity,
    } = (await pool.observe([time.toString()]))[0];
    return {
      time: time,
      tickCumulative: tickCumulative,
      secondsPerLiquidity: secondsPerLiquidity,
    };
  } catch (e) {
    console.log(e);
    const block = await pool.tezos.rpc.getBlockHeader();
    const ts = new BigNumber(Date.parse(block.timestamp) / 1000)
      .plus(1)
      .integerValue(BigNumber.ROUND_FLOOR);
    return safeObserve(pool, ts);
  }
};
