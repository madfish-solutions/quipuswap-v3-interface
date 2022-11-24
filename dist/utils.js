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
exports.entries = exports.isMonotonic = exports.actualLength = exports.isInRangeNat = exports.isInRange = exports.initTimedCumulativesBuffer = exports.initTimedCumulatives = exports.sendBatch = exports.batchify = exports.Timestamp = exports.Address = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const types_1 = require("./types");
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
const initTimedCumulatives = (time) => {
    return {
        time: time,
        tick: {
            sum: new types_1.quipuswapV3Types.x128(0),
            blockStartValue: new types_1.Int(0),
        },
        spl: {
            sum: new types_1.quipuswapV3Types.x128(0),
            blockStartLiquidityValue: new types_1.Int(0),
        },
    };
};
exports.initTimedCumulatives = initTimedCumulatives;
const initTimedCumulativesBuffer = (extraReservedSlots) => __awaiter(void 0, void 0, void 0, function* () {
    return {
        map: types_1.quipuswapV3Types.CumulativeBufferMap.initCustom(extraReservedSlots.toNumber()),
        first: new types_1.Int(0),
        last: new types_1.Int(0),
        reservedLength: new types_1.Nat(extraReservedSlots.toNumber() + 1),
    };
});
exports.initTimedCumulativesBuffer = initTimedCumulativesBuffer;
/**
 * @x `isInRange` y $ (down, up)@ checks that @x@ is in the range @[y - down, y + up]@.
 */
const isInRange = (x, y, marginDown, marginUp) => {
    return x.isGreaterThanOrEqualTo(y.minus(marginDown)) &&
        x.isLessThanOrEqualTo(y.plus(marginUp))
        ? true
        : false;
};
exports.isInRange = isInRange;
/**
 * -Similar to `isInRange`, but checks that the lower bound cannot be less than 0.
 */
const isInRangeNat = (x, y, marginDown, marginUp) => {
    const upperBound = y.plus(marginUp);
    const lowerBound = marginDown.isLessThanOrEqualTo(y)
        ? y.minus(marginDown)
        : new bignumber_js_1.default(0);
    return x.isGreaterThanOrEqualTo(lowerBound) &&
        x.isLessThanOrEqualTo(upperBound)
        ? true
        : false;
};
exports.isInRangeNat = isInRangeNat;
function actualLength(buffer) {
    return buffer.last.minus(buffer.first).plus(1);
}
exports.actualLength = actualLength;
/**
 * Check that values grow monothonically (non-strictly).
 */
function isMonotonic(l) {
    return l.every((v, i) => i === 0 || l[i - 1] <= v);
}
exports.isMonotonic = isMonotonic;
/**
 * -- All records.
 */
function entries(storage) {
    const buffer = storage.cumulativesBuffer;
    const map = buffer.map.map;
    return Object.entries(map)
        .filter(([k, _]) => buffer.first.lte(new bignumber_js_1.default(k)) && new bignumber_js_1.default(k).lte(buffer.last))
        .map(([_, v]) => v);
}
exports.entries = entries;
