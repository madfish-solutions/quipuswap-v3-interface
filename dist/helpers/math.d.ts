import { BigNumber } from "bignumber.js";
import { QuipuswapV3 } from "./../index";
import { Int, Nat, quipuswapV3Types } from "./../types";
export declare const defaultLadder: {
    "0,true": {
        v: BigNumber;
        offset: BigNumber;
    };
    "1,true": {
        v: BigNumber;
        offset: BigNumber;
    };
    "2,true": {
        v: BigNumber;
        offset: BigNumber;
    };
    "3,true": {
        v: BigNumber;
        offset: BigNumber;
    };
    "4,true": {
        v: BigNumber;
        offset: BigNumber;
    };
    "5,true": {
        v: BigNumber;
        offset: BigNumber;
    };
    "6,true": {
        v: BigNumber;
        offset: BigNumber;
    };
    "7,true": {
        v: BigNumber;
        offset: BigNumber;
    };
    "8,true": {
        v: BigNumber;
        offset: BigNumber;
    };
    "9,true": {
        v: BigNumber;
        offset: BigNumber;
    };
    "10,true": {
        v: BigNumber;
        offset: BigNumber;
    };
    "11,true": {
        v: BigNumber;
        offset: BigNumber;
    };
    "12,true": {
        v: BigNumber;
        offset: BigNumber;
    };
    "13,true": {
        v: BigNumber;
        offset: BigNumber;
    };
    "14,true": {
        v: BigNumber;
        offset: BigNumber;
    };
    "15,true": {
        v: BigNumber;
        offset: BigNumber;
    };
    "16,true": {
        v: BigNumber;
        offset: BigNumber;
    };
    "17,true": {
        v: BigNumber;
        offset: BigNumber;
    };
    "18,true": {
        v: BigNumber;
        offset: BigNumber;
    };
    "19,true": {
        v: BigNumber;
        offset: BigNumber;
    };
    "0,false": {
        v: BigNumber;
        offset: BigNumber;
    };
    "1,false": {
        v: BigNumber;
        offset: BigNumber;
    };
    "2,false": {
        v: BigNumber;
        offset: BigNumber;
    };
    "3,false": {
        v: BigNumber;
        offset: BigNumber;
    };
    "4,false": {
        v: BigNumber;
        offset: BigNumber;
    };
    "5,false": {
        v: BigNumber;
        offset: BigNumber;
    };
    "6,false": {
        v: BigNumber;
        offset: BigNumber;
    };
    "7,false": {
        v: BigNumber;
        offset: BigNumber;
    };
    "8,false": {
        v: BigNumber;
        offset: BigNumber;
    };
    "9,false": {
        v: BigNumber;
        offset: BigNumber;
    };
    "10,false": {
        v: BigNumber;
        offset: BigNumber;
    };
    "11,false": {
        v: BigNumber;
        offset: BigNumber;
    };
    "12,false": {
        v: BigNumber;
        offset: BigNumber;
    };
    "13,false": {
        v: BigNumber;
        offset: BigNumber;
    };
    "14,false": {
        v: BigNumber;
        offset: BigNumber;
    };
    "15,false": {
        v: BigNumber;
        offset: BigNumber;
    };
    "16,false": {
        v: BigNumber;
        offset: BigNumber;
    };
    "17,false": {
        v: BigNumber;
        offset: BigNumber;
    };
    "18,false": {
        v: BigNumber;
        offset: BigNumber;
    };
    "19,false": {
        v: BigNumber;
        offset: BigNumber;
    };
};
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
export declare function tickAccumulatorsInside(cfmm: QuipuswapV3, st: quipuswapV3Types.Storage, lowerTi: Int, upperTi: Int): Promise<{
    aSeconds: BigNumber;
    aTickCumulative: BigNumber;
    aFeeGrowth: BigNumber;
    aSecondsPerLiquidity: BigNumber;
}>;
export declare function adjustScale(i: Nat | Int, n1?: Nat, n2?: Nat): Nat;
/**
 * let fixed_point_mul (a : fixed_point) (b : fixed_point) : fixed_point =
    { v = a.v * b.v ; offset = a.offset + b.offset }
 */
export declare function fixedPointMul(a: quipuswapV3Types.FixedPoint, b: quipuswapV3Types.FixedPoint): quipuswapV3Types.FixedPoint;
export declare function halfBpsPowRec(tick: Nat, acc: quipuswapV3Types.FixedPoint, ladderKey: quipuswapV3Types.LadderKey, ladder: any): any;
/**
 * `shiftRight(x, y)` is only defined for `y <= 256n`.
 *  This function handles larger values of `y`.
 */
export declare function steppedShiftRight(x: BigNumber, y: BigNumber): BigNumber;
/**
 * `shiftLeft(x, y)` is only defined for `y <= 256n`.
 *  This function handles larger values of `y`.
 */
export declare function steppedShiftLeft(x: BigNumber, y: BigNumber): BigNumber;
/**
 *  For a tick index `i`, calculate the corresponding `sqrt_price`:
 *  sqrt(e^bps)^i * 2^80
 *  using the exponentiation by squaring method, where:
 *  bps = 0.0001
 */
export declare function sqrtPriceForTick(tick: Int): Nat;
export declare function shiftLeft(x: BigNumber, y: BigNumber): BigNumber;
/**
 * A bitwise shift right operation
 */
export declare function shiftRight(x: BigNumber, y: BigNumber): BigNumber;
/**
 * When adding @liquidity_delta@ to a position, calculate how many tokens will need to be deposited/withdrawn.
 * Due to the floating-point math used in `sqrtPriceFor`, this function has a certain margin of error.
 * @param liquidityDelta The amount of liquidity to add to the position
 */
export declare function liquidityDeltaToTokensDelta(liquidityDelta: Int, lowerTickIndex: Int, upperTickIndex: Int, currentTickIndex: Int, sqrtPrice: Nat): {
    x: Int;
    y: Int;
};
