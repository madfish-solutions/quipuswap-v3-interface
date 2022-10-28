import { TezosToolkit, TransactionOperation } from "@taquito/taquito";
import { BigNumber } from "bignumber.js";
import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { Address, Nat, Int } from "./utils";
export declare namespace fa2Types {
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
    type UpdateOperator = {
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
        lowerTickIndex: BigNumber;
        upperTickIndex: BigNumber;
        lowerTickWitness: BigNumber;
        upperTickWitness: BigNumber;
        liquidity: BigNumber;
        deadline: string;
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
        deadline: string;
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
}
export declare class QuipuswapV3Methods {
    static swapXY(tezos: TezosToolkit, contractAddress: Address, amount: Nat, deadline: string, minExpectedReceive: Nat, recipient: Address): Promise<TransactionOperation>;
    static swapYX(tezos: TezosToolkit, contractAddress: Address, amount: Nat, deadline: string, minExpectedReceive: Nat, recipient: Address): Promise<TransactionOperation>;
    static setPosition(tezos: TezosToolkit, contractAddress: string, params: quipuswapV3Types.SetPosition): Promise<TransactionOperation>;
    static updatePosition(tezos: TezosToolkit, contractAddress: string, params: quipuswapV3Types.UpdatePosition): Promise<TransactionOperation>;
    /**
     *
     * @param tezos TezosToolkit
     * @param contractAddress Contract address
     * @param params Fa2 transfer param
     * @returns
     */
    static transfer(tezos: TezosToolkit, contractAddress: string, params: fa2Types.Transfer[]): Promise<TransactionOperation>;
    static updateOperator(tezos: TezosToolkit, contractAddress: string, params: fa2Types.UpdateOperator[]): Promise<TransactionOperation>;
    static IncreaseObservationCount(tezos: TezosToolkit, contractAddress: string, amount: Nat): Promise<TransactionOperation>;
}
export declare class QuipuswapV3Storage {
    /**
     * @param tezos
     * @param contract
     * @returns
     */
    static getStorage(tezos: TezosToolkit, contract: string): Promise<any>;
}
export declare class QuipuswapV3 {
    private tezos;
    private contractAddress;
    constructor(tezos: TezosToolkit, contractAddress: string);
    getStorage(): Promise<any>;
    /**
     * Swap X tokens for Y tokens
     * @param amount Amount of tokens to swap
     * @param deadline The transaction won't be executed past this point
     * @param minExpectedReceive Minimum amount of tokens to receive. The transaction won't be executed if buying less than the given amount of Y tokens.
     * @param recipient Recipient of the tokens
     * @returns TransactionOperation
     */
    swapXY(amount: BigNumber, deadline: string, minExpectedReceive: BigNumber, recipient: string): Promise<TransactionOperation>;
    /**
     * Swap Y tokens for X tokens
     * @param amount Amount of tokens to swap
     * @param deadline The transaction won't be executed past this point
     * @param minExpectedReceive Minimum amount of tokens to receive. The transaction won't be executed if buying less than the given amount of X tokens.
     * @param recipient Recipient of the tokens
     * @returns TransactionOperation
     */
    swapYX(amount: BigNumber, deadline: string, minExpectedReceive: BigNumber, recipient: string): Promise<TransactionOperation>;
    /**
     * Set position
     * @param lowerTickIndex Lower tick index
     * @param upperTickIndex Upper tick index
     * @param lowerTickWitness Lower tick witness
     * @param upperTickWitness Upper tick witness
     * @param liquidity Liquidity
     * @param deadline The transaction won't be executed past this point
     * @param maximumTokensContributedX Maximum tokens contributed X
     * @param maximumTokensContributedY Maximum tokens contributed Y
     * @returns TransactionOperation
     */
    setPosition(lowerTickIndex: BigNumber, upperTickIndex: BigNumber, lowerTickWitness: BigNumber, upperTickWitness: BigNumber, liquidity: BigNumber, deadline: string, maximumTokensContributedX: BigNumber, maximumTokensContributedY: BigNumber): Promise<TransactionOperation>;
    /**
     * Update position
     * @param positionId Position id
     * @param liquidityDelta Liquidity delta. If adding a delta (that can be negative) would result in a negative liquidity value,
     * the call will abort.
     * @param toX  Where to send the freed X tokens, if any.
     * @param toY Where to send the freed Y tokens, if any.
     * @param deadline The transaction won't be executed past this point
     * @param maximumTokensContributedX Maximum tokens contributed X
     * @param maximumTokensContributedY Maximum tokens contributed Y
     * @returns TransactionOperation
     */
    updatePosition(positionId: BigNumber, liquidityDelta: BigNumber, toX: string, toY: string, deadline: string, maximumTokensContributedX: BigNumber, maximumTokensContributedY: BigNumber): Promise<TransactionOperation>;
    /** Increase Observation Count
     * @param amount Amount of observations to add
     * @returns TransactionOperation
     *
     */
    increaseObservationCount(amount: BigNumber): Promise<TransactionOperation>;
    /**
     * Transfer
     * @param params Fa2 transfer param is list of transfer
     * @transferParam from Sender address
     * @transferParam txs List of TransferDestination
     * @transferDestination to Recipient address
     * @transferDestination token_id Token id
     * @transferDestination amount Amount of tokens to transfer
     * @returns TransactionOperation
     */
    transfer(params: fa2Types.Transfer[]): Promise<TransactionOperation>;
    /** Update operator
     * @param params Fa2 update operator param is list of update operator
     * @updateOperatorParam variant type or update operator or remove operator
     * @operatorParam owner Owner address
     * @operatorParam operator Operator address
     * @operatorParam token_id Token id
     * @returns TransactionOperation
     */
    updateOperator(params: fa2Types.UpdateOperator[]): Promise<TransactionOperation>;
}
