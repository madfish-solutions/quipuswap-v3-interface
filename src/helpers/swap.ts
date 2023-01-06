import BigNumber from "bignumber.js";

import { Int, Nat, quipuswapV3Types } from "../types";
import {
  calcNewPriceX,
  calcNewPriceY,
  calcSwapFee,
  shiftLeft,
  shiftRight,
  sqrtPriceForTick
} from "./math";

export class TooBigPriceChangeErr extends Error {}

type SwapRequiredCumulative = Pick<quipuswapV3Types.TimedCumulative, "tick">;
type SwapRequiredConstants = Pick<quipuswapV3Types.Constants, "feeBps">;

type SwapRequiredTickState = Pick<
  quipuswapV3Types.TickState,
  "prev" | "next" | "sqrtPrice" | "tickCumulativeOutside" | "liquidityNet"
>;

interface SwapRequiredStorage extends Pick<
  quipuswapV3Types.Storage,
  "liquidity" | "sqrtPrice" | "curTickIndex" | "curTickWitness"
> {
  ticks: Record<string, SwapRequiredTickState>;
  constants: SwapRequiredConstants;
  lastCumulative: SwapRequiredCumulative;
}

interface XToYRecParam {
  s: SwapRequiredStorage;
  dx: Nat;
  dy: Nat;
}

type YToXRecParam = XToYRecParam;

const HUNDRED_PERCENT_BPS = 10000;

function floorLogHalfBps(x: Nat, y: Nat, outOfBoundsError: Error) {
  const tenx = x.multipliedBy(10);

  if (tenx.isLessThan(y.multipliedBy(7)) || tenx.isGreaterThan(y.multipliedBy(15))) {
    throw outOfBoundsError;
  }

  const xPlusY = x.plus(y);
  const num = x.toBignumber().minus(y).multipliedBy(60003).multipliedBy(xPlusY);
  const denom = xPlusY.multipliedBy(xPlusY).plus(x.multipliedBy(2).multipliedBy(y));

  return num.dividedToIntegerBy(denom);
}

function fixCurTickIndexRec(
  curTickIndexNew: Int,
  curIndexSqrtPrice: Nat,
  sqrtPriceNew: Nat
): Int {
  if (sqrtPriceNew.isLessThan(curIndexSqrtPrice)) {
    const prevTickIndex = curTickIndexNew.minus(1);
    const prevIndexSqrtPrice = sqrtPriceForTick(prevTickIndex);

    return fixCurTickIndexRec(prevTickIndex, prevIndexSqrtPrice, sqrtPriceNew);
  } else {
    const nextTickIndex = curTickIndexNew.plus(1);
    const nextIndexSqrtPrice = sqrtPriceForTick(nextTickIndex);

    if (nextIndexSqrtPrice.isLessThanOrEqualTo(sqrtPriceNew)) {
      return fixCurTickIndexRec(nextTickIndex, nextIndexSqrtPrice, sqrtPriceNew);
    } else {
      return curTickIndexNew;
    }
  }
}

function fixCurTickIndex(curTickIndex: Int, sqrtPriceNew: Nat) {
  return fixCurTickIndexRec(curTickIndex, sqrtPriceForTick(curTickIndex), sqrtPriceNew);
}

function calcNewCurTickIndex(curTickIndex: Int, sqrtPriceOld: Nat, sqrtPriceNew: Nat) {
  const curTickIndexDelta = floorLogHalfBps(
    sqrtPriceNew,
    sqrtPriceOld,
    new TooBigPriceChangeErr()
  );

  const curTickIndexNew = curTickIndex.plus(curTickIndexDelta);

  return fixCurTickIndex(curTickIndexNew, sqrtPriceNew);
}

function oneMinusFeeBps(feeBps: Nat) {
  return new Nat(HUNDRED_PERCENT_BPS).minus(feeBps);
}

function xToYRec(p: XToYRecParam): XToYRecParam {
  if (p.s.liquidity.isZero()) {
    return p;
  }

  // TODO: change fees logic after new Quipuswap V3 contracts are deployed
  let fee = calcSwapFee(p.s.constants.feeBps.toBignumber(), p.dx.toBignumber());
  let sqrtPriceNew = calcNewPriceX(p.s.sqrtPrice, p.s.liquidity, p.dx.minus(fee));
  const curTickIndexNew = calcNewCurTickIndex(p.s.curTickIndex, p.s.sqrtPrice, sqrtPriceNew);
  if (curTickIndexNew.gte(p.s.curTickWitness)) {
    const dy = shiftRight(
      p.s.sqrtPrice.toBignumber().minus(sqrtPriceNew).multipliedBy(p.s.liquidity),
      new BigNumber(80)
    ).integerValue(BigNumber.ROUND_FLOOR);
    const newStorage = {
      ...p.s,
      sqrtPrice: sqrtPriceNew,
      curTickIndex: curTickIndexNew
    };

    return {
      s: newStorage,
      dx: new Nat(0),
      dy: p.dy.plus(dy)
    };
  }
  const tick = p.s.ticks[p.s.curTickWitness.toFixed()];
  const loNew = tick.prev;
  sqrtPriceNew = new quipuswapV3Types.x80n(tick.sqrtPrice.minus(1));
  const dy = shiftRight(
    p.s.sqrtPrice.toBignumber().minus(sqrtPriceNew).multipliedBy(p.s.liquidity),
    new BigNumber(80)
  ).integerValue(BigNumber.ROUND_FLOOR);
  const dxForDy = shiftLeft(dy, new BigNumber(160))
    .dividedBy(p.s.sqrtPrice.multipliedBy(sqrtPriceNew))
    .integerValue(BigNumber.ROUND_CEIL);
  const dxConsumed = dxForDy
    .multipliedBy(HUNDRED_PERCENT_BPS)
    .dividedBy(oneMinusFeeBps(p.s.constants.feeBps))
    .integerValue(BigNumber.ROUND_CEIL);
  fee = dxConsumed.minus(dxForDy);
  const sums = p.s.lastCumulative;
  const tickCumulativeOutsideNew = sums.tick.sum.minus(tick.tickCumulativeOutside);
  const tickNew = {
    ...tick,
    tickCumulativeOutside: tickCumulativeOutsideNew
  };
  const ticksNew: Record<string, SwapRequiredTickState> = {
    ...p.s.ticks,
    [p.s.curTickWitness.toFixed()]: tickNew
  };
  const storageNew = {
    ...p.s,
    curTickWitness: loNew,
    sqrtPrice: sqrtPriceNew,
    curTickIndex: curTickIndexNew.minus(1),
    ticks: ticksNew,
    liquidity: p.s.liquidity.minus(tick.liquidityNet)
  };
  const paramNew = {
    s: storageNew,
    dx: p.dx.minus(dxConsumed),
    dy: p.dy.plus(dy)
  };

  return xToYRec(paramNew);
}

export function calculateXToY(s: SwapRequiredStorage, dx: Nat) {
  const r = xToYRec({ s, dx, dy: new Nat(0) });

  return {
    output: r.dy,
    inputLeft: r.dx,
    newStoragePart: r.s
  };
}

function yToXRec(p: YToXRecParam): YToXRecParam {
  if (p.s.liquidity.isZero()) {
    return p;
  }

  // TODO: change fees logic after new Quipuswap V3 contracts are deployed
  let fee = calcSwapFee(p.s.constants.feeBps.toBignumber(), p.dy.toBignumber());
  let dyMinusFee = p.dy.minus(fee);
  let sqrtPriceNew = calcNewPriceY(p.s.sqrtPrice, p.s.liquidity, dyMinusFee);
  const curTickIndexNew = calcNewCurTickIndex(p.s.curTickIndex, p.s.sqrtPrice, sqrtPriceNew);
  const tick = p.s.ticks[p.s.curTickWitness.toFixed()];
  const nextTickIndex = tick.next;
  if (curTickIndexNew.lt(nextTickIndex)) {
    const dx = p.s.liquidity
      .toBignumber()
      .multipliedBy(shiftLeft(sqrtPriceNew.toBignumber().minus(p.s.sqrtPrice), new BigNumber(80)))
      .dividedBy(sqrtPriceNew.multipliedBy(p.s.sqrtPrice))
      .integerValue(BigNumber.ROUND_FLOOR);
    const sNew = {
      ...p.s,
      sqrtPrice: new quipuswapV3Types.x80n(sqrtPriceNew),
      curTickIndex: curTickIndexNew
    };

    return { s: sNew, dy: new Nat(0), dx: p.dx.plus(dx) };
  }

  const nextTick = p.s.ticks[nextTickIndex.toFixed()];
  sqrtPriceNew = nextTick.sqrtPrice;

  const dx = new Nat(
    p.s.liquidity
      .toBignumber()
      .multipliedBy(shiftLeft(sqrtPriceNew.toBignumber().minus(p.s.sqrtPrice), new BigNumber(80)))
      .dividedBy(sqrtPriceNew.multipliedBy(p.s.sqrtPrice))
      .integerValue(BigNumber.ROUND_FLOOR)
  );
  const _280 = new BigNumber(2).pow(80);
  const dyForDx = new Nat(
    p.s.liquidity
      .toBignumber()
      .multipliedBy(sqrtPriceNew.toBignumber().minus(p.s.sqrtPrice))
      .dividedBy(_280)
      .integerValue(BigNumber.ROUND_CEIL)
  );
  dyMinusFee = dyForDx;
  const dyConsumed = dyMinusFee
    .toBignumber()
    .multipliedBy(HUNDRED_PERCENT_BPS)
    .dividedBy(oneMinusFeeBps(p.s.constants.feeBps))
    .integerValue(BigNumber.ROUND_CEIL);
  fee = dyConsumed.minus(dyMinusFee);
  const sums = p.s.lastCumulative;
  const tickCumulativeOutsideNew = sums.tick.sum.minus(nextTick.tickCumulativeOutside);
  const nextTickNew = {
    ...nextTick,
    tickCumulativeOutside: tickCumulativeOutsideNew
  };
  const ticksNew: Record<string, SwapRequiredTickState> = {
    ...p.s.ticks,
    [nextTickIndex.toFixed()]: nextTickNew
  };
  const storageNew = {
    ...p.s,
    sqrtPrice: new quipuswapV3Types.x80n(sqrtPriceNew),
    curTickWitness: nextTickIndex,
    curTickIndex: nextTickIndex,
    ticks: ticksNew,
    liquidity: new Nat(p.s.liquidity.plus(nextTick.liquidityNet))
  };
  const paramNew = {
    s: storageNew,
    dy: p.dy.minus(dyConsumed),
    dx: p.dx.plus(dx)
  };

  return yToXRec(paramNew);
}

export function calculateYToX(s: SwapRequiredStorage, dy: Nat) {
  const r = yToXRec({ s, dy, dx: new Nat(0) });

  return {
    output: r.dx,
    inputLeft: r.dy,
    newStoragePart: r.s
  };
}
