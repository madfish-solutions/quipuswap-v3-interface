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
/**
 *  Calculate the new price after depositing @dx@ tokens **while swapping within a single tick**.

Equation 6.15
  Δ(1 / √P) = Δx / L
  1 / √P_new - 1 / √P_old = Δx / L

  Since sqrtPrice = √P * 2^80, we can subtitute √P with sqrtPrice / 2^80:
    1 / (sqrt_price_new / 2^80) - 1 / (sqrt_price_old / 2^80) = dx / liquidity
  Simplifying the fractions:
    2^80 / sqrt_price_new - 2^80 / sqrt_price_old = dx / liquidity
  Adding `2^80 / sqrt_price_old` to both sides:
    2^80 / sqrt_price_new = dx / liquidity + 2^80 / sqrt_price_old
  Multiplying both sides by sqrt_price_new:
    2^80 = (dx / liquidity + 2^80 / sqrt_price_old) * sqrt_price_new
  Dividing both sides by (dx / liquidity + 2^80 / sqrt_price_old):
    2^80 / (dx / liquidity + 2^80 / sqrt_price_old) = sqrt_price_new
 -}
 */
export declare function calcNewPriceX(sqrtPriceOld: Nat, liquidity: Nat, dx: Nat): Nat;
/**
Calculate the new `sqrt_price` after a deposit of `dy` `y` tokens.
    Derived from equation 6.13:
        Δ(√P) = Δy /L
        √P_new - √P_old = Δy /L
    Since we store √P mutiplied by 2^80 (i.e. sqrt_price = √P * 2^80):
        sqrt_price_new / 2^80 - sqrt_price_old / 2^80 = Δy /L
    Solving for sqrt_price_new:
        sqrt_price_new = 2^80 * (Δy / L) + sqrt_price_old

    Example:
        Assume a pool with 10 `x` tokens and 1000 `y` tokens, which implies:
            L = sqrt(xy) = sqrt(10*1000) = 100
            P = y/x = 1000/10 = 100
            sqrt_price = sqrt(100) * 2^80 = 12089258196146291747061760

        Adding 1000 `y` tokens to the pool should result in:
            y = 2000
            x = L^2 / y = 5
            P = 2000 / 5 = 400
            sqrt_price = sqrt(400) * 2^80 = 24178516392292583494123520

*/
export declare function calcNewPriceY(sqrtPriceOld: Nat, liquidity: Nat, dy: Nat): Nat;
/**
 * Equation 6.21
 *
 * Calculates the initial value of the accumulators tracked by a tick's state.
 * if the current tick is not yet over
 * @param {QuipuswapV3} cfmm - The contract instance
 * @param st - quipuswapV3Types.Storage
 * @param tickIndex - The tick index of the current tick.
 * @returns an object with the following properties:
 * - seconds: a Nat (natural number)
 * - tickCumulative: an Int (integer)
 * - feeGrowth: an object with two properties:
 *   - x: a quipuswapV3Types.x128n (128-bit number)
 *   - y: a quipuswapV
 */
export declare function initTickAccumulators(cfmm: QuipuswapV3, st: quipuswapV3Types.Storage, tickIndex: quipuswapV3Types.TickIndex): Promise<{
    seconds: Nat;
    tickCumulative: Int;
    feeGrowth: quipuswapV3Types.BalanceNatX128;
    secondsPerLiquidity: quipuswapV3Types.x128n;
}>;
/**
 * Calculate the swap fee paid when depositing @tokensDelta@ tokens.
 * transaction amount and dividing by 10,000
 * @param {BigNumber} feeBps - The fee in basis points.
 * @param {BigNumber} tokensDelta - The amount of tokens that will be transferred.
 * @returns The fee is being returned.
 */
export declare const calcSwapFee: (feeBps: BigNumber, tokensDelta: BigNumber) => BigNumber;
