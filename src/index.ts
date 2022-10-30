import { Contract, TezosToolkit } from "@taquito/taquito";

import { BigNumber } from "bignumber.js";
import { TransferParams } from "@taquito/taquito";
import {
  fa2Types,
  quipuswapV3Types,
  CallSettings,
  ReturnMethodType,
} from "./types";
import { Address, Nat, Int, sendBatch } from "./utils";
import { defaultCallSettings } from "./helpers/defaults";

export class QuipuswapV3Methods {
  static async awaitTx(
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    // if (onlyRead) {
    //   return descriptor;
    // }
    let originalMethod = descriptor.value;

    var f = descriptor.value;

    descriptor.value = async function (x: any) {
      console.log(typeof x);
      return await f(x);
    };
    Object.defineProperty(target, propertyKey, descriptor);
  }

  static swapXY(
    contract: Contract,
    amount: Nat,
    deadline: string,
    minExpectedReceive: Nat,
    recipient: Address,
  ): TransferParams {
    const params = contract.methodsObject
      .x_to_y({
        dx: amount.toFixed(),
        deadline: deadline,
        min_dy: minExpectedReceive.toFixed(),
        to_dy: recipient.toString(),
      })
      .toTransferParams();

    return params;
  }

  static swapYX(
    contract: Contract,
    amount: Nat,
    deadline: string,
    minExpectedReceive: Nat,
    recipient: Address,
  ): TransferParams {
    const transferParams = contract.methodsObject
      .y_to_x({
        dx: amount.toFixed(),
        deadline: deadline,
        min_dx: minExpectedReceive.toFixed(),
        to_dx: recipient.toString(),
      })
      .toTransferParams();

    return transferParams;
  }

  static setPosition(
    contract: Contract,
    params: quipuswapV3Types.SetPosition,
  ): TransferParams {
    const transferParams = contract.methodsObject
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
      })
      .toTransferParams();
    return transferParams;
  }

  static updatePosition(
    contract: Contract,
    params: quipuswapV3Types.UpdatePosition,
  ): TransferParams {
    const transferParams = contract.methodsObject
      .update_position({
        position_id: params.positionId,
        liquidity_delta: params.liquidityDelta,
        to_x: params.toX,
        to_y: params.toY,
        deadline: params.deadline,
        maximum_tokens_contributed: params.maximumTokensContributed,
      })
      .toTransferParams();

    return transferParams;
  }

  static transfer(
    contract: Contract,
    params: fa2Types.Transfer[],
  ): TransferParams {
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
    const trParams = contract.methods
      .transfer(transferParams)
      .toTransferParams();
    return trParams;
  }

  static updateOperator(
    contract: Contract,
    params: fa2Types.UpdateOperator[],
  ): TransferParams {
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
    const trParams = contract.methods
      .update_operators(updateOperatorParams)
      .toTransferParams();
    return trParams;
  }

  static increaseObservationCount(
    contract: Contract,
    amount: Nat,
  ): TransferParams {
    const transferParams = contract.methodsObject
      .increase_observation_count({ added_observation_count: amount.toFixed() })
      .toTransferParams();

    return transferParams;
  }
}
export class QuipuswapV3Storage {
  /**
   * @param tezos
   * @param contract
   * @returns
   */
  static async getStorage(contract: Contract): Promise<unknown> {
    return contract.storage();
  }
}

export class QuipuswapV3 {
  tezos: TezosToolkit;
  contract: Contract;
  constructor(private callSettings: CallSettings = defaultCallSettings) {}

  async init(tezos: TezosToolkit, contractAddress: string) {
    this.tezos = tezos;
    this.contract = await tezos.contract.at(contractAddress);
    return this;
  }

  async getStorage(): Promise<any> {
    return QuipuswapV3Storage.getStorage(this.contract);
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
  ): Promise<ReturnMethodType> {
    const transferParams = [
      this.contract,
      new Nat(amount),
      deadline,
      new Nat(minExpectedReceive),
      new Address(recipient),
    ];
    return { callParams: transferParams, callback: QuipuswapV3Methods.swapXY };
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
  ): Promise<ReturnMethodType> {
    const params = [
      this.contract,
      new Nat(amount),
      deadline,
      new Nat(minExpectedReceive),
      new Address(recipient),
    ];
    return { callParams: params, callback: QuipuswapV3Methods.swapYX };
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
  ): Promise<ReturnMethodType> {
    const maximumTokensContributed = {
      x: new Nat(maximumTokensContributedX),
      y: new Nat(maximumTokensContributedY),
    };
    const params = [
      lowerTickIndex,
      upperTickIndex,
      lowerTickWitness,
      upperTickWitness,
      liquidity,
      deadline,
      maximumTokensContributed,
    ];
    return { callParams: params, callback: QuipuswapV3Methods.setPosition };
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
  ): Promise<ReturnMethodType> {
    const maximumTokensContributed = {
      x: new Nat(maximumTokensContributedX),
      y: new Nat(maximumTokensContributedY),
    };
    const toXaddress = new Address(toX);
    const positionIdN = new Nat(positionId);
    const liquidityDeltaN = new Nat(liquidityDelta);
    const toYaddress = new Address(toY);
    const params = [
      {
        positionId: positionIdN,
        liquidityDelta: liquidityDeltaN,
        toX: toXaddress,
        toY: toYaddress,
        deadline,
        maximumTokensContributed,
      },
    ];
    return { callParams: params, callback: QuipuswapV3Methods.updatePosition };
  }

  /** Increase Observation Count
   * @param amount Amount of observations to add
   * @returns TransactionOperation
   *
   */
  async increaseObservationCount(amount: BigNumber): Promise<ReturnMethodType> {
    return {
      callParams: [new Nat(amount)],
      callback: QuipuswapV3Methods.increaseObservationCount,
    };
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
  async transfer(params: fa2Types.Transfer[]): Promise<ReturnMethodType> {
    return { callParams: [params], callback: QuipuswapV3Methods.transfer };
  }

  /** Update operator
   * @param params Fa2 update operator param is list of update operator
   * @updateOperatorParam variant type or update operator or remove operator
   * @operatorParam owner Owner address
   * @operatorParam operator Operator address
   * @operatorParam token_id Token id
   * @returns TransactionOperation
   */
  async updateOperator(
    params: fa2Types.UpdateOperator[],
  ): Promise<ReturnMethodType> {
    return {
      callParams: [params],
      callback: QuipuswapV3Methods.updateOperator,
    };
  }
}
