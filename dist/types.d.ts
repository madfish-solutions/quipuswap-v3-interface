import { Contract, TezosToolkit, WalletOperationBatch, OperationBatch, TransferParams } from "@taquito/taquito";
import { BigNumber } from "bignumber.js";
import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { Address, Timestamp } from "./utils";
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
export declare class Nat extends BigNumber {
    constructor(number: BigNumber | number | string);
    static max(...n: BigNumber.Value[]): Nat;
    static getNat(n: BigNumber): Nat;
    plus(x: BigNumber.Value): Nat;
    minus(x: BigNumber.Value | Nat): Nat;
    multipliedBy(n: BigNumber.Value): Nat;
    dividedBy(n: BigNumber.Value): Nat;
    pow(n: BigNumber.Value): Nat;
    toBignumber(): BigNumber;
}
/**
 * @description Type class to represent a Tezos Int type which is a BigNumber
 * @example
 * const int = new Int('new BigNumber(-100)')
 * int.toString() // '-100'
 * int.toFixed() // '-100'
 */
export declare class Int extends BigNumber {
    constructor(number: BigNumber | number | string);
    static max(...n: BigNumber.Value[]): Int;
    plus(x: BigNumber.Value): Int;
    minus(x: BigNumber.Value | Int): Int;
    multipliedBy(n: BigNumber.Value, base?: number): Int;
    dividedBy(n: BigNumber.Value, base?: number): Int;
    pow(n: BigNumber.Value, m?: BigNumber.Value): Int;
    toBignumber(): BigNumber;
}
export declare enum CallMode {
    returnParams = 0,
    returnOperation = 1,
    returnConfirmatedOperation = 2
}
export declare type CallSettings = {
    swapXY: CallMode;
    swapYX: CallMode;
    setPosition: CallMode;
    updatePosition: CallMode;
    transfer: CallMode;
    updateOperators: CallMode;
    increaseObservationCount: CallMode;
};
export declare type ReturnMethodType = {
    callParams: any[];
    callback: (contract: Contract, ...params: any[]) => TransferParams;
};
export declare type QsReturn = TransferParams | WalletOperationBatch;
export declare namespace tezosTypes {
    type TezosContract = ReturnType<TezosToolkit["contract"]["at"]>;
    type Batch = OperationBatch | WalletOperationBatch;
}
export declare namespace fa2Types {
    type TransferDestination = {
        to_: string;
        token_id: BigNumber;
        amount: BigNumber;
    };
    type Transfer = {
        from_: string;
        txs: TransferDestination[];
    };
    type Operator = {
        owner: string;
        operator: string;
        token_id: BigNumber;
    };
    type UpdateOperators = {
        add_operator: Operator;
    } | {
        remove_operator: Operator;
    };
    type FA2Storage = {
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
export declare namespace fa12Types {
    type UserFA12Info = {
        balance: BigNumber;
        allowances: MichelsonMap<MichelsonMapKey, unknown>;
    };
    type FA12Storage = {
        total_supply: BigNumber;
        ledger: MichelsonMap<MichelsonMapKey, unknown>;
        metadata: MichelsonMap<MichelsonMapKey, unknown>;
        token_metadata: MichelsonMap<MichelsonMapKey, unknown>;
    };
}
export declare namespace quipuswapV3Types {
    type Fa2Token = {
        fa2: {
            token_id: BigNumber;
            token_address: Address;
        };
    };
    type Fa12Token = {
        fa12: Address;
    };
    type TokenType = Fa2Token | Fa12Token;
    /**
     * Keeps a positive value with -2^80 precision.
     */
    class x80n extends Nat {
        constructor(number: BigNumber | number | string);
        static init(number: BigNumber | number | string): x80n;
        toNormal(): BigNumber;
    }
    /**
     *  Keeps a value with -2^128 precision.
     *
     */
    class x128 extends Int {
        constructor(number: BigNumber | number | string);
        static init(number: BigNumber | number | string): x128;
        toNormal(): BigNumber;
    }
    /**
     * Keeps a positive value with -2^128 precision.
     */
    class x128n extends Nat {
        constructor(number: BigNumber | number | string);
        static init(number: BigNumber | number | string): x128n;
        toNormal(): BigNumber;
    }
    type TickIndex = Int;
    type BalanceNat = {
        x: Nat;
        y: Nat;
    };
    type BalanceNatX128 = {
        x: x128n;
        y: x128n;
    };
    type BalanceIntX128 = {
        x: x128;
        y: x128;
    };
    type TickState = {
        prev: TickIndex;
        next: TickIndex;
        liquidityNet: Int;
        nPositions: Nat;
        secondsOutside: Nat;
        tickCumulativeOutside: Int;
        feeGrowthOutside: BalanceNatX128;
        secondsPerLiquidityOutside: x128n;
        sqrtPrice: x80n;
    };
    type PositionState = {
        lowerTickIndex: TickIndex;
        upperTickIndex: TickIndex;
        owner: Address;
        liquidity: Nat;
        feeGrowthInsideLast: BalanceIntX128;
    };
    type TickCumulative = {
        /** The time-weighted cumulative value. */
        sum: Int;
        /** Tick index value at the beginning of the block. */
        blockStartValue: TickIndex;
    };
    type SplCumulative = {
        /** The time-weighted cumulative value */
        sum: x128n;
        /** Liquidity value at the beginning of the block */
        blockStartLiquidityValue: Nat;
    };
    type TimedCumulative = {
        time: string;
        tick: TickCumulative;
        spl: SplCumulative;
    };
    type TimedCumulativesBuffer = {
        /**
         *  For each index this stores:
            1. Cumulative values for every second in the history of the contract
              till specific moment of time, as well as last known value for
              the sake of future linear extrapolation.
            2. Timestamp when this sum was registered.
              This allows for bin search by timestamp.
    
            Indices in the map are assigned to values sequentially starting from 0.
    
            Invariants:
            a. The set of indices that have an associated element with them is continuous;
            b. Timestamps in values grow strictly monotonically
              (as well as accumulators ofc);
         */
        map: CumulativeBufferMap;
        first: Nat;
        last: Nat;
        reservedLength: Nat;
    };
    type Constants = {
        feeBps: Nat;
        tokenX: TokenType;
        tokenY: TokenType;
        tickSpacing: Nat;
    };
    type Fixed_point = {
        v: Nat;
        offset: Int;
    };
    type Ladder_key = {
        exp: Nat;
        positive: Boolean;
    };
    type Ladder = MichelsonMap<MichelsonMapKey, unknown>;
    type SetPosition = {
        lowerTickIndex: TickIndex;
        upperTickIndex: TickIndex;
        lowerTickWitness: TickIndex;
        upperTickWitness: TickIndex;
        liquidity: Nat;
        deadline: Timestamp;
        maximumTokensContributed: BalanceNat;
    };
    class CumulativeBufferMap {
        michelsonMap: MichelsonMap<MichelsonMapKey, unknown>;
        map: {
            [key: number]: TimedCumulative;
        };
        constructor(michelsonMap: MichelsonMap<MichelsonMapKey, unknown>, map: CumulativeBufferMap["map"]);
        static init(michelsonMap: any, indices?: Nat[]): Promise<CumulativeBufferMap>;
        static initCustom(extraReservedSlots: number): CumulativeBufferMap;
        get(key: Nat): TimedCumulative;
        getActual(key: Nat): Promise<TimedCumulative>;
        updateMap(mapIndices?: Nat[]): Promise<void>;
    }
    class TickMap {
        michelsonMap: MichelsonMap<MichelsonMapKey, unknown>;
        map: {
            [key: number]: TickState;
        };
        constructor(michelsonMap: MichelsonMap<MichelsonMapKey, unknown>, map: TickMap["map"]);
        static init(michelsonMap: any, tickIndices?: Int[]): Promise<TickMap>;
        get(key: Int): TickState;
        getActual(key: TickIndex): Promise<TickState>;
        updateMap(tickIndices?: Int[]): Promise<void>;
    }
    /**
     * @description QuipuswapV3 PositionMap
     * @field map [key: number]: PositionState
     * @field michelsonMap MichelsonMap
     */
    class PositionMap {
        michelsonMap: MichelsonMap<MichelsonMapKey, unknown>;
        map: {
            [key: number]: PositionState;
        };
        constructor(michelsonMap: MichelsonMap<MichelsonMapKey, unknown>, map: PositionMap["map"]);
        static init(michelsonMap: any, positionIds: Nat[]): Promise<PositionMap>;
        get(key: Nat): PositionState;
        updateMap(positionIds?: Nat[]): Promise<void>;
    }
    class LadderMap {
        map: MichelsonMap<MichelsonMapKey, unknown>;
        constructor(map: MichelsonMap<MichelsonMapKey, unknown>);
        get(key: Ladder_key): Promise<Fixed_point>;
    }
    type Storage = {
        liquidity: Nat;
        sqrtPrice: x80n;
        curTickIndex: TickIndex;
        curTickWitness: TickIndex;
        feeGrowth: BalanceNatX128;
        ticks: TickMap;
        positions: PositionMap;
        cumulativesBuffer: TimedCumulativesBuffer;
        metadata: MichelsonMap<MichelsonMapKey, unknown>;
        newPositionId: BigNumber;
        operators: MichelsonMap<MichelsonMapKey, unknown>;
        constants: Constants;
        ladder: LadderMap;
    };
    type CumulativesValue = {
        tick_cumulative: Int;
        seconds_per_liquidity_cumulative: x128n;
    };
}
export declare namespace quipuswapV3CallTypes {
    type UpdatePosition = {
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
