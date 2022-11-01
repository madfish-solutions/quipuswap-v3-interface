import { Contract, TezosToolkit, WalletOperationBatch, OperationBatch, TransferParams } from "@taquito/taquito";
import { BigNumber } from "bignumber.js";
import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { Address, Nat, Int, Timestamp } from "./utils";
export declare type CallMode = "returnParams" | "returnOperation" | "returnConfirmatedOperation";
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
    type updateOperators = {
        add_operator: Operator;
    } | {
        remove_operator: Operator;
    };
}
export declare namespace quipuswapV3Types {
    type x80n = {
        x80: Nat;
    };
    type x128 = {
        x128: Int;
    };
    type x128n = {
        x128: Nat;
    };
    type TickIndex = {
        i: Int;
    };
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
        liquidity_net: Int;
        n_positions: Nat;
        seconds_outside: Nat;
        tick_cumulative_outside: Int;
        fee_growth_outside: BalanceNatX128;
        seconds_per_liquidity_outside: x128n;
        sqrt_price: x80n;
    };
    type PositionState = {
        lower_tick_index: TickIndex;
        upper_tick_index: TickIndex;
        owner: Address;
        liquidity: Nat;
        fee_growth_inside_last: BalanceIntX128;
    };
    type TickCumulative = {
        sum: Int;
        block_start_value: TickIndex;
    };
    type SplCumulative = {
        sum: x128n;
        block_start_liquidity_value: Nat;
    };
    type TimedCumulatives = {
        time: string;
        tick: TickCumulative;
        spl: SplCumulative;
    };
    type TimedCumulativesBuffer = {
        map: MichelsonMap<MichelsonMapKey, unknown>;
        first: Nat;
        last: Nat;
        reserved_length: Nat;
    };
    type Constants = {
        fee_bps: Nat;
        ctez_burn_fee_bps: Nat;
        x_token_id: Nat;
        y_token_id: Nat;
        x_token_address: Address;
        y_token_address: Address;
        tick_spacing: Nat;
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
        maximumTokensContributed: BalanceNat;
    };
    type Storage = {
        liquidity: Nat;
        sqrt_price: x80n;
        cur_tick_index: TickIndex;
        cur_tick_witness: TickIndex;
        fee_growth: BalanceNatX128;
        ticks: MichelsonMap<MichelsonMapKey, unknown>;
        positions: MichelsonMap<MichelsonMapKey, unknown>;
        cumulatives_buffer: TimedCumulativesBuffer;
        metadata: MichelsonMap<MichelsonMapKey, unknown>;
        new_position_id: BigNumber;
        operators: MichelsonMap<MichelsonMapKey, unknown>;
        constants: Constants;
        ladder: Ladder;
    };
    type TransferDestination = {
        to_: Address;
        token_id: Nat;
        amount: Nat;
    };
    type Transfer = {
        from_: Address;
        txs: TransferDestination[];
    };
    type Operator = {
        owner: Address;
        operator: Address;
        token_id: Nat;
    };
    type updateOperators = {
        add_operator: Operator;
    } | {
        remove_operator: Operator;
    };
}
