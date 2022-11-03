import { Contract, TezosToolkit, TransferParams } from "@taquito/taquito";
import { BigNumber } from "bignumber.js";
import {
  fa2Types,
  quipuswapV3Types,
  CallSettings,
  ReturnMethodType,
  QsReturn,
} from "./types";
import { Address, Nat, Int, Timestamp } from "./utils";
import { defaultCallSettings } from "./helpers/defaults";
import { extendCallQS } from "./helpers/decorators";

export class QuipuswapV3Methods {
  static swapXY(
    contract: Contract,
    amount: Nat,
    deadline: Timestamp,
    minExpectedReceive: Nat,
    recipient: Address,
  ): TransferParams {
    const params = contract.methodsObject
      .x_to_y({
        dx: amount.toFixed(),
        deadline: deadline.toString(),
        min_dy: minExpectedReceive.toFixed(),
        to_dy: recipient.toString(),
      })
      .toTransferParams();

    return params;
  }

  static swapYX(
    contract: Contract,
    amount: Nat,
    deadline: Timestamp,
    minExpectedReceive: Nat,
    recipient: Address,
  ): TransferParams {
    const transferParams = contract.methodsObject
      .y_to_x({
        dy: amount.toFixed(),
        deadline: deadline.toString(),
        min_dx: minExpectedReceive.toFixed(),
        to_dx: recipient.toString(),
      })
      .toTransferParams();

    return transferParams;
  }

  static setPosition(
    contract: Contract,
    lowerTickIndex: Int,
    upperTickIndex: Int,
    lowerTickWitness: Int,
    upperTickWitness: Int,
    liquidity: Nat,
    deadline: Timestamp,
    maximumTokensContributedX: Nat,
    maximumTokensContributedY: Nat,
  ): TransferParams {
    const transferParams = contract.methods
      .set_position(
        lowerTickIndex.toFixed(),
        upperTickIndex.toFixed(),
        lowerTickWitness.toFixed(),
        upperTickWitness.toFixed(),
        liquidity.toFixed(),
        deadline.toString(),
        maximumTokensContributedX.toFixed(),
        maximumTokensContributedY.toFixed(),
      )
      .toTransferParams();
    return transferParams;
  }

  static updatePosition(
    contract: Contract,
    positionId: Nat,
    liquidityDelta: Nat,
    toX: Address,
    toY: Address,
    deadline: Timestamp,
    maximumTokensContributedX: Nat,
    maximumTokensContributedY: Nat,
  ): TransferParams {
    const transferParams = contract.methods
      .update_position(
        positionId.toFixed(),
        liquidityDelta.toFixed(),
        toX.toString(),
        toY.toString(),
        deadline.toString(),
        maximumTokensContributedX.toFixed(),
        maximumTokensContributedY.toFixed(),
      )
      .toTransferParams();

    return transferParams;
  }

  static transfer(
    contract: Contract,
    ...params: fa2Types.Transfer[]
  ): TransferParams {
    params = [...params];
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

  static updateOperators(
    contract: Contract,
    ...params: fa2Types.UpdateOperators[]
  ): TransferParams {
    params = [...params];
    const updateOperatorsParams = params.map(param => {
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
      .update_operators(updateOperatorsParams)
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
  constructor(
    private callSettings: CallSettings = defaultCallSettings,
    public syncInterval: number = 0,
    public confirmtaionTimeout: number = 500000,
  ) {}

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
   * @returns TransferParam | WalletOperationBatch
   */
  @extendCallQS
  async swapXY(
    amount: BigNumber,
    deadline: string,
    minExpectedReceive: BigNumber,
    recipient: string,
  ): Promise<QsReturn> {
    const transferParams = [
      new Nat(amount),
      new Timestamp(deadline),
      new Nat(minExpectedReceive),
      new Address(recipient),
    ];
    return {
      callParams: transferParams,
      callback: QuipuswapV3Methods.swapXY,
    } as unknown as TransferParams;
  }

  /**
   * Swap Y tokens for X tokens
   * @param amount Amount of tokens to swap
   * @param deadline The transaction won't be executed past this point
   * @param minExpectedReceive Minimum amount of tokens to receive. The transaction won't be executed if buying less than the given amount of X tokens.
   * @param recipient Recipient of the tokens
   * @returns TransferParam | WalletOperationBatch
   */
  @extendCallQS
  async swapYX(
    amount: BigNumber,
    deadline: string,
    minExpectedReceive: BigNumber,
    recipient: string,
  ): Promise<QsReturn> {
    const params = [
      new Nat(amount),
      new Timestamp(deadline),
      new Nat(minExpectedReceive),
      new Address(recipient),
    ];
    return {
      callParams: params,
      callback: QuipuswapV3Methods.swapYX,
    } as unknown as TransferParams;
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
   * @returns TransferParam | WalletOperationBatch
   */
  @extendCallQS
  async setPosition(
    lowerTickIndex: BigNumber,
    upperTickIndex: BigNumber,
    lowerTickWitness: BigNumber,
    upperTickWitness: BigNumber,
    liquidity: BigNumber,
    deadline: string,
    maximumTokensContributedX: BigNumber,
    maximumTokensContributedY: BigNumber,
  ): Promise<QsReturn> {
    const params = [
      new Int(lowerTickIndex),
      new Int(upperTickIndex),
      new Int(lowerTickWitness),
      new Int(upperTickWitness),
      new Nat(liquidity),
      new Timestamp(deadline),
      new Nat(maximumTokensContributedX),
      new Nat(maximumTokensContributedY),
    ];
    return {
      callParams: params,
      callback: QuipuswapV3Methods.setPosition,
    } as unknown as TransferParams;
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
   * @returns TransferParam | WalletOperationBatch
   */
  @extendCallQS
  async updatePosition(
    positionId: BigNumber,
    liquidityDelta: BigNumber,
    toX: string,
    toY: string,
    deadline: string,
    maximumTokensContributedX: BigNumber,
    maximumTokensContributedY: BigNumber,
  ): Promise<QsReturn> {
    const params = [
      new Nat(positionId),
      new Int(liquidityDelta),
      new Address(toX),
      new Address(toY),
      new Timestamp(deadline),
      new Nat(maximumTokensContributedX),
      new Nat(maximumTokensContributedY),
    ];
    return {
      callParams: params,
      callback: QuipuswapV3Methods.updatePosition,
    } as unknown as TransferParams;
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
  @extendCallQS
  async transfer(params: fa2Types.Transfer[]): Promise<QsReturn> {
    const fa2TransferParams = params.map(param => {
      return {
        from_: new Address(param.from_),
        txs: param.txs.map(tx => {
          return {
            to_: new Address(tx.to_),
            token_id: new Nat(tx.token_id),
            amount: new Nat(tx.amount.toFixed()),
          };
        }),
      };
    });
    return {
      callParams: fa2TransferParams,
      callback: QuipuswapV3Methods.transfer,
    } as unknown as TransferParams;
  }

  /** Update operator
   * @param params Fa2 update operator param is list of update operator
   * @updateOperatorsParam variant type or update operator or remove operator
   * @operatorParam owner Owner address
   * @operatorParam operator Operator address
   * @operatorParam token_id Token id
   * @returns TransferParam | WalletOperationBatch
   */
  @extendCallQS
  async updateOperators(params: fa2Types.UpdateOperators[]): Promise<QsReturn> {
    const updateOperatorsParams = params.map(param => {
      if ("add_operator" in param) {
        return {
          add_operator: {
            owner: new Address(param.add_operator.owner),
            operator: new Address(param.add_operator.operator),
            token_id: new Nat(param.add_operator.token_id),
          },
        };
      } else {
        return {
          remove_operator: {
            owner: new Address(param.remove_operator.owner),
            operator: new Address(param.remove_operator.operator),
            token_id: new Nat(param.remove_operator.token_id),
          },
        };
      }
    });
    return {
      callParams: updateOperatorsParams,
      callback: QuipuswapV3Methods.updateOperators,
    } as unknown as TransferParams;
  }
}
