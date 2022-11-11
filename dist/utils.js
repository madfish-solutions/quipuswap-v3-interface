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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBatch = exports.batchify = exports.Timestamp = exports.Int = exports.Nat = exports.Address = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const { validateAddress } = require("@taquito/utils");
/**
 * @category Utils
 */
class AddressPrimitive {
    constructor(address) {
        if (validateAddress(address) != 3) {
            throw new Error(`Invalid address: ${address}`);
        }
        this._address = address.toString();
    }
    toString() {
        return this._address;
    }
}
/**
 * @category Utils
 */
class Address extends AddressPrimitive {
    constructor(address) {
        super(address);
    }
}
exports.Address = Address;
class Precision {
    static fromPrecision(precision) {
        return new bignumber_js_1.default(10).pow(precision);
    }
}
/**
 * @category Utils
 * @description Utility class to represent a Tezos Nat type which is a BigNumber
 * @example
 * const nat = new Nat('100')
 * nat.toNumber() // 100
 * nat.toString() // '100'
 * nat.plus(1).toString() // '101'
 * nat.toPow(2).toString() // '10000'
 * nat.fromPow(2).toString() // '1'
 */
class Nat extends bignumber_js_1.default {
    // _nat: BigNumber;
    constructor(number) {
        number = new bignumber_js_1.default(number);
        if (number < new bignumber_js_1.default(0) || !number.isInteger() || number.isNaN()) {
            throw new Error(`Invalid nat: ${number.toString()}`);
        }
        super(number);
    }
    fromPow(precision, roundingMode = bignumber_js_1.default.ROUND_DOWN) {
        return this.dividedBy(new bignumber_js_1.default(10).pow(precision)).integerValue(roundingMode);
    }
    toPow(precision, roundingMode = bignumber_js_1.default.ROUND_DOWN) {
        return this.multipliedBy(new bignumber_js_1.default(10).pow(precision)).integerValue(roundingMode);
    }
}
exports.Nat = Nat;
/**
 * @category Utils
 * @description Utility class to represent a Tezos Int type which is a BigNumber
 * @example
 * const int = new Int('new BigNumber(-100)')
 * int.toString() // '-100'
 * int.toFixed() // '-100'
 * int.fromPrecision(6) // BigNumber(-0.0001)
 * int.toPrecision(6) // BigNumber(-1000000)
 */
class Int extends bignumber_js_1.default {
    constructor(number) {
        number = new bignumber_js_1.default(number);
        if (!number.isInteger() || number.isNaN()) {
            throw new Error(`Invalid int: ${number}`);
        }
        super(number);
    }
    fromPow(precision, roundingMode = bignumber_js_1.default.ROUND_DOWN) {
        return this.dividedBy(new bignumber_js_1.default(10).pow(precision)).integerValue(roundingMode);
    }
    toPow(precision, roundingMode = bignumber_js_1.default.ROUND_DOWN) {
        return this.multipliedBy(new bignumber_js_1.default(10).pow(precision)).integerValue(roundingMode);
    }
}
exports.Int = Int;
class Timestamp {
    constructor(timestamp) {
        let newTimestamp = Number(timestamp);
        if (isNaN(newTimestamp)) {
            newTimestamp = Math.round(Date.parse(timestamp) / 1000);
            if (isNaN(newTimestamp)) {
                throw new Error(`Invalid timestamp: ${timestamp}`);
            }
        }
        else if (newTimestamp < 0) {
            throw new Error(`Invalid timestamp: ${timestamp}`);
        }
        this._timestamp = newTimestamp.toString();
    }
    toString() {
        return this._timestamp;
    }
}
exports.Timestamp = Timestamp;
/**
 * @category Utils
 */
function batchify(batch, transfers) {
    for (const tParams of transfers) {
        batch.withTransfer(tParams);
    }
    return batch;
}
exports.batchify = batchify;
/** @category Utils
 * @description Utility function to send a batch of operations
 * @example
 * const batch = await sendBatch(tezos, [transferParams])
 */
const sendBatch = (tezos, operationParams) => __awaiter(void 0, void 0, void 0, function* () { return batchify(tezos.wallet.batch([]), operationParams).send(); });
exports.sendBatch = sendBatch;
