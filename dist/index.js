"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuipuswapV3 = exports.QuipuswapV3Storage = exports.QuipuswapV3Methods = void 0;
const types_1 = require("./types");
const utils_1 = require("./utils");
const defaults_1 = require("./helpers/defaults");
const decorators_1 = require("./helpers/decorators");
class QuipuswapV3Methods {
    static swapXY(contract, amount, deadline, minExpectedReceive, recipient) {
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
    static swapYX(contract, amount, deadline, minExpectedReceive, recipient) {
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
    static setPosition(contract, lowerTickIndex, upperTickIndex, lowerTickWitness, upperTickWitness, liquidity, deadline, maximumTokensContributedX, maximumTokensContributedY) {
        const transferParams = contract.methods
            .set_position(lowerTickIndex.toFixed(), upperTickIndex.toFixed(), lowerTickWitness.toFixed(), upperTickWitness.toFixed(), liquidity.toFixed(), deadline.toString(), maximumTokensContributedX.toFixed(), maximumTokensContributedY.toFixed())
            .toTransferParams();
        return transferParams;
    }
    static updatePosition(contract, positionId, liquidityDelta, toX, toY, deadline, maximumTokensContributedX, maximumTokensContributedY) {
        const transferParams = contract.methods
            .update_position(positionId.toFixed(), liquidityDelta.toFixed(), toX.toString(), toY.toString(), deadline.toString(), maximumTokensContributedX.toFixed(), maximumTokensContributedY.toFixed())
            .toTransferParams();
        return transferParams;
    }
    static transfer(contract, ...params) {
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
    static updateOperators(contract, ...params) {
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
            }
            else {
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
    static increaseObservationCount(contract, amount) {
        const transferParams = contract.methods
            .increase_observation_count(amount.toFixed())
            .toTransferParams();
        return transferParams;
    }
}
exports.QuipuswapV3Methods = QuipuswapV3Methods;
class QuipuswapV3Storage {
    /**
     * @param tezos
     * @param contract
     * @returns
     */
    static getStorage(contract, positionIds, tickIndices, bufferMapIndices) {
        return __awaiter(this, void 0, void 0, function* () {
            const origStorage = (yield contract.storage());
            return {
                liquidity: new types_1.Nat(origStorage.liquidity),
                sqrtPrice: new types_1.quipuswapV3Types.x80n(origStorage.sqrt_price),
                curTickIndex: new types_1.Int(origStorage.cur_tick_index),
                curTickWitness: new types_1.Int(origStorage.cur_tick_witness),
                feeGrowth: {
                    x: new types_1.quipuswapV3Types.x80n(origStorage.fee_growth.x),
                    y: new types_1.quipuswapV3Types.x80n(origStorage.fee_growth.y),
                },
                ticks: yield types_1.quipuswapV3Types.TickMap.init(origStorage.ticks, tickIndices),
                positions: yield types_1.quipuswapV3Types.PositionMap.init(origStorage.positions, positionIds),
                cumulativesBuffer: {
                    map: yield types_1.quipuswapV3Types.CumulativeBufferMap.init(origStorage.cumulatives_buffer.map, bufferMapIndices),
                    first: new types_1.Nat(origStorage.cumulatives_buffer.first),
                    last: new types_1.Nat(origStorage.cumulatives_buffer.last),
                    reservedLength: new types_1.Nat(origStorage.cumulatives_buffer.reserved_length),
                },
                metadata: origStorage.metadata,
                newPositionId: new types_1.Nat(origStorage.new_position_id),
                operators: origStorage.operators,
                constants: {
                    feeBps: new types_1.Nat(origStorage.constants.fee_bps),
                    tokenX: origStorage.constants.token_x,
                    tokenY: origStorage.constants.token_y,
                    tickSpacing: new types_1.Nat(origStorage.constants.tick_spacing),
                },
                ladder: new types_1.quipuswapV3Types.LadderMap(origStorage.ladder),
            };
        });
    }
    static updateStorage(storage, contract, positionIds = [], tickIndices = [], bufferMapIndices = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const origStorage = (yield contract.storage());
            storage.liquidity = new types_1.Nat(origStorage.liquidity);
            storage.sqrtPrice = new types_1.quipuswapV3Types.x80n(origStorage.sqrt_price);
            storage.curTickIndex = new types_1.Int(origStorage.cur_tick_index);
            storage.curTickWitness = new types_1.Int(origStorage.cur_tick_witness);
            storage.feeGrowth = {
                x: new types_1.quipuswapV3Types.x80n(origStorage.fee_growth.x),
                y: new types_1.quipuswapV3Types.x80n(origStorage.fee_growth.y),
            };
            yield storage.ticks.updateMap(tickIndices);
            yield storage.positions.updateMap(positionIds);
            yield storage.cumulativesBuffer.map.updateMap(bufferMapIndices);
            storage.metadata = origStorage.metadata;
            storage.newPositionId = new types_1.Nat(origStorage.new_position_id);
            storage.operators = origStorage.operators;
            storage.constants = {
                feeBps: new types_1.Nat(origStorage.constants.fee_bps),
                tokenX: origStorage.constants.token_x,
                tokenY: origStorage.constants.token_y,
                tickSpacing: new types_1.Nat(origStorage.constants.tick_spacing),
            };
            storage.ladder = new types_1.quipuswapV3Types.LadderMap(origStorage.ladder);
            return storage;
        });
    }
    static getRawStorage(contract) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield contract.storage();
        });
    }
}
exports.QuipuswapV3Storage = QuipuswapV3Storage;
class QuipuswapV3 {
    constructor(callSettings = defaults_1.defaultCallSettings, syncInterval = 0, confirmtaionTimeout = 500000) {
        this.callSettings = callSettings;
        this.syncInterval = syncInterval;
        this.confirmtaionTimeout = confirmtaionTimeout;
    }
    init(tezos, contractAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            this.tezos = tezos;
            this.contract = yield tezos.contract.at(contractAddress);
            this.storage = yield QuipuswapV3Storage.getStorage(this.contract, [], [], []);
            return this;
        });
    }
    getStorage(positionIds = [], tickIndices = [], bufferMapIndices = []) {
        return __awaiter(this, void 0, void 0, function* () {
            return QuipuswapV3Storage.getStorage(this.contract, positionIds, tickIndices, bufferMapIndices);
        });
    }
    updateStorage(positionIds = [], tickIndices = [], bufferMapIndices = []) {
        return __awaiter(this, void 0, void 0, function* () {
            yield QuipuswapV3Storage.updateStorage(this.storage, this.contract, positionIds, tickIndices, bufferMapIndices);
            return this.storage;
        });
    }
    getRawStorage() {
        return __awaiter(this, void 0, void 0, function* () {
            return QuipuswapV3Storage.getRawStorage(this.contract);
        });
    }
    /**
     * Swap X tokens for Y tokens
     * @param amount Amount of tokens to swap
     * @param deadline The transaction won't be executed past this point
     * @param minExpectedReceive Minimum amount of tokens to receive. The transaction won't be executed if buying less than the given amount of Y tokens.
     * @param recipient Recipient of the tokens
     * @returns TransferParam | WalletOperationBatch
     */
    swapXY(amount, deadline, minExpectedReceive, recipient) {
        return __awaiter(this, void 0, void 0, function* () {
            const transferParams = [
                new types_1.Nat(amount),
                new utils_1.Timestamp(deadline),
                new types_1.Nat(minExpectedReceive),
                new utils_1.Address(recipient),
            ];
            return {
                callParams: transferParams,
                callback: QuipuswapV3Methods.swapXY,
            };
        });
    }
    /**
     * Swap Y tokens for X tokens
     * @param amount Amount of tokens to swap
     * @param deadline The transaction won't be executed past this point
     * @param minExpectedReceive Minimum amount of tokens to receive. The transaction won't be executed if buying less than the given amount of X tokens.
     * @param recipient Recipient of the tokens
     * @returns TransferParam | WalletOperationBatch
     */
    swapYX(amount, deadline, minExpectedReceive, recipient) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = [
                new types_1.Nat(amount),
                new utils_1.Timestamp(deadline),
                new types_1.Nat(minExpectedReceive),
                new utils_1.Address(recipient),
            ];
            return {
                callParams: params,
                callback: QuipuswapV3Methods.swapYX,
            };
        });
    }
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
    setPosition(lowerTickIndex, upperTickIndex, lowerTickWitness, upperTickWitness, liquidity, deadline, maximumTokensContributedX, maximumTokensContributedY) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = [
                new types_1.Int(lowerTickIndex),
                new types_1.Int(upperTickIndex),
                new types_1.Int(lowerTickWitness),
                new types_1.Int(upperTickWitness),
                new types_1.Nat(liquidity),
                new utils_1.Timestamp(deadline),
                new types_1.Nat(maximumTokensContributedX),
                new types_1.Nat(maximumTokensContributedY),
            ];
            return {
                callParams: params,
                callback: QuipuswapV3Methods.setPosition,
            };
        });
    }
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
    updatePosition(positionId, liquidityDelta, toX, toY, deadline, maximumTokensContributedX, maximumTokensContributedY) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = [
                new types_1.Nat(positionId),
                new types_1.Int(liquidityDelta),
                new utils_1.Address(toX),
                new utils_1.Address(toY),
                new utils_1.Timestamp(deadline),
                new types_1.Nat(maximumTokensContributedX),
                new types_1.Nat(maximumTokensContributedY),
            ];
            return {
                callParams: params,
                callback: QuipuswapV3Methods.updatePosition,
            };
        });
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
    transfer(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const fa2TransferParams = params.map(param => {
                return {
                    from_: new utils_1.Address(param.from_),
                    txs: param.txs.map(tx => {
                        return {
                            to_: new utils_1.Address(tx.to_),
                            token_id: new types_1.Nat(tx.token_id),
                            amount: new types_1.Nat(tx.amount.toFixed()),
                        };
                    }),
                };
            });
            return {
                callParams: fa2TransferParams,
                callback: QuipuswapV3Methods.transfer,
            };
        });
    }
    /** Update operator
     * @param params Fa2 update operator param is list of update operator
     * @updateOperatorsParam variant type or update operator or remove operator
     * @operatorParam owner Owner address
     * @operatorParam operator Operator address
     * @operatorParam token_id Token id
     * @returns TransferParam | WalletOperationBatch
     */
    updateOperators(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateOperatorsParams = params.map(param => {
                if ("add_operator" in param) {
                    return {
                        add_operator: {
                            owner: new utils_1.Address(param.add_operator.owner),
                            operator: new utils_1.Address(param.add_operator.operator),
                            token_id: new types_1.Nat(param.add_operator.token_id),
                        },
                    };
                }
                else {
                    return {
                        remove_operator: {
                            owner: new utils_1.Address(param.remove_operator.owner),
                            operator: new utils_1.Address(param.remove_operator.operator),
                            token_id: new types_1.Nat(param.remove_operator.token_id),
                        },
                    };
                }
            });
            return {
                callParams: updateOperatorsParams,
                callback: QuipuswapV3Methods.updateOperators,
            };
        });
    }
    increaseObservationCount(count) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                callParams: [new types_1.Nat(count)],
                callback: QuipuswapV3Methods.increaseObservationCount,
            };
        });
    }
    /** Get Oracle values at certain given range. Reimplemented from Haskell Code below this line.
     * observe cfmm = do
    currentTime <- getNow
    consumer <- originateSimple @[CumulativesValue] "observe-consumer" [] contractConsumer
    call cfmm (Call @"Observe") $ mkView [currentTime] consumer
    getStorage consumer >>= \case
      [[cv]] -> pure cv
      _ -> failure "Expected to get exactly 1 CumulativeValue"
    */
    observe(timestamps = []) {
        return __awaiter(this, void 0, void 0, function* () {
            if (timestamps.length === 0) {
                const ts = (yield this.tezos.rpc.getBlockHeader()).timestamp;
                const now = new utils_1.Timestamp(ts).toString();
                return yield this.contract.views.observe([now]).read();
            }
            return yield this.contract.views.observe(timestamps).read();
        });
    }
    setCallSetting(callSetting) {
        this.callSettings = callSetting;
    }
}
__decorate([
    decorators_1.extendCallQS
], QuipuswapV3.prototype, "swapXY", null);
__decorate([
    decorators_1.extendCallQS
], QuipuswapV3.prototype, "swapYX", null);
__decorate([
    decorators_1.extendCallQS
], QuipuswapV3.prototype, "setPosition", null);
__decorate([
    decorators_1.extendCallQS
], QuipuswapV3.prototype, "updatePosition", null);
__decorate([
    decorators_1.extendCallQS
], QuipuswapV3.prototype, "transfer", null);
__decorate([
    decorators_1.extendCallQS
], QuipuswapV3.prototype, "updateOperators", null);
__decorate([
    decorators_1.extendCallQS
], QuipuswapV3.prototype, "increaseObservationCount", null);
exports.QuipuswapV3 = QuipuswapV3;
