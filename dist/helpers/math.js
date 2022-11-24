"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shiftRight = exports.shiftLeft = exports.sqrtPriceForTick = exports.adjustScale = exports.tickAccumulatorsInside = void 0;
const bignumber_js_1 = require("bignumber.js");
const types_1 = require("./../types");
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
function tickAccumulatorsInside(cfmm, st, lowerTi, upperTi) {
    return __awaiter(this, void 0, void 0, function* () {
        const lowerTs = st.ticks.get(lowerTi);
        const upperTs = st.ticks.get(upperTi);
        const currentTime = new bignumber_js_1.BigNumber(Math.floor(Date.now() / 1000)).plus(1);
        const { tick_cumulative: cvTickCumulative, seconds_per_liquidity_cumulative: cvSecondsPerLiquidityCumulative, } = (yield cfmm.observe([currentTime.toString()]))[0];
        const tickAccumulatorAbove = (tickIndex, globalAcc, tickAccOutside) => {
            if (st.curTickIndex.gte(tickIndex)) {
                return globalAcc.minus(tickAccOutside);
            }
            else {
                return tickAccOutside;
            }
        };
        const tickAccumulatorBelow = (tickIndex, globalAcc, tickAccOutside) => {
            if (st.curTickIndex.gte(tickIndex)) {
                return tickAccOutside;
            }
            else {
                return globalAcc.minus(tickAccOutside);
            }
        };
        const tickAccumulatorInside = (globalAcc, lowerTickAccOutside, upperTickAccOutside) => {
            console.log(globalAcc, lowerTickAccOutside, upperTickAccOutside);
            return globalAcc
                .minus(tickAccumulatorBelow(lowerTi, globalAcc, lowerTickAccOutside))
                .minus(tickAccumulatorAbove(upperTi, globalAcc, upperTickAccOutside));
        };
        return {
            aSeconds: tickAccumulatorInside(currentTime, lowerTs.secondsOutside.toBignumber(), upperTs.secondsOutside.toBignumber()),
            aTickCumulative: tickAccumulatorInside(cvTickCumulative, lowerTs.tickCumulativeOutside, upperTs.tickCumulativeOutside),
            aFeeGrowth: tickAccumulatorInside(st.feeGrowth.x.plus(st.feeGrowth.y).toBignumber(), lowerTs.feeGrowthOutside.x.plus(lowerTs.feeGrowthOutside.y).toBignumber(), upperTs.feeGrowthOutside.x.plus(upperTs.feeGrowthOutside.y).toBignumber()),
            aSecondsPerLiquidity: tickAccumulatorInside(cvSecondsPerLiquidityCumulative, lowerTs.secondsPerLiquidityOutside.toBignumber(), upperTs.secondsPerLiquidityOutside.toBignumber()),
        };
    });
}
exports.tickAccumulatorsInside = tickAccumulatorsInside;
function adjustScale(i, n1 = new types_1.Nat(0), n2 = new types_1.Nat(0)) {
    const scaleAdjustment = n2.toBignumber().minus(n1);
    const iNormal = i.toBignumber();
    if (scaleAdjustment.gte(0)) {
        return new types_1.Nat(iNormal.multipliedBy(new bignumber_js_1.BigNumber(2).pow(scaleAdjustment)));
    }
    else {
        return new types_1.Nat(iNormal
            .dividedBy(new bignumber_js_1.BigNumber(2).pow(scaleAdjustment.negated()))
            .integerValue(bignumber_js_1.BigNumber.ROUND_FLOOR));
    }
}
exports.adjustScale = adjustScale;
/**
 * @category Math
 * @param i Int index of the tick
 *
 * Calculate the expected @sqrt_price@ for a given tick index.
 * We're doing floating point math in Haskell, so we lose a lot of precision.
 * To be able to compare a value calculated in Haskell to one calculated in Michelson,
 * we need to account for that loss of precision, so we reduce the scale
 */
function sqrtPriceForTick(i) {
    const x = new bignumber_js_1.BigNumber(Math.sqrt(Math.exp(0.0001)))
        .pow(i)
        .multipliedBy(new bignumber_js_1.BigNumber(2).pow(80))
        .integerValue(bignumber_js_1.BigNumber.ROUND_FLOOR);
    return adjustScale(new types_1.Nat(x), new types_1.Nat(80), new types_1.Nat(30));
}
exports.sqrtPriceForTick = sqrtPriceForTick;
function shiftLeft(x, y) {
    return x.multipliedBy(new bignumber_js_1.BigNumber(2).pow(y));
}
exports.shiftLeft = shiftLeft;
/**
 * A bitwise shift right operation
 */
function shiftRight(x, y) {
    return x.dividedBy(new bignumber_js_1.BigNumber(2).pow(y));
}
exports.shiftRight = shiftRight;
/**
 * -- | When adding @liquidity_delta@ to a position, calculate how many tokens will need to be deposited/withdrawn.
-- Due to the floating-point math used in `sqrtPriceFor`, this function has a certain margin of error.
liquidityDeltaToTokensDelta :: Integer -> TickIndex -> TickIndex -> TickIndex -> X 80 Natural -> PerToken Integer
liquidityDeltaToTokensDelta liquidityDelta lowerTickIndex upperTickIndex currentTickIndex sqrtPrice' =
  let
      sqrtPrice     = fromIntegral @Natural @Integer $ pickX sqrtPrice'
      sqrtPriceLower = fromIntegral @Natural @Integer $ pickX $ adjustScale @80 $ sqrtPriceFor lowerTickIndex
      sqrtPriceUpper = fromIntegral @Natural @Integer $ pickX $ adjustScale @80 $ sqrtPriceFor upperTickIndex

      -- Equation 6.29
      deltaY
        | currentTickIndex < lowerTickIndex = 0
        | lowerTickIndex <= currentTickIndex && currentTickIndex < upperTickIndex =
            {-
              ΔL * (√P - √pil)

              Since sqrtPrice = √P * 2^80, we can subtitute √P with sqrtPrice / 2^80:
                liquidityDelta * (sqrtPrice / 2^80 - sqrtPriceLower / 2^80)
              Using the distributive property of division:
                liquidityDelta * (sqrtPrice - sqrtPriceLower) / 2^80
            -}
            liquidityDelta * (sqrtPrice - sqrtPriceLower) `divUp` _280
        | otherwise =
            liquidityDelta * (sqrtPriceUpper - sqrtPriceLower) `divUp` _280

      -- Equation 6.30
      deltaX
        | currentTickIndex < lowerTickIndex =
            (liquidityDelta * _280 * (-sqrtPriceLower + sqrtPriceUpper)) `divUp` (sqrtPriceLower * sqrtPriceUpper)
        | lowerTickIndex <= currentTickIndex && currentTickIndex < upperTickIndex =
            {-
              ΔL * (1/√P - 1/√piu)

              Since sqrtPrice = √P * 2^80, we can subtitute √P with sqrtPrice / 2^80:
                liquidityDelta * (1 / (sqrtPrice / 2^80) - 1 / (sqrtPriceUpper / 2^80))
              Simplifying the fractions:
                liquidityDelta * (2^80 / sqrtPrice) - (2^80 / sqrtPriceUpper)
              The least common denominator is `sqrtPrice * sqrtPriceUpper)`,
              so we multiply the first fraction by sqrtPriceUpper and the second by sqrtPrice:
                liquidityDelta * ((2^80 * sqrtPriceUpper) / (sqrtPrice * sqrtPriceUpper)) - ((2^80 * sqrtPrice) / (sqrtPriceUpper * sqrtPrice))
              Subtracting the two fractions:
                liquidityDelta * (2^80 * sqrtPriceUpper - 2^80 * sqrtPrice) / (sqrtPrice * sqrtPriceUpper)
              Using the distributive property of multiplication:
                liquidityDelta * 2^80 * (sqrtPriceUpper - sqrtPrice) / (sqrtPrice * sqrtPriceUpper)
            -}
            (liquidityDelta * _280 * (sqrtPriceUpper - sqrtPrice)) `divUp` (sqrtPrice * sqrtPriceUpper)
        | otherwise = 0
  in  PerToken deltaX deltaY
*/
// export function liquidityDeltaToTokensDelta(
//   liquidityDelta: Int,
//   lowerTickIndex: Int,
//   upperTickIndex: Int,
//   currentTickIndex: Int,
//   sqrtPrice: Nat,
// ) {
//   const sqrtPriceLower = sqrtPriceForTick(lowerTickIndex);
//   const sqrtPriceUpper = sqrtPriceForTick(upperTickIndex);
//   const deltaY = currentTickIndex.lt(lowerTickIndex)
//     ? new Int(0)
//     : lowerTickIndex.lte(currentTickIndex) &&
//       currentTickIndex.lt(upperTickIndex)
//     ? liquidityDelta
//         .toBignumber()
//         .multipliedBy(
//           sqrtPrice.toBignumber().minus(sqrtPriceLower.toBignumber()),
//         )
//         .dividedBy(_280)
//         .integerValue(BigNumber.ROUND_CEIL)
//     : liquidityDelta
//         .toBignumber()
//         .multipliedBy(
//           sqrtPriceUpper.toBignumber().minus(sqrtPriceLower.toBignumber()),
//         )
//         .dividedBy(_280)
//         .integerValue(BigNumber.ROUND_CEIL);
//   const deltaX = currentTickIndex.lt(lowerTickIndex)
//     ? liquidityDelta
//         .toBignumber()
//         .multipliedBy(_280)
//         .multipliedBy(
//           sqrtPriceUpper.toBignumber().minus(sqrtPriceLower.toBignumber()),
//         )
//         .dividedBy(
//           sqrtPriceLower
//             .toBignumber()
//             .multipliedBy(sqrtPriceUpper.toBignumber()),
//         )
//         .integerValue(BigNumber.ROUND_CEIL)
//     : lowerTickIndex.lte(currentTickIndex) &&
//       currentTickIndex.lt(upperTickIndex)
//     ? liquidityDelta
//         .toBignumber()
//         .multipliedBy(_280)
//         .multipliedBy(
//           sqrtPriceUpper.toBignumber().minus(sqrtPrice.toBignumber()),
//         )
//         .dividedBy(
//           sqrtPrice.toBignumber().multipliedBy(sqrtPriceUpper.toBignumber()),
//         )
//         .integerValue(BigNumber.ROUND_CEIL)
//     : new Int(0);
//   return new PerToken(deltaX, deltaY);
// }
