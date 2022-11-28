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
exports.liquidityDeltaToTokensDelta = exports.shiftRight = exports.shiftLeft = exports.sqrtPriceForTick = exports.adjustScale = exports.tickAccumulatorsInside = void 0;
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
 * When adding @liquidity_delta@ to a position, calculate how many tokens will need to be deposited/withdrawn.
 * Due to the floating-point math used in `sqrtPriceFor`, this function has a certain margin of error.
 * @param liquidityDelta The amount of liquidity to add to the position
 */
function liquidityDeltaToTokensDelta(liquidityDelta, lowerTickIndex, upperTickIndex, currentTickIndex, sqrtPrice) {
    const sqrtPriceLower = sqrtPriceForTick(lowerTickIndex);
    const sqrtPriceUpper = sqrtPriceForTick(upperTickIndex);
    const _280 = new bignumber_js_1.BigNumber(2).pow(80);
    // Equation 6.29
    const deltaY = (() => {
        if (currentTickIndex.lt(lowerTickIndex)) {
            return new types_1.Int(0);
        }
        else if (lowerTickIndex.lte(currentTickIndex) &&
            currentTickIndex.lt(upperTickIndex)) {
            /**
             * ΔL * (√P - √pil)
      
             * Since sqrtPrice = √P * 2^80, we can subtitute √P with sqrtPrice / 2^80:
             *   liquidityDelta * (sqrtPrice / 2^80 - sqrtPriceLower / 2^80)
             * Using the distributive property of division:
             *   liquidityDelta * (sqrtPrice - sqrtPriceLower) / 2^80
             */
            return new types_1.Int(liquidityDelta
                .toBignumber()
                .multipliedBy(sqrtPrice.toBignumber().minus(sqrtPriceLower.toBignumber()))
                .dividedBy(_280)
                .integerValue(bignumber_js_1.BigNumber.ROUND_CEIL));
        }
        else {
            return new types_1.Int(liquidityDelta
                .toBignumber()
                .multipliedBy(sqrtPriceUpper.toBignumber().minus(sqrtPriceLower.toBignumber()))
                .dividedBy(_280)
                .integerValue(bignumber_js_1.BigNumber.ROUND_CEIL));
        }
    })();
    const deltaX = (() => {
        if (currentTickIndex.lt(lowerTickIndex)) {
            return new types_1.Int(liquidityDelta
                .toBignumber()
                .multipliedBy(_280)
                .multipliedBy(sqrtPriceLower.toBignumber().minus(sqrtPriceUpper.toBignumber()))
                .dividedBy(sqrtPriceLower
                .toBignumber()
                .multipliedBy(sqrtPriceUpper.toBignumber()))
                .integerValue(bignumber_js_1.BigNumber.ROUND_CEIL));
        }
        else if (lowerTickIndex.lte(currentTickIndex) &&
            currentTickIndex.lt(upperTickIndex)) {
            return new types_1.Int(liquidityDelta
                .toBignumber()
                .multipliedBy(_280)
                .multipliedBy(sqrtPriceUpper.toBignumber().minus(sqrtPrice.toBignumber()))
                .dividedBy(sqrtPrice.toBignumber().multipliedBy(sqrtPriceUpper.toBignumber()))
                .integerValue(bignumber_js_1.BigNumber.ROUND_CEIL));
        }
        else {
            return new types_1.Int(0);
        }
    })();
    return { x: deltaX, y: deltaY };
}
exports.liquidityDeltaToTokensDelta = liquidityDeltaToTokensDelta;
