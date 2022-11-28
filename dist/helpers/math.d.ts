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
export declare function tickAccumulatorsInside(cfmm: QuipuswapV3, st: quipuswapV3Types.Storage, lowerTi: Int, upperTi: Int): Promise<{
    aSeconds: BigNumber;
    aTickCumulative: BigNumber;
    aFeeGrowth: BigNumber;
    aSecondsPerLiquidity: BigNumber;
}>;
export declare function adjustScale(i: Nat | Int, n1?: Nat, n2?: Nat): Nat;
/**
 * @category Math
 * @param i Int index of the tick
 *
 * Calculate the expected @sqrt_price@ for a given tick index.
 * We're doing floating point math in Haskell, so we lose a lot of precision.
 * To be able to compare a value calculated in Haskell to one calculated in Michelson,
 * we need to account for that loss of precision, so we reduce the scale
 */
export declare function sqrtPriceForTick(i: Int): Nat;
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
