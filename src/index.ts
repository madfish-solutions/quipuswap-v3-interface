import { TezosToolkit, TransactionOperation } from "@taquito/taquito";
import { confirmOperation } from "./helpers/confirmation";
import { BigNumber } from "bignumber.js";
import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";
import { Address, Nat, Int } from "./utils";

type TezosContract = ReturnType<Awaited<TezosToolkit.contract.at>>

export namespace fa2Types {
  export type TransferDestination = {
    to_: Address;
    token_id: Nat;
    amount: Nat;
  };

  export type Transfer = {
    from_: Address;
    txs: TransferDestination[];
  };

  export type Operator = {
    owner: Address;
    operator: Address;
    token_id: Nat;
  };

  export type UpdateOperator =
    | { add_operator: Operator }
    | { remove_operator: Operator };
}
export namespace quipuswapV3Types {
  // export type Nat<T extends number> = number extends T
  //   ? never
  //   : `${T}` extends `-${string}` | `${string}.${string}`
  //   ? never
  //   : T;
  // // Keeps a positive value with -2^80 precision.
  // export function nat<N extends number>(n: Nat<N>): number {
  //   return -n;
  // }
  export type x80n = { x80: Nat };

  // Keeps a value with -2^128 precision.
  export type x128 = { x128: Int };

  // Keeps a positive value with -2^128 precision.
  export type x128n = { x128: Nat };

  // Tick types, representing pieces of the curve offered between different tick segments.
  export type TickIndex = { i: Int };

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
    liquidity_net: Int;

    //  Numbers of positions with an edge at the given tick.
    //     Used for garbage collection.
    //
    n_positions: Nat;

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
    seconds_outside: Nat;

    //  Tick indices accumulator i_o, it keeps track of time-weighted sum of
    //     tick indices, but accounts them only for "outside" periods.
    //     For the intuition for "outside" word, see `seconds_outside`.
    //
    tick_cumulative_outside: Int;

    //  Overall number of fees f_o that were accumulated during the period
    //     when the current tick index i_c was below (or above) this tick.

    //     For intuition for "outside" word, see `seconds_outside`.
    //
    fee_growth_outside: BalanceNatX128;

    //  Seconds-weighted 1/L value accumulator s_lo, it accounts only for
    //     "outside" periods. For intuition for "outside" word, see `seconds_outside`.

    //     This helps us to implement liquidity oracle.
    //
    seconds_per_liquidity_outside: x128n;

    // sqrt(P) = sqrt(X/Y) associated with this tick.
    sqrt_price: x80n;
  };

  export type PositionState = {
    // Position edge tick indices
    lower_tick_index: TickIndex;
    upper_tick_index: TickIndex;

    // The position's owner.
    // By default - position's creator, but ownership can be transferred later.
    owner: Address;

    // Position's liquidity.
    liquidity: Nat;

    // Total fees earned by the position at the moment of last fees collection for this position.
    // This helps to evaluate the next portion of fees to collect.
    fee_growth_inside_last: BalanceIntX128;
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
    reserved_length: Nat;
  };

  export type Constants = {
    fee_bps: Nat;
    ctez_burn_fee_bps: Nat;
    x_token_id: Nat;
    y_token_id: Nat;
    x_token_address: Address;
    y_token_address: Address;
    tick_spacing: Nat;
  };

  //// See defaults.mligo for more info
  export type Fixed_point = { v: Nat; offset: Int };
  export type Ladder_key = { exp: Nat; positive: Boolean };
  export type Ladder = MichelsonMap<MichelsonMapKey, unknown>;

  export type SetPosition = {
    lowerTickIndex: BigNumber;
    upperTickIndex: BigNumber;
    lowerTickWitness: BigNumber;
    upperTickWitness: BigNumber;
    liquidity: BigNumber;
    deadline: string;
    maximumTokensContributed: BalanceNat;
  };

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
    deadline: string;
    /** The maximum number of tokens to contribute.
        If a higher amount is required, the entrypoint fails.
    */
    maximumTokensContributed: BalanceNat;
  };

  export type Storage = {
    //// Virtual liquidity, the value L for which the curve locally looks like x * y = L^2.
    liquidity: Nat;

    // Square root of the virtual price, the value P for which P = x / y.
    sqrt_price: x80n;

    // Index of the highest tick corresponding to a price less than or equal to sqrt_price^2,
    // does not necessarily corresponds to a boundary.
    // Article's notation: i_c, tick.
    cur_tick_index: TickIndex;

    // The highest initialized tick lower than or equal to i_c.
    cur_tick_witness: TickIndex;

    // The total amount of fees that have been earned per unit of virtual liquidity (L),
    // over the entire history of the contract.
    fee_growth: BalanceNatX128;

    // States of all initialized ticks.
    ticks: MichelsonMap<MichelsonMapKey, unknown>;

    // States of positions (with non-zero liquidity).
    positions: MichelsonMap<MichelsonMapKey, unknown>;

    // Cumulative values stored for the recent timestamps.
    cumulatives_buffer: TimedCumulativesBuffer;
    // TZIP-16 metadata.
    metadata: MichelsonMap<MichelsonMapKey, unknown>;

    // Incremental position id to be assigned to new position.
    new_position_id: BigNumber;

    // FA2-related
    operators: MichelsonMap<MichelsonMapKey, unknown>;

    // Constants for options that are settable at origiBigNumberion
    constants: Constants;

    // Exponents ladder for the calculation of 'half_bps_pow'
    ladder: Ladder;
  };
}

namespace Decorators {

}

namespace SwapXY {
  getTransferParams() {
    return //params
  }

  send() {
    return Decorators.send(getTransferParams)
  }

  sendUntilConfirm() {
    return Decorators.sendUntilConfirm(getTransferParams)
  }
}


export class QuipuswapV3Methods {
  static async swapXY(
    tezos: TezosToolkit,
    contractAddress: Address,
    amount: Nat,
    deadline: string,
    minExpectedReceive: Nat,
    recipient: Address,
  ): Promise<TransactionOperation> {
    const contract = await tezos.contract.at(contractAddress.toString());
    const operation = await contract.methodsObject
      .x_to_y({
        dx: amount.toFixed(),
        deadline: deadline,
        min_dy: minExpectedReceive.toFixed(),
        to_dy: recipient.toString(),
      })
      .send();
    await confirmOperation(tezos, operation.hash);
    return operation;
  }

  static async swapYX(
    tezos: TezosToolkit,
    contractAddress: Address,
    amount: Nat,
    deadline: string,
    minExpectedReceive: Nat,
    recipient: Address,
  ): Promise<TransactionOperation> {
    const contract = await tezos.contract.at(contractAddress.toString());
    const operation = await contract.methodsObject
      .y_to_x({
        dx: amount.toFixed(),
        deadline: deadline,
        min_dx: minExpectedReceive.toFixed(),
        to_dx: recipient.toString(),
      })
      .send();
    await confirmOperation(tezos, operation.hash);
    return operation;
  }

  static async decorator<T>(tezos: TezosToolkit, contractAddress: string, params: T, callback: (contract: TezosContract, params: T) => Promise<any>) {
    try {
      const contract = await tezos.contract.at(contractAddress);

      const operation = await callback(contract, params);

      await confirmOperation(tezos, operation.hash);

      return operation;
    } catch (error) {

    }
  }

  static async setPositionShoto(
    contract: TezosContract,
    params: quipuswapV3Types.SetPosition,
  ): Promise<TransactionOperation> {
    return await contract.methodsObject
      .set_position({
        lower_tick_index: { i: params.lowerTickIndex.toFixed() },
        upper_tick_index: { i: params.upperTickIndex.toFixed() },
        lower_tick_witness: { i: params.lowerTickWitness.toFixed() },
        upper_tick_witness: { i: params.upperTickWitness.toFixed() },
        liquidity: params.liquidity.toFixed(),
        deadline: params.deadline,
        maxiumum_tokens_contributed: {
          x: params.maximumTokensContributed.x.toFixed(),
          y: params.maximumTokensContributed.y.toFixed(),
        },
      }).toTransferParams();
  }

  static async setPosition(tezos: TezosToolkit, contractAddress: string, params: quipuswapV3Types.SetPosition) {
    sendBatchOperation(tezos, [params]);

    return await QuipuswapV3Methods.decorator(tezos, contractAddress, params, QuipuswapV3Methods.setPositionShoto);
  }

  static async updatePosition(
    tezos: TezosToolkit,
    contractAddress: string,
    params: quipuswapV3Types.UpdatePosition,
  ): Promise<TransactionOperation> {
    try {
      const contract = await tezos.contract.at(contractAddress);//50 ms
      const operation = await contract.methodsObject
        .update_position({
          position_id: params.positionId,
          liquidity_delta: params.liquidityDelta,
          to_x: params.toX,
          to_y: params.toY,
          deadline: params.deadline,
          maximum_tokens_contributed: params.maximumTokensContributed,
        })
        .send();
      apliduteService.setEvent('updatePosition', operation.hash);
      await confirmOperation(tezos, operation.hash);
      return operation;
    } catch {
      console.log('error')
    }
  }

  static async createUpdatePositionOperation(
    contract: ReturnType<Awaited<typeof TezosToolkit.contract.at>>,
    params: quipuswapV3Types.UpdatePosition,
  ): Promise<TransactionOperation> {
    try {
      return await contract.methodsObject
        .update_position({
          position_id: params.positionId,
          liquidity_delta: params.liquidityDelta,
          to_x: params.toX,
          to_y: params.toY,
          deadline: params.deadline,
          maximum_tokens_contributed: params.maximumTokensContributed,
        })
    } catch (error) {

    }
  }

  /**
   *
   * @param tezos TezosToolkit
   * @param contractAddress Contract address
   * @param params Fa2 transfer param
   * @returns
   */
  static async transfer(
    tezos: TezosToolkit,
    contractAddress: string,
    params: fa2Types.Transfer[],
  ): Promise<TransactionOperation> {
    const contract = await tezos.contract.at(contractAddress);
    const transferParams = params.map(param => {
      return {
        from_: param.from_.toString(),
        txs: param.txs.map(tx => {
          return {
            to_: tx.to_.toString(),
            token_id: tx.token_id.toString(),
            amount: tx.amount.toFixed(),
          };
        }),
      };
    });
    const operation = await contract.methods.transfer(transferParams).send();
    await confirmOperation(tezos, operation.hash);
    return operation;
  }

  static async updateOperator(
    tezos: TezosToolkit,
    contractAddress: string,
    params: fa2Types.UpdateOperator[],
  ): Promise<TransactionOperation> {
    const contract = await tezos.contract.at(contractAddress);
    const updateOperatorParams = params.map(param => {
      if ("add_operator" in param) {
        return {
          add_operator: {
            owner: param.add_operator.owner.toString(),
            operator: param.add_operator.operator.toString(),
            token_id: param.add_operator.token_id.toString(),
          },
        };
      } else {
        return {
          remove_operator: {
            owner: param.remove_operator.owner.toString(),
            operator: param.remove_operator.operator.toString(),
            token_id: param.remove_operator.token_id.toString(),
          },
        };
      }
    });
    const operation = await contract.methods.update_operators(params).send();
    await confirmOperation(tezos, operation.hash);
    return operation;
  }

  static async IncreaseObservationCount(
    tezos: TezosToolkit,
    contractAddress: string,
    amount: Nat,
  ): Promise<TransactionOperation> {
    const contract = await tezos.contract.at(contractAddress);
    const operation = await contract.methodsObject
      .increase_observation_count({ added_observation_count: amount.toFixed() })
      .send();
    await confirmOperation(tezos, operation.hash);
    return operation;
  }
}
export class QuipuswapV3Storage {
  /**
   * @param tezos
   * @param contract
   * @returns
   */
  static async getStorage(tezos: TezosToolkit, contract: string): Promise<any> {
    return await (await tezos.contract.at(contract)).storage();
  }
}

export class QuipuswapV3 {
  contract: ReturnType<Awaited<TezosToolkit.contract.at>>

  constructor(private tezos: TezosToolkit, private contractAddress: string) {
    this.contract = tezos.contract.at(contractAddress)
  }

  async getStorage(): Promise<any> {
    return QuipuswapV3Storage.getStorage(this.tezos, this.contractAddress);
  }

  /**
   * Swap X tokens for Y tokens
   * @param amount Amount of tokens to swap
   * @param deadline The transaction won't be executed past this point
   * @param minExpectedReceive Minimum amount of tokens to receive. The transaction won't be executed if buying less than the given amount of Y tokens.
   * @param recipient Recipient of the tokens
   * @returns TransactionOperation
   */
  async swapXY(
    amount: BigNumber,
    deadline: string,
    minExpectedReceive: BigNumber,
    recipient: string,
  ): Promise<TransactionOperation> {
    return QuipuswapV3Methods.swapXY(
      this.tezos,
      new Address(this.contractAddress),
      new Nat(amount),
      deadline,
      new Nat(minExpectedReceive),
      new Address(recipient),
    );
  }

  /**
   * Swap Y tokens for X tokens
   * @param amount Amount of tokens to swap
   * @param deadline The transaction won't be executed past this point
   * @param minExpectedReceive Minimum amount of tokens to receive. The transaction won't be executed if buying less than the given amount of X tokens.
   * @param recipient Recipient of the tokens
   * @returns TransactionOperation
   */
  async swapYX(
    amount: BigNumber,
    deadline: string,
    minExpectedReceive: BigNumber,
    recipient: string,
  ): Promise<TransactionOperation> {
    return QuipuswapV3Methods.swapYX(
      this.tezos,
      new Address(this.contractAddress),
      new Nat(amount),
      deadline,
      new Nat(minExpectedReceive),
      new Address(recipient),
    );
  }

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
  async setPosition(
    lowerTickIndex: BigNumber,
    upperTickIndex: BigNumber,
    lowerTickWitness: BigNumber,
    upperTickWitness: BigNumber,
    liquidity: BigNumber,
    deadline: string,
    maximumTokensContributedX: BigNumber,
    maximumTokensContributedY: BigNumber,
  ): Promise<TransactionOperation> {
    const maximumTokensContributed = {
      x: new Nat(maximumTokensContributedX),
      y: new Nat(maximumTokensContributedY),
    };
    return QuipuswapV3Methods.setPosition(this.tezos, this.contractAddress, {
      lowerTickIndex,
      upperTickIndex,
      lowerTickWitness,
      upperTickWitness,
      liquidity,
      deadline,
      maximumTokensContributed,
    });
  }

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
  async updatePosition(
    positionId: BigNumber,
    liquidityDelta: BigNumber,
    toX: string,
    toY: string,
    deadline: string,
    maximumTokensContributedX: BigNumber,
    maximumTokensContributedY: BigNumber,
  ): Promise<TransactionOperation> {
    const maximumTokensContributed = {
      x: new Nat(maximumTokensContributedX),
      y: new Nat(maximumTokensContributedY),
    };
    const toXaddress = new Address(toX);
    const positionIdN = new Nat(positionId);
    const liquidityDeltaN = new Nat(liquidityDelta);
    const toYaddress = new Address(toY);
    return QuipuswapV3Methods.updatePosition(this.tezos, this.contractAddress, {
      positionId: positionIdN,
      liquidityDelta: liquidityDeltaN,
      toX: toXaddress,
      toY: toYaddress,
      deadline,
      maximumTokensContributed,
    });
  }

  /** Increase Observation Count
   * @param amount Amount of observations to add
   * @returns TransactionOperation
   *
   */
  async increaseObservationCount(
    amount: BigNumber,
  ): Promise<TransactionOperation> {
    return QuipuswapV3Methods.IncreaseObservationCount(
      this.tezos,
      this.contractAddress,
      new Nat(amount),
    );
  }

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
  async transfer(params: fa2Types.Transfer[]): Promise<TransactionOperation> {
    return QuipuswapV3Methods.transfer(
      this.tezos,
      this.contractAddress,
      params,
    );
  }

  /** Update operator
   * @param params Fa2 update operator param is list of update operator
   * @updateOperatorParam variant type or update operator or remove operator
   * @operatorParam owner Owner address
   * @operatorParam operator Operator address
   * @operatorParam token_id Token id
   * @returns TransactionOperation
   */
  async updateOperator(params: fa2Types.UpdateOperator[]) {
    return QuipuswapV3Methods.updateOperator(
      this.tezos,
      this.contractAddress,
      params,
    );
  }
}
