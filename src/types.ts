import {
  Contract,
  TezosToolkit,
  WalletOperationBatch,
  OperationBatch,
  TransferParams,
} from "@taquito/taquito";
import { BigNumber } from "bignumber.js";
import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { Address, Timestamp } from "./utils";
import { shiftLeft, shiftRight } from "./helpers/math";

/**
 * @description Type class to represent a Tezos Nat type which is a BigNumber
 * @example
 * const nat = new Nat('100')
 * nat.toNumber() // 100
 * nat.toString() // '100'
 * nat.plus(1).toString() // '101'
 * nat.toPow(2).toString() // '10000'
 * nat.fromPow(2).toString() // '1'
 */
export class Nat extends BigNumber {
  // _nat: BigNumber;
  constructor(number: BigNumber | number | string) {
    number = new BigNumber(number);
    if (number < new BigNumber(0) || !number.isInteger() || number.isNaN()) {
      throw new Error(`Invalid nat: ${number.toString()}`);
    }
    super(number);
  }

  fromPow(
    precision: number,
    roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_DOWN,
  ): BigNumber {
    return this.dividedBy(new BigNumber(10).pow(precision)).integerValue(
      roundingMode,
    );
  }
  toPow(
    precision: number,
    roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_DOWN,
  ): BigNumber {
    return this.multipliedBy(new BigNumber(10).pow(precision)).integerValue(
      roundingMode,
    );
  }
}

/**
 * @description Type class to represent a Tezos Int type which is a BigNumber
 * @example
 * const int = new Int('new BigNumber(-100)')
 * int.toString() // '-100'
 * int.toFixed() // '-100'
 * int.fromPrecision(6) // BigNumber(-0.0001)
 * int.toPrecision(6) // BigNumber(-1000000)
 */

export class Int extends BigNumber {
  constructor(number: BigNumber | number | string) {
    number = new BigNumber(number);
    if (!number.isInteger() || number.isNaN()) {
      throw new Error(`Invalid int: ${number}`);
    }
    super(number);
  }

  fromPow(
    precision: number,
    roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_DOWN,
  ): BigNumber {
    return this.dividedBy(new BigNumber(10).pow(precision)).integerValue(
      roundingMode,
    );
  }
  toPow(
    precision: number,
    roundingMode: BigNumber.RoundingMode = BigNumber.ROUND_DOWN,
  ): BigNumber {
    return this.multipliedBy(new BigNumber(10).pow(precision)).integerValue(
      roundingMode,
    );
  }
}

export enum CallMode {
  returnParams = 0,
  returnOperation = 1,
  returnConfirmatedOperation = 2,
}
export type CallSettings = {
  swapXY: CallMode;
  swapYX: CallMode;
  setPosition: CallMode;
  updatePosition: CallMode;
  transfer: CallMode;
  updateOperators: CallMode;
  increaseObservationCount: CallMode;
};

export type ReturnMethodType = {
  callParams: any[];
  callback: (contract: Contract, ...params: any[]) => TransferParams;
};

export type QsReturn = TransferParams | WalletOperationBatch;

export namespace tezosTypes {
  export type TezosContract = ReturnType<TezosToolkit["contract"]["at"]>;

  export type Batch = OperationBatch | WalletOperationBatch;
}

export namespace fa2Types {
  export type TransferDestination = {
    to_: string;
    token_id: BigNumber;
    amount: BigNumber;
  };

  export type Transfer = {
    from_: string;
    txs: TransferDestination[];
  };

  export type Operator = {
    owner: string;
    operator: string;
    token_id: BigNumber;
  };

  export type UpdateOperators =
    | { add_operator: Operator }
    | { remove_operator: Operator };

  export type FA2Storage = {
    account_info: MichelsonMap<MichelsonMapKey, unknown>;
    token_info: MichelsonMap<MichelsonMapKey, unknown>;
    metadata: MichelsonMap<MichelsonMapKey, unknown>;
    token_metadata: MichelsonMap<MichelsonMapKey, unknown>;
    minters_info: MichelsonMap<MichelsonMapKey, unknown>;
    last_token_id: BigNumber;
    admin: string;
    permit_counter: BigNumber;
    permits: MichelsonMap<MichelsonMapKey, unknown>;
    default_expiry: BigNumber;
    total_minter_shares: BigNumber;
  };
}

export namespace fa12Types {
  export type UserFA12Info = {
    balance: BigNumber;
    allowances: MichelsonMap<MichelsonMapKey, unknown>;
  };

  export type FA12Storage = {
    total_supply: BigNumber;
    ledger: MichelsonMap<MichelsonMapKey, unknown>;
    metadata: MichelsonMap<MichelsonMapKey, unknown>;
    token_metadata: MichelsonMap<MichelsonMapKey, unknown>;
  };
}

export namespace quipuswapV3Types {
  export type Fa2Token = {
    fa2: { token_id: BigNumber; token_address: Address };
  };
  export type Fa12Token = { fa12: Address };

  export type TokenType = Fa2Token | Fa12Token;
  /**
   * Keeps a positive value with -2^80 precision.
   */
  export class x80n extends Nat {
    constructor(number: BigNumber | number | string) {
      super(number);
    }
    static init(number: BigNumber | number | string): x80n {
      number = new BigNumber(number);
      return new x80n(number.multipliedBy(new BigNumber(2).pow(80)));
    }
    toNormal(): BigNumber {
      return shiftRight(this, new BigNumber(80));
    }
  }

  /**
   *  Keeps a value with -2^128 precision.
   *
   */
  export class x128 extends Int {
    constructor(number: BigNumber | number | string) {
      super(number);
    }
    static init(number: BigNumber | number | string): x128 {
      number = new BigNumber(number);
      return new x128(number.multipliedBy(new BigNumber(2).pow(128)));
    }
    toNormal(): BigNumber {
      return shiftRight(this, new BigNumber(128));
    }
  }

  /**
   * Keeps a positive value with -2^128 precision.
   */
  export class x128n extends Nat {
    constructor(number: BigNumber | number | string) {
      super(number);
    }
    static init(number: BigNumber | number | string): x128n {
      number = new BigNumber(number);
      return new x128n(number.multipliedBy(new BigNumber(2).pow(128)));
    }
    toNormal(): BigNumber {
      return shiftRight(this, new BigNumber(128));
    }
  }

  // Tick types, representing pieces of the curve offered between different tick segments.
  export type TickIndex = Int;

  export type BalanceNat = { x: Nat; y: Nat };
  export type BalanceNatX128 = { x: x128n; y: x128n };
  export type BalanceIntX128 = { x: x128; y: x128 };

  export type TickState = {
    //  Index of the previous initialized tick.
    //     Here we diverge from the article, and effectively store a doubly-linked
    //     list of initialized ticks for speed-up
    //     (while the article proposes storing a bitmap for this purpose).
    //
    prev: TickIndex;

    //  Index of the next initialized tick.
    next: TickIndex;

    //  Total amount of liquidity to add to the contract's global liquidity when
    //     this tick is crossed going up.
    //     (i.e. when the current tick index `i_c` becomes greater than this tick),
    //     or subtracted when the tick is crossed going down.
    //
    liquidityNet: Int;

    //  Numbers of positions with an edge at the given tick.
    //     Used for garbage collection.
    //
    nPositions: Nat;

    //  When the current tick index `i_c` is below this tick, this field tracks
    //     the overall number of seconds `i_c` spent above or at this tick.
    //     When `i_c` is above or equal to this tick, it tracks the number of
    //     seconds `i_c` spent below this tick.

    //     This field is updated every time `i_c` crosses this tick.

    //     Here we assume that, during all the time since Unix epoch start till
    //     the moment of tick initialization, i_c was below this tick
    //     (see equation 6.25 of the uniswap v3 whitepaper).
    //     So we actually track the number of seconds with some additive error Δ,
    //     but this Δ remains contant during the lifetime of the tick. Ticks
    //     created at different moments of time will have different Δ though.

    //     As example, let's say the tick was initialized at 1628440000 timestamp;
    //     then `seconds_outside` can be initialized with the same timestamp.
    //     If i_c crossed this tick 5 seconds later, this `seconds_outside` will
    //     be set respectively to 5.
    //     If i_c crossed this tick back 3 seconds later, we will get
    //     `1628440000 + 3 = 1628440003`
    //     (effectively this will be computed as `cur_time - last seconds_outside =
    //     1628440008 - 5 = 1628440003`).

    //     This field helps to evaluate, for instance, how many seconds i_c
    //     has spent in an any given ticks range.
    //
    secondsOutside: Nat;

    //  Tick indices accumulator i_o, it keeps track of time-weighted sum of
    //     tick indices, but accounts them only for "outside" periods.
    //     For the intuition for "outside" word, see `seconds_outside`.
    //
    tickCumulativeOutside: Int;

    //  Overall number of fees f_o that were accumulated during the period
    //     when the current tick index i_c was below (or above) this tick.

    //     For intuition for "outside" word, see `seconds_outside`.
    //
    feeGrowthOutside: BalanceNatX128;

    //  Seconds-weighted 1/L value accumulator s_lo, it accounts only for
    //     "outside" periods. For intuition for "outside" word, see `seconds_outside`.

    //     This helps us to implement liquidity oracle.
    //
    secondsPerLiquidityOutside: x128n;

    // sqrt(P) = sqrt(X/Y) associated with this tick.
    sqrtPrice: x80n;
  };

  export type PositionState = {
    // Position edge tick indices
    lowerTickIndex: TickIndex;
    upperTickIndex: TickIndex;

    // The position's owner.
    // By default - position's creator, but ownership can be transferred later.
    owner: Address;

    // Position's liquidity.
    liquidity: Nat;

    // Total fees earned by the position at the moment of last fees collection for this position.
    // This helps to evaluate the next portion of fees to collect.
    feeGrowthInsideLast: BalanceIntX128;
  };

  export type TickCumulative = {
    // The time-weighted cumulative value.
    sum: Int;
    // Tick index value at the beginning of the block.
    block_start_value: TickIndex;
  };
  export type SplCumulative = {
    // The time-weighted cumulative value.
    sum: x128n;
    // Liquidity value at the beginning of the block.
    block_start_liquidity_value: Nat;
  };
  export type TimedCumulatives = {
    time: string;
    tick: TickCumulative;
    spl: SplCumulative;
  };

  export type TimedCumulativesBuffer = {
    // For each index this stores:
    // 1. Cumulative values for every second in the history of the contract
    //    till specific moment of time, as well as last known value for
    //    the sake of future linear extrapolation.
    // 2. Timestamp when this sum was registered.
    //    This allows for bin search by timestamp.
    //
    // Indices in the map are assigned to values sequentially starting from 0.
    //
    // Invariants:
    // a. The set of indices that have an associated element with them is continuous;
    // b. Timestamps in values grow strictly monotonically
    //    (as well as accumulators ofc);
    map: MichelsonMap<MichelsonMapKey, unknown>;

    // Index of the oldest stored value.
    first: Nat;

    // Index of the most recently stored value.
    last: Nat;

    // Number of actually allocated slots.
    //
    // This value is normally equal to `last - first + 1`.
    // However, in case recently there was a request to extend the set of
    // stored values, this var will keep the demanded number of stored values,
    // while values in the map past `last` will be initialized with garbage.
    //
    // We need to have initialized slots with trash because when the size of
    // the map increases, someone has to pay for the storage diff.
    // And we want it to be paid by the one who requested the extension.
    reservedLength: Nat;
  };

  export type Constants = {
    feeBps: Nat;
    tokenX: TokenType;
    tokenY: TokenType;
    tickSpacing: Nat;
  };

  //// See defaults.mligo for more info
  export type Fixed_point = { v: Nat; offset: Int };
  export type Ladder_key = { exp: Nat; positive: Boolean };
  export type Ladder = MichelsonMap<MichelsonMapKey, unknown>;

  export type SetPosition = {
    lowerTickIndex: TickIndex;
    upperTickIndex: TickIndex;
    lowerTickWitness: TickIndex;
    upperTickWitness: TickIndex;
    liquidity: Nat;
    deadline: Timestamp;
    maximumTokensContributed: BalanceNat;
  };

  export class TickMap {
    constructor(public map: MichelsonMap<MichelsonMapKey, unknown>) {}
    async get(key: TickIndex): Promise<TickState> {
      const st: any = await this.map.get(key.toString());
      return {
        prev: new Int(st.prev),
        next: new Int(st.next),
        liquidityNet: new Int(st.liquidity_net),
        secondsOutside: new Nat(st.seconds_outside),
        tickCumulativeOutside: new Int(st.tick_cumulative_outside),
        feeGrowthOutside: {
          x: new x128n(st.fee_growth_outside.x),
          y: new x128n(st.fee_growth_outside.y),
        },
        secondsPerLiquidityOutside: new x128n(st.seconds_per_liquidity_outside),
        sqrtPrice: new x80n(st.sqrt_price),
        nPositions: new Nat(st.n_positions),
      };
    }
  }
  export class PositionMap {
    constructor(public map: MichelsonMap<MichelsonMapKey, unknown>) {}
    async get(key: Nat): Promise<PositionState> {
      const st: any = await this.map.get(key.toString());
      return {
        lowerTickIndex: new Int(st.lower_tick_index),
        upperTickIndex: new Int(st.upper_tick_index),
        owner: new Address(st.owner),
        liquidity: new Nat(st.liquidity),
        feeGrowthInsideLast: {
          x: new x128n(st.fee_growth_inside_last.x),
          y: new x128n(st.fee_growth_inside_last.y),
        },
      };
    }
  }
  export class LadderMap {
    constructor(public map: MichelsonMap<MichelsonMapKey, unknown>) {}
    async get(key: Ladder_key): Promise<Fixed_point> {
      return (await this.map.get({
        exp: key.exp.toString(),
        positive: key.positive,
      })) as Fixed_point;
    }
  }

  export type Storage = {
    //// Virtual liquidity, the value L for which the curve locally looks like x * y = L^2.
    liquidity: Nat;

    // Square root of the virtual price, the value P for which P = x / y.
    sqrtPrice: x80n;

    // Index of the highest tick corresponding to a price less than or equal to sqrt_price^2,
    // does not necessarily corresponds to a boundary.
    // Article's notation: i_c, tick.
    curTickIndex: TickIndex;

    // The highest initialized tick lower than or equal to i_c.
    curTickWitness: TickIndex;

    // The total amount of fees that have been earned per unit of virtual liquidity (L),
    // over the entire history of the contract.
    feeGrowth: BalanceNatX128;

    // States of all initialized ticks.
    ticks: TickMap;

    // States of positions (with non-zero liquidity).
    positions: PositionMap;

    // Cumulative values stored for the recent timestamps.
    cumulativesBuffer: TimedCumulativesBuffer;
    // TZIP-16 metadata.
    metadata: MichelsonMap<MichelsonMapKey, unknown>;

    // Incremental position id to be assigned to new position.
    newPositionId: BigNumber;

    // FA2-related
    operators: MichelsonMap<MichelsonMapKey, unknown>;

    // Constants for options that are settable at origiBigNumberion
    constants: Constants;

    // Exponents ladder for the calculation of 'half_bps_pow'
    ladder: LadderMap;
  };

  export type CumulativesValue = {
    tick_cumulative: Int;
    seconds_per_liquidity_cumulative: x128n;
  };
}

export namespace quipuswapV3CallTypes {
  export type UpdatePosition = {
    /**
     * positionId - position id
     * @ligoType Nat
     */
    positionId: Nat;
    /**
     * How to change the liquidity of the existing position.
     * If adding a delta (that can be negative) would result in a negative liquidity value, the call will abort.
     * @ligoType int
     */
    liquidityDelta: Nat;
    /** Where to send the freed X tokens, if any. */
    toX: Address;
    /** Where to send the freed Y tokens, if any. */
    toY: Address;
    /** The transaction won't be executed past this point. */
    deadline: Timestamp;
    /** The maximum number of tokens to contribute.
        If a higher amount is required, the entrypoint fails.
    */
    maximumTokensContributed: quipuswapV3Types.BalanceNat;
  };
}
