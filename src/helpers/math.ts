import { BigNumber } from "bignumber.js";
import JSBI from "jsbi";

import { QuipuswapV3 } from "./../index";

import { Int, Nat, quipuswapV3Types } from "./../types";

export const defaultLadder = {
  "0,true": {
    v: new BigNumber("38687560557337355742483221"),
    offset: new BigNumber(-85),
  },
  "1,true": {
    v: new BigNumber("38689494983725479307861971"),
    offset: new BigNumber(-85),
  },
  "2,true": {
    v: new BigNumber("38693364126677775184793561"),
    offset: new BigNumber(-85),
  },
  "3,true": {
    v: new BigNumber("38701103573421987005215721"),
    offset: new BigNumber(-85),
  },
  "4,true": {
    v: new BigNumber("38716587111352494729706462"),
    offset: new BigNumber(-85),
  },
  "5,true": {
    v: new BigNumber("38747572773653928660613512"),
    offset: new BigNumber(-85),
  },
  "6,true": {
    v: new BigNumber("38809618513447185627569983"),
    offset: new BigNumber(-85),
  },
  "7,true": {
    v: new BigNumber("38934008210058939100663682"),
    offset: new BigNumber(-85),
  },
  "8,true": {
    v: new BigNumber("39183984934869404935943141"),
    offset: new BigNumber(-85),
  },
  "9,true": {
    v: new BigNumber("39688763633815974521145659"),
    offset: new BigNumber(-85),
  },
  "10,true": {
    v: new BigNumber("40717912888646086984030507"),
    offset: new BigNumber(-85),
  },
  "11,true": {
    v: new BigNumber("42856962434838368098529959"),
    offset: new BigNumber(-85),
  },
  "12,true": {
    v: new BigNumber("47478079282778087338933597"),
    offset: new BigNumber(-85),
  },
  "13,true": {
    v: new BigNumber("29134438707490415855866100"),
    offset: new BigNumber(-84),
  },
  "14,true": {
    v: new BigNumber("43882733799120415566608322"),
    offset: new BigNumber(-84),
  },
  "15,true": {
    v: new BigNumber("49778031622173924435819796"),
    offset: new BigNumber(-83),
  },
  "16,true": {
    v: new BigNumber("32025492072892644517427309"),
    offset: new BigNumber(-80),
  },
  "17,true": {
    v: new BigNumber("53023938993515524338629870"),
    offset: new BigNumber(-76),
  },
  "18,true": {
    v: new BigNumber("36338278329035183585718600"),
    offset: new BigNumber(-66),
  },
  "19,true": {
    v: new BigNumber("34133361681864713959105863"),
    offset: new BigNumber(-47),
  },
  "0,false": {
    v: new BigNumber("19341845997356488514015570"),
    offset: new BigNumber(-84),
  },
  "1,false": {
    v: new BigNumber("2417609866154190654524678"),
    offset: new BigNumber(-81),
  },
  "2,false": {
    v: new BigNumber("38677889876083546261210550"),
    offset: new BigNumber(-85),
  },
  "3,false": {
    v: new BigNumber("38670155071614559132217310"),
    offset: new BigNumber(-85),
  },
  "4,false": {
    v: new BigNumber("19327345051392939314248854"),
    offset: new BigNumber(-84),
  },
  "5,false": {
    v: new BigNumber("19311889358453304431405214"),
    offset: new BigNumber(-84),
  },
  "6,false": {
    v: new BigNumber("77124060166079386301517011"),
    offset: new BigNumber(-86),
  },
  "7,false": {
    v: new BigNumber("38438828813936263312862610"),
    offset: new BigNumber(-85),
  },
  "8,false": {
    v: new BigNumber("76387211720013513967242610"),
    offset: new BigNumber(-86),
  },
  "9,false": {
    v: new BigNumber("75415686436335201065707301"),
    offset: new BigNumber(-86),
  },
  "10,false": {
    v: new BigNumber("73509547540888574991368714"),
    offset: new BigNumber(-86),
  },
  "11,false": {
    v: new BigNumber("17460146398643019245576278"),
    offset: new BigNumber(-84),
  },
  "12,false": {
    v: new BigNumber("126085780994910985395717054"),
    offset: new BigNumber(-87),
  },
  "13,false": {
    v: new BigNumber("102735988268212419722671870"),
    offset: new BigNumber(-87),
  },
  "14,false": {
    v: new BigNumber("68208042073114503830679361"),
    offset: new BigNumber(-87),
  },
  "15,false": {
    v: new BigNumber("60130046442422405275353178"),
    offset: new BigNumber(-88),
  },
  "16,false": {
    v: new BigNumber("11682706336100247487260846"),
    offset: new BigNumber(-88),
  },
  "17,false": {
    v: new BigNumber("56449132412055094618915006"),
    offset: new BigNumber(-95),
  },
  "18,false": {
    v: new BigNumber("20592303012757789234393034"),
    offset: new BigNumber(-103),
  },
  "19,false": {
    v: new BigNumber("1370156647050591448120178"),
    offset: new BigNumber(-118),
  },
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
 * let fixed_point_mul (a : fixed_point) (b : fixed_point) : fixed_point =
    { v = a.v * b.v ; offset = a.offset + b.offset }
 */
export function fixedPointMul(
  a: quipuswapV3Types.FixedPoint,
  b: quipuswapV3Types.FixedPoint,
): quipuswapV3Types.FixedPoint {
  return {
    v: a.v.multipliedBy(b.v),
    offset: a.offset.plus(b.offset),
  };
}

export function halfBpsPowRec(
  tick: Nat,
  acc: quipuswapV3Types.FixedPoint,
  ladderKey: quipuswapV3Types.LadderKey,
  ladder: any,
) {
  if (tick.eq(0)) return acc;
  const half = tick.div(2).integerValue(BigNumber.ROUND_FLOOR);
  const rem = tick.mod(2);
  const fixedPoint = ladder[`${ladderKey.exp},${ladderKey.positive}`];
  const newAcc = rem.eq(0) ? acc : fixedPointMul(fixedPoint, acc);
  const newLadderKey = { ...ladderKey, exp: ladderKey.exp + 1 };
  return halfBpsPowRec(new Nat(half), newAcc, newLadderKey, ladder);
}

/**
 * `shiftRight(x, y)` is only defined for `y <= 256n`.
 *  This function handles larger values of `y`.
 */
export function steppedShiftRight(x: BigNumber, y: BigNumber): BigNumber {
  const maxShift = 256;
  if (y.lte(maxShift)) {
    return new BigNumber(shiftRight(x, y).integerValue(BigNumber.ROUND_FLOOR));
  } else {
    const newX = shiftRight(x, new BigNumber(maxShift)).integerValue(
      BigNumber.ROUND_FLOOR,
    );
    return steppedShiftRight(newX, y.minus(maxShift));
  }
}

/**
 * `shiftLeft(x, y)` is only defined for `y <= 256n`.
 *  This function handles larger values of `y`.
 */
export function steppedShiftLeft(x: BigNumber, y: BigNumber): BigNumber {
  const maxShift = 256;
  if (y.lte(maxShift)) {
    return new BigNumber(shiftLeft(x, y).integerValue(BigNumber.ROUND_FLOOR));
  } else {
    const newX = shiftLeft(x, new BigNumber(maxShift)).integerValue(
      BigNumber.ROUND_FLOOR,
    );
    return steppedShiftLeft(newX, y.minus(maxShift));
  }
}
/**
 *  For a tick index `i`, calculate the corresponding `sqrt_price`:
 *  sqrt(e^bps)^i * 2^80
 *  using the exponentiation by squaring method, where:
 *  bps = 0.0001
 */
export function sqrtPriceForTick(tick: Int): Nat {
  const absTick = new Nat(tick.abs());
  const product = halfBpsPowRec(
    absTick,
    { v: new Nat(1), offset: new Int(0) },
    { exp: 0, positive: tick.gt(0) },
    defaultLadder,
  );

  const doffset = new BigNumber(-80).minus(product.offset);
  if (doffset.gt(0)) {
    return new Nat(steppedShiftRight(product.v, new Nat(doffset.abs())));
  } else {
    return new Nat(steppedShiftLeft(product.v, new Nat(doffset.abs())));
  }
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
// function sqrtPriceForTick(tickIndex) {
//   const _32 = jsbi_1.default.exponentiate(
//     jsbi_1.default.BigInt(2),
//     jsbi_1.default.BigInt(32),
//   );
//   const ZERO = jsbi_1.default.BigInt(0);
//   const ONE = jsbi_1.default.BigInt(1);
//   // used in liquidity amount math
//   // const _80 = jsbi_1.default.exponentiate(jsbi_1.default.BigInt(2), jsbi_1.default.BigInt(80));
//   const MaxUint256 = jsbi_1.default.BigInt(
//     "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
//   );
//   const mulShift = (val, mulBy) => {
//     return jsbi_1.default.signedRightShift(
//       jsbi_1.default.multiply(val, jsbi_1.default.BigInt(mulBy)),
//       jsbi_1.default.BigInt(128),
//     );
//   };
//   const tick = tickIndex.toNumber();

//   const absTick = tick < 0 ? tick * -1 : tick;
//   let ratio =
//     (absTick & 0x1) != 0
//       ? jsbi_1.default.BigInt("0xfffcb933bd6fad37aa2d162d1a594001")
//       : jsbi_1.default.BigInt("0x100000000000000000000000000000000");
//   if ((absTick & 0x2) != 0)
//     ratio = mulShift(ratio, "0xfff97272373d413259a46990580e213a");
//   if ((absTick & 0x4) != 0)
//     ratio = mulShift(ratio, "0xfff2e50f5f656932ef12357cf3c7fdcc");
//   if ((absTick & 0x8) != 0)
//     ratio = mulShift(ratio, "0xffe5caca7e10e4e61c3624eaa0941cd0");
//   if ((absTick & 0x10) != 0)
//     ratio = mulShift(ratio, "0xffcb9843d60f6159c9db58835c926644");
//   if ((absTick & 0x20) != 0)
//     ratio = mulShift(ratio, "0xff973b41fa98c081472e6896dfb254c0");
//   if ((absTick & 0x40) != 0)
//     ratio = mulShift(ratio, "0xff2ea16466c96a3843ec78b326b52861");
//   if ((absTick & 0x80) != 0)
//     ratio = mulShift(ratio, "0xfe5dee046a99a2a811c461f1969c3053");
//   if ((absTick & 0x100) != 0)
//     ratio = mulShift(ratio, "0xfcbe86c7900a88aedcffc83b479aa3a4");
//   if ((absTick & 0x200) != 0)
//     ratio = mulShift(ratio, "0xf987a7253ac413176f2b074cf7815e54");
//   if ((absTick & 0x400) != 0)
//     ratio = mulShift(ratio, "0xf3392b0822b70005940c7a398e4b70f3");
//   if ((absTick & 0x800) != 0)
//     ratio = mulShift(ratio, "0xe7159475a2c29b7443b29c7fa6e889d9");
//   if ((absTick & 0x1000) != 0)
//     ratio = mulShift(ratio, "0xd097f3bdfd2022b8845ad8f792aa5825");
//   if ((absTick & 0x2000) != 0)
//     ratio = mulShift(ratio, "0xa9f746462d870fdf8a65dc1f90e061e5");
//   if ((absTick & 0x4000) != 0)
//     ratio = mulShift(ratio, "0x70d869a156d2a1b890bb3df62baf32f7");
//   if ((absTick & 0x8000) != 0)
//     ratio = mulShift(ratio, "0x31be135f97d08fd981231505542fcfa6");
//   if ((absTick & 0x10000) != 0)
//     ratio = mulShift(ratio, "0x9aa508b5b7a84e1c677de54f3e99bc9");
//   if ((absTick & 0x20000) != 0)
//     ratio = mulShift(ratio, "0x5d6af8dedb81196699c329225ee604");
//   if ((absTick & 0x40000) != 0)
//     ratio = mulShift(ratio, "0x2216e584f5fa1ea926041bedfe98");
//   if ((absTick & 0x80000) != 0)
//     ratio = mulShift(ratio, "0x48a170391f7dc42444e8fa2");
//   if (tick > 0) ratio = jsbi_1.default.divide(MaxUint256, ratio);
//   //back to Q96
//   const st = jsbi_1.default.greaterThan(
//     jsbi_1.default.remainder(ratio, _32),
//     ZERO,
//   )
//     ? jsbi_1.default.add(jsbi_1.default.divide(ratio, _32), ONE)
//     : jsbi_1.default.divide(ratio, _32);

//   console.log("ST d 96)", st.toString());

//   const x = jsbi_1.default.BigInt(66);
//   const xx = jsbi_1.default.exponentiate(jsbi_1.default.BigInt(2), x);
//   const res = jsbi_1.default.divide(st, xx);

//   return new types_1.Nat(res.toString());
// }
