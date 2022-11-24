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
