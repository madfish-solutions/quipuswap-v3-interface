import { Contract, TezosToolkit, TransferParams } from '@taquito/taquito';
import { BigNumber } from 'bignumber.js';
import { fa2Types, quipuswapV3Types, CallSettings, QsReturn, Nat, Int } from './types';
import { Address, Timestamp } from './utils';
export declare class QuipuswapV3Methods {
    static swapXY(contract: Contract, amount: Nat, deadline: Timestamp, minExpectedReceive: Nat, recipient: Address): TransferParams;
    static swapYX(contract: Contract, amount: Nat, deadline: Timestamp, minExpectedReceive: Nat, recipient: Address): TransferParams;
    static setPosition(contract: Contract, lowerTickIndex: Int, upperTickIndex: Int, lowerTickWitness: Int, upperTickWitness: Int, liquidity: Nat, deadline: Timestamp, maximumTokensContributedX: Nat, maximumTokensContributedY: Nat): TransferParams;
    static updatePosition(contract: Contract, positionId: Nat, liquidityDelta: Nat, toX: Address, toY: Address, deadline: Timestamp, maximumTokensContributedX: Int, maximumTokensContributedY: Int): TransferParams;
    static transfer(contract: Contract, ...params: fa2Types.Transfer[]): TransferParams;
    static updateOperators(contract: Contract, ...params: fa2Types.UpdateOperators[]): TransferParams;
    static increaseObservationCount(contract: Contract, amount: Nat): TransferParams;
}
export declare class QuipuswapV3Storage {
    /**
     * @param tezos
     * @param contract
     * @returns
     */
    static getStorage(contract: Contract, positionIds: Nat[], tickIndices: Int[], bufferMapIndices: Nat[]): Promise<quipuswapV3Types.Storage>;
    static updateStorage(storage: quipuswapV3Types.Storage, contract: Contract, positionIds?: Nat[], tickIndices?: Int[], bufferMapIndices?: Nat[]): Promise<quipuswapV3Types.Storage>;
    static getRawStorage(contract: Contract): Promise<any>;
}
export declare class QuipuswapV3 {
    callSettings: CallSettings;
    confirmationCount: number;
    tezos: TezosToolkit;
    contract: Contract;
    storage: quipuswapV3Types.Storage;
    constructor(callSettings?: CallSettings, confirmationCount?: number);
    init(tezos: TezosToolkit, contractAddress: string): Promise<this>;
    getStorage(positionIds?: Nat[], tickIndices?: Int[], bufferMapIndices?: Nat[]): Promise<quipuswapV3Types.Storage>;
    updateStorage(positionIds?: Nat[], tickIndices?: Int[], bufferMapIndices?: Nat[]): Promise<quipuswapV3Types.Storage>;
    getRawStorage(): Promise<any>;
    /**
     * Swap X tokens for Y tokens
     * @param amount Amount of tokens to swap
     * @param deadline The transaction won't be executed past this point
     * @param minExpectedReceive Minimum amount of tokens to receive. The transaction won't be executed if buying less than the given amount of Y tokens.
     * @param recipient Recipient of the tokens
     * @returns TransferParam | WalletOperationBatch
     */
    swapXY(amount: BigNumber, deadline: string, minExpectedReceive: BigNumber, recipient: string): Promise<QsReturn>;
    /**
     * Swap Y tokens for X tokens
     * @param amount Amount of tokens to swap
     * @param deadline The transaction won't be executed past this point
     * @param minExpectedReceive Minimum amount of tokens to receive. The transaction won't be executed if buying less than the given amount of X tokens.
     * @param recipient Recipient of the tokens
     * @returns TransferParam | WalletOperationBatch
     */
    swapYX(amount: BigNumber, deadline: string, minExpectedReceive: BigNumber, recipient: string): Promise<QsReturn>;
    /**
     * Creates a new position in the given range.
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
    setPosition(lowerTickIndex: BigNumber, upperTickIndex: BigNumber, lowerTickWitness: BigNumber, upperTickWitness: BigNumber, liquidity: BigNumber, deadline: string, maximumTokensContributedX: BigNumber, maximumTokensContributedY: BigNumber): Promise<QsReturn>;
    /**
     * Updates an existing position.
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
    updatePosition(positionId: BigNumber, liquidityDelta: BigNumber, toX: string, toY: string, deadline: string, maximumTokensContributedX: BigNumber, maximumTokensContributedY: BigNumber): Promise<QsReturn>;
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
    transfer(params: fa2Types.Transfer[]): Promise<QsReturn>;
    /** Update operator
     * @param params Fa2 update operator param is list of update operator
     * @updateOperatorsParam variant type or update operator or remove operator
     * @operatorParam owner Owner address
     * @operatorParam operator Operator address
     * @operatorParam token_id Token id
     * @returns TransferParam | WalletOperationBatch
     */
    updateOperators(params: fa2Types.UpdateOperators[]): Promise<QsReturn>;
    increaseObservationCount(count: BigNumber): Promise<TransferParams>;
    observe(timestamps?: string[]): Promise<quipuswapV3Types.CumulativesValue[]>;
    setCallSetting(callSetting: CallSettings): void;
}
