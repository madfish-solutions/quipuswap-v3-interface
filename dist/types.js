"use strict";
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
exports.quipuswapV3Types = exports.CallMode = exports.Int = exports.Nat = void 0;
const bignumber_js_1 = require("bignumber.js");
const michelson_encoder_1 = require("@taquito/michelson-encoder");
const math_1 = require("./helpers/math");
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
class Nat extends bignumber_js_1.BigNumber {
    // _nat: BigNumber;
    constructor(number) {
        number = new bignumber_js_1.BigNumber(number);
        if (number < new bignumber_js_1.BigNumber(0) || !number.isInteger() || number.isNaN()) {
            throw new Error(`Invalid nat: ${number.toString()}`);
        }
        super(number);
    }
    fromPow(precision, roundingMode = bignumber_js_1.BigNumber.ROUND_DOWN) {
        return this.dividedBy(new bignumber_js_1.BigNumber(10).pow(precision)).integerValue(roundingMode);
    }
    toPow(precision, roundingMode = bignumber_js_1.BigNumber.ROUND_DOWN) {
        return this.multipliedBy(new bignumber_js_1.BigNumber(10).pow(precision)).integerValue(roundingMode);
    }
}
exports.Nat = Nat;
/**
 * @description Type class to represent a Tezos Int type which is a BigNumber
 * @example
 * const int = new Int('new BigNumber(-100)')
 * int.toString() // '-100'
 * int.toFixed() // '-100'
 * int.fromPrecision(6) // BigNumber(-0.0001)
 * int.toPrecision(6) // BigNumber(-1000000)
 */
class Int extends bignumber_js_1.BigNumber {
    constructor(number) {
        number = new bignumber_js_1.BigNumber(number);
        if (!number.isInteger() || number.isNaN()) {
            throw new Error(`Invalid int: ${number}`);
        }
        super(number);
    }
    fromPow(precision, roundingMode = bignumber_js_1.BigNumber.ROUND_DOWN) {
        return this.dividedBy(new bignumber_js_1.BigNumber(10).pow(precision)).integerValue(roundingMode);
    }
    toPow(precision, roundingMode = bignumber_js_1.BigNumber.ROUND_DOWN) {
        return this.multipliedBy(new bignumber_js_1.BigNumber(10).pow(precision)).integerValue(roundingMode);
    }
}
exports.Int = Int;
var CallMode;
(function (CallMode) {
    CallMode[CallMode["returnParams"] = 0] = "returnParams";
    CallMode[CallMode["returnOperation"] = 1] = "returnOperation";
    CallMode[CallMode["returnConfirmatedOperation"] = 2] = "returnConfirmatedOperation";
})(CallMode = exports.CallMode || (exports.CallMode = {}));
var quipuswapV3Types;
(function (quipuswapV3Types) {
    /**
     * Keeps a positive value with -2^80 precision.
     */
    class x80n extends Nat {
        constructor(number) {
            super(number);
        }
        static init(number) {
            number = new bignumber_js_1.BigNumber(number);
            return new x80n(number.multipliedBy(new bignumber_js_1.BigNumber(2).pow(80)));
        }
        toNormal() {
            return (0, math_1.shiftRight)(this, new bignumber_js_1.BigNumber(80));
        }
    }
    quipuswapV3Types.x80n = x80n;
    /**
     *  Keeps a value with -2^128 precision.
     *
     */
    class x128 extends Int {
        constructor(number) {
            super(number);
        }
        static init(number) {
            number = new bignumber_js_1.BigNumber(number);
            return new x128(number.multipliedBy(new bignumber_js_1.BigNumber(2).pow(128)));
        }
        toNormal() {
            return (0, math_1.shiftRight)(this, new bignumber_js_1.BigNumber(128));
        }
    }
    quipuswapV3Types.x128 = x128;
    /**
     * Keeps a positive value with -2^128 precision.
     */
    class x128n extends Nat {
        constructor(number) {
            super(number);
        }
        static init(number) {
            number = new bignumber_js_1.BigNumber(number);
            return new x128n(number.multipliedBy(new bignumber_js_1.BigNumber(2).pow(128)));
        }
        toNormal() {
            return (0, math_1.shiftRight)(this, new bignumber_js_1.BigNumber(128));
        }
    }
    quipuswapV3Types.x128n = x128n;
    class CumulativeBufferMap {
        constructor(michelsonMap, map) {
            this.michelsonMap = michelsonMap;
            this.map = map;
        }
        static init(michelsonMap, indices = []) {
            return __awaiter(this, void 0, void 0, function* () {
                const timedCumulatives = yield michelsonMap.getMultipleValues(indices);
                const newCumulativesMap = {};
                timedCumulatives.forEach((value, key) => {
                    if (value !== undefined) {
                        newCumulativesMap[key] = {
                            time: value.time,
                            tick: {
                                sum: new x128n(value.tick.sum),
                                blockStartValue: value.tick.block_start_value,
                            },
                            spl: {
                                sum: new x128n(value.spl.sum),
                                blockStartLiquidityValue: value.spl.block_start_liquidity_value,
                            },
                        };
                    }
                });
                return new CumulativeBufferMap(michelsonMap, newCumulativesMap);
            });
        }
        static initCustom(extraReservedSlots) {
            const newCumulativesMichelsonMap = new michelson_encoder_1.MichelsonMap();
            const newCumulativesMap = {};
            let reservedSlotsList = [];
            for (let i = 0; i < extraReservedSlots; i++) {
                reservedSlotsList.push(new Nat(1));
                newCumulativesMichelsonMap.set(i, {
                    time: "0",
                    tick: {
                        sum: "0",
                        block_start_value: "0",
                    },
                    spl: {
                        sum: "0",
                        block_start_liquidity_value: "0",
                    },
                });
                newCumulativesMap[i] = {
                    time: "0",
                    tick: {
                        sum: new x128n("0"),
                        blockStartValue: new Int("0"),
                    },
                    spl: {
                        sum: new x128n("0"),
                        blockStartLiquidityValue: new Nat("0"),
                    },
                };
            }
            return new CumulativeBufferMap(newCumulativesMichelsonMap, newCumulativesMap);
        }
        get(key) {
            return this.map[key.toString()];
        }
        getActual(key) {
            return __awaiter(this, void 0, void 0, function* () {
                const ts = yield this.michelsonMap.get(key.toString());
                return {
                    time: ts.time,
                    tick: {
                        sum: new x128n(ts.tick.sum),
                        blockStartValue: ts.tick.block_start_value,
                    },
                    spl: {
                        sum: new x128n(ts.spl.sum),
                        blockStartLiquidityValue: ts.spl.block_start_liquidity_value,
                    },
                };
            });
        }
        updateMap(mapIndices = []) {
            return __awaiter(this, void 0, void 0, function* () {
                let knownIndices = Object.keys(this.map);
                knownIndices = knownIndices.concat(mapIndices.map(id => id.toString()));
                const timedCumulative = yield this.michelsonMap.getMultipleValues(knownIndices);
                timedCumulative.forEach((value, key) => {
                    if (value !== undefined) {
                        this.map[key] = {
                            time: value.time,
                            tick: {
                                sum: new x128n(value.tick.sum),
                                blockStartValue: value.tick.block_start_value,
                            },
                            spl: {
                                sum: new x128n(value.spl.sum),
                                blockStartLiquidityValue: value.spl.block_start_liquidity_value,
                            },
                        };
                    }
                });
            });
        }
    }
    quipuswapV3Types.CumulativeBufferMap = CumulativeBufferMap;
    class TickMap {
        constructor(michelsonMap, map) {
            this.michelsonMap = michelsonMap;
            this.map = map;
        }
        static init(michelsonMap, tickIndices = []) {
            return __awaiter(this, void 0, void 0, function* () {
                const tickStates = yield michelsonMap.getMultipleValues(tickIndices);
                const newTicksMap = {};
                tickStates.forEach((value, key) => {
                    if (value !== undefined) {
                        newTicksMap[key] = {
                            prev: new Int(value.prev),
                            next: new Int(value.next),
                            liquidityNet: new Int(value.liquidity_net),
                            secondsOutside: new Nat(value.seconds_outside),
                            tickCumulativeOutside: new Int(value.tick_cumulative_outside),
                            feeGrowthOutside: {
                                x: new x128n(value.fee_growth_outside.x),
                                y: new x128n(value.fee_growth_outside.y),
                            },
                            secondsPerLiquidityOutside: new x128n(value.seconds_per_liquidity_outside),
                            sqrtPrice: new x80n(value.sqrt_price),
                            nPositions: new Nat(value.n_positions),
                        };
                    }
                });
                return new TickMap(michelsonMap, newTicksMap);
            });
        }
        get(key) {
            return this.map[key.toString()];
        }
        getActual(key) {
            return __awaiter(this, void 0, void 0, function* () {
                const st = yield this.michelsonMap.get(key.toString());
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
            });
        }
        updateMap(tickIndices = []) {
            return __awaiter(this, void 0, void 0, function* () {
                let knownTickIndices = Object.keys(this.map);
                knownTickIndices = knownTickIndices.concat(tickIndices.map(id => id.toString()));
                const ticks = yield this.michelsonMap.getMultipleValues(knownTickIndices);
                ticks.forEach((value, key) => {
                    if (value !== undefined) {
                        this.map[key] = {
                            prev: new Int(value.prev),
                            next: new Int(value.next),
                            liquidityNet: new Int(value.liquidity_net),
                            secondsOutside: new Nat(value.seconds_outside),
                            tickCumulativeOutside: new Int(value.tick_cumulative_outside),
                            feeGrowthOutside: {
                                x: new x128n(value.fee_growth_outside.x),
                                y: new x128n(value.fee_growth_outside.y),
                            },
                            secondsPerLiquidityOutside: new x128n(value.seconds_per_liquidity_outside),
                            sqrtPrice: new x80n(value.sqrt_price),
                            nPositions: new Nat(value.n_positions),
                        };
                    }
                });
            });
        }
    }
    quipuswapV3Types.TickMap = TickMap;
    /**
     * @description QuipuswapV3 PositionMap
     * @field map [key: number]: PositionState
     * @field michelsonMap MichelsonMap
     */
    class PositionMap {
        constructor(michelsonMap, map) {
            this.michelsonMap = michelsonMap;
            this.map = map;
        }
        static init(michelsonMap, positionIds) {
            return __awaiter(this, void 0, void 0, function* () {
                const positions = yield michelsonMap.getMultipleValues(positionIds);
                const newPositions = {};
                positions.forEach((value, key) => {
                    if (value !== undefined) {
                        newPositions[key] = {
                            lowerTickIndex: new Int(value.lower_tick_index),
                            upperTickIndex: new Int(value.upper_tick_index),
                            owner: value.owner,
                            liquidity: new Nat(value.liquidity),
                            feeGrowthInsideLast: {
                                x: new x128n(value.fee_growth_inside_last.x),
                                y: new x128n(value.fee_growth_inside_last.y),
                            },
                        };
                    }
                });
                return new PositionMap(michelsonMap, newPositions);
            });
        }
        get(key) {
            return this.map[key.toString()];
        }
        updateMap(positionIds = []) {
            return __awaiter(this, void 0, void 0, function* () {
                let knownPositionIds = Object.keys(this.map);
                knownPositionIds = knownPositionIds.concat(positionIds.map(id => id.toString()));
                const positions = yield this.michelsonMap.getMultipleValues(knownPositionIds);
                positions.forEach((value, key) => {
                    if (value !== undefined) {
                        this.map[key] = {
                            lowerTickIndex: new Int(value.lower_tick_index),
                            upperTickIndex: new Int(value.upper_tick_index),
                            owner: value.owner,
                            liquidity: new Nat(value.liquidity),
                            feeGrowthInsideLast: {
                                x: new x128n(value.fee_growth_inside_last.x),
                                y: new x128n(value.fee_growth_inside_last.y),
                            },
                        };
                    }
                });
            });
        }
    }
    quipuswapV3Types.PositionMap = PositionMap;
    class LadderMap {
        constructor(map) {
            this.map = map;
        }
        get(key) {
            return __awaiter(this, void 0, void 0, function* () {
                return (yield this.map.get({
                    exp: key.exp.toString(),
                    positive: key.positive,
                }));
            });
        }
    }
    quipuswapV3Types.LadderMap = LadderMap;
})(quipuswapV3Types = exports.quipuswapV3Types || (exports.quipuswapV3Types = {}));
