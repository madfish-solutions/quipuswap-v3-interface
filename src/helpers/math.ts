import { BigNumber } from "bignumber.js";

import { QuipuswapV3 } from "./../index";

import { Int, Nat, quipuswapV3Types } from "./../types";

/**
 *
 * @category Math
 *
 * @param cfmm
 * @param st
 * @param lowerTi
 * @param upperTi
 * @returns
 */
export async function tickAccumulatorsInside(
  cfmm: QuipuswapV3,
  st: quipuswapV3Types.Storage,
  lowerTi: Int,
  upperTi: Int,
) {
  const lowerTs = st.ticks.get(lowerTi);
  const upperTs = st.ticks.get(upperTi);

  const currentTime = new BigNumber(Math.floor(Date.now() / 1000)).plus(1);
  const {
    tick_cumulative: cvTickCumulative,
    seconds_per_liquidity_cumulative: cvSecondsPerLiquidityCumulative,
  } = (await cfmm.observe([currentTime.toString()]))[0];

  const tickAccumulatorAbove = (
    tickIndex: Int,
    globalAcc: BigNumber,
    tickAccOutside: BigNumber,
  ) => {
    if (st.curTickIndex.gte(tickIndex)) {
      return globalAcc.minus(tickAccOutside);
    } else {
      return tickAccOutside;
    }
  };

  const tickAccumulatorBelow = (
    tickIndex: Int,

    globalAcc: BigNumber,
    tickAccOutside: BigNumber,
  ) => {
    if (st.curTickIndex.gte(tickIndex)) {
      return tickAccOutside;
    } else {
      return globalAcc.minus(tickAccOutside);
    }
  };
  const tickAccumulatorInside = (
    globalAcc: BigNumber,
    lowerTickAccOutside: BigNumber,
    upperTickAccOutside: BigNumber,
  ) => {
    console.log(globalAcc, lowerTickAccOutside, upperTickAccOutside);
    return globalAcc
      .minus(tickAccumulatorBelow(lowerTi, globalAcc, lowerTickAccOutside))
      .minus(tickAccumulatorAbove(upperTi, globalAcc, upperTickAccOutside));
  };

  return {
    aSeconds: tickAccumulatorInside(
      currentTime,
      lowerTs.secondsOutside.toBignumber(),
      upperTs.secondsOutside.toBignumber(),
    ),
    aTickCumulative: tickAccumulatorInside(
      cvTickCumulative,
      lowerTs.tickCumulativeOutside,
      upperTs.tickCumulativeOutside,
    ),
    aFeeGrowth: tickAccumulatorInside(
      st.feeGrowth.x.plus(st.feeGrowth.y).toBignumber(),
      lowerTs.feeGrowthOutside.x.plus(lowerTs.feeGrowthOutside.y).toBignumber(),
      upperTs.feeGrowthOutside.x.plus(upperTs.feeGrowthOutside.y).toBignumber(),
    ),
    aSecondsPerLiquidity: tickAccumulatorInside(
      cvSecondsPerLiquidityCumulative,
      lowerTs.secondsPerLiquidityOutside.toBignumber(),
      upperTs.secondsPerLiquidityOutside.toBignumber(),
    ),
  };
}

export function adjustScale(
  i: Nat | Int,
  n1: Nat = new Nat(0),
  n2: Nat = new Nat(0),
): Nat {
  const scaleAdjustment = n2.toBignumber().minus(n1);
  const iNormal = i.toBignumber();
  if (scaleAdjustment.gte(0)) {
    return new Nat(iNormal.multipliedBy(new BigNumber(2).pow(scaleAdjustment)));
  } else {
    return new Nat(
      iNormal
        .dividedBy(new BigNumber(2).pow(scaleAdjustment.negated()))
        .integerValue(BigNumber.ROUND_FLOOR),
    );
  }
}

/**
 * @category Math
 * @param i Int index of the tick
 *
 * Calculate the expected @sqrt_price@ for a given tick index.
 * We're doing floating point math in Haskell, so we lose a lot of precision.
 * To be able to compare a value calculated in Haskell to one calculated in Michelson,
 * we need to account for that loss of precision, so we reduce the scale
 */
export function sqrtPriceForTick(i: Int): Nat {
  const x = new BigNumber(Math.sqrt(Math.exp(0.0001)))
    .pow(i)
    .multipliedBy(new BigNumber(2).pow(80))
    .integerValue(BigNumber.ROUND_FLOOR);
  return adjustScale(new Nat(x), new Nat(80), new Nat(30));
}

export function shiftLeft(x: BigNumber, y: BigNumber) {
  return x.multipliedBy(new BigNumber(2).pow(y));
}

/**
 * A bitwise shift right operation
 */
export function shiftRight(x: BigNumber, y: BigNumber) {
  return x.dividedBy(new BigNumber(2).pow(y));
}

/**
 * When adding @liquidity_delta@ to a position, calculate how many tokens will need to be deposited/withdrawn.
 * Due to the floating-point math used in `sqrtPriceFor`, this function has a certain margin of error.
 * @param liquidityDelta The amount of liquidity to add to the position
 */
export function liquidityDeltaToTokensDelta(
  liquidityDelta: Int,
  lowerTickIndex: Int,
  upperTickIndex: Int,
  currentTickIndex: Int,
  sqrtPrice: Nat,
) {
  const sqrtPriceLower = sqrtPriceForTick(lowerTickIndex);
  const sqrtPriceUpper = sqrtPriceForTick(upperTickIndex);
  const _280 = new BigNumber(2).pow(80);

  // Equation 6.29
  const deltaY = (() => {
    if (currentTickIndex.lt(lowerTickIndex)) {
      return new Int(0);
    } else if (
      lowerTickIndex.lte(currentTickIndex) &&
      currentTickIndex.lt(upperTickIndex)
    ) {
      /**
       * ΔL * (√P - √pil)

       * Since sqrtPrice = √P * 2^80, we can subtitute √P with sqrtPrice / 2^80:
       *   liquidityDelta * (sqrtPrice / 2^80 - sqrtPriceLower / 2^80)
       * Using the distributive property of division:
       *   liquidityDelta * (sqrtPrice - sqrtPriceLower) / 2^80
       */
      return new Int(
        liquidityDelta

          .toBignumber()
          .multipliedBy(
            sqrtPrice.toBignumber().minus(sqrtPriceLower.toBignumber()),
          )
          .dividedBy(_280)
          .integerValue(BigNumber.ROUND_CEIL),
      );
    } else {
      return new Int(
        liquidityDelta
          .toBignumber()
          .multipliedBy(
            sqrtPriceUpper.toBignumber().minus(sqrtPriceLower.toBignumber()),
          )
          .dividedBy(_280)
          .integerValue(BigNumber.ROUND_CEIL),
      );
    }
  })();

  const deltaX = (() => {
    if (currentTickIndex.lt(lowerTickIndex)) {
      return new Int(
        liquidityDelta
          .toBignumber()
          .multipliedBy(_280)
          .multipliedBy(
            sqrtPriceLower.toBignumber().minus(sqrtPriceUpper.toBignumber()),
          )
          .dividedBy(
            sqrtPriceLower
              .toBignumber()
              .multipliedBy(sqrtPriceUpper.toBignumber()),
          )
          .integerValue(BigNumber.ROUND_CEIL),
      );
    } else if (
      lowerTickIndex.lte(currentTickIndex) &&
      currentTickIndex.lt(upperTickIndex)
    ) {
      return new Int(
        liquidityDelta
          .toBignumber()
          .multipliedBy(_280)
          .multipliedBy(
            sqrtPriceUpper.toBignumber().minus(sqrtPrice.toBignumber()),
          )
          .dividedBy(
            sqrtPrice.toBignumber().multipliedBy(sqrtPriceUpper.toBignumber()),
          )
          .integerValue(BigNumber.ROUND_CEIL),
      );
    } else {
      return new Int(0);
    }
  })();
  return { x: deltaX, y: deltaY };
}
