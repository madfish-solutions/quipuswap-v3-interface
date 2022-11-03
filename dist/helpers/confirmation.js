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
exports.getOriginatedContractAddress = exports.findOperation = exports.confirmOperation = void 0;
const taquito_1 = require("@taquito/taquito");
function confirmOperation(tezos, opHash, CONFIRM_TIMEOUT, SYNC_INTERVAL, { initializedAt, fromBlockLevel, signal } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!initializedAt) {
            initializedAt = Date.now();
        }
        if (initializedAt && initializedAt + CONFIRM_TIMEOUT < Date.now()) {
            throw new Error("Confirmation polling timed out");
        }
        const startedAt = Date.now();
        let currentBlockLevel;
        try {
            const currentBlock = yield tezos.rpc.getBlock();
            currentBlockLevel = currentBlock.header.level;
            for (let i = fromBlockLevel !== null && fromBlockLevel !== void 0 ? fromBlockLevel : currentBlockLevel; i <= currentBlockLevel; i++) {
                const block = i === currentBlockLevel
                    ? currentBlock
                    : yield tezos.rpc.getBlock({ block: i });
                const opEntry = yield findOperation(block, opHash);
                if (opEntry) {
                    return opEntry;
                }
            }
        }
        catch (err) {
            if (process.env.NETWORK === "development") {
                console.error(err);
            }
        }
        if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
            throw new Error("Cancelled");
        }
        const timeToWait = Math.max(startedAt + SYNC_INTERVAL - Date.now(), 0);
        yield new Promise(r => setTimeout(r, timeToWait));
        return confirmOperation(tezos, opHash, CONFIRM_TIMEOUT, SYNC_INTERVAL, {
            initializedAt,
            fromBlockLevel: currentBlockLevel ? currentBlockLevel + 1 : fromBlockLevel,
            signal,
        });
    });
}
exports.confirmOperation = confirmOperation;
function findOperation(block, opHash) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 3; i >= 0; i--) {
            for (const op of block.operations[i]) {
                if (op.hash === opHash) {
                    return op;
                }
            }
        }
        return null;
    });
}
exports.findOperation = findOperation;
function getOriginatedContractAddress(opEntry) {
    var _a, _b, _c, _d;
    const results = Array.isArray(opEntry.contents) ? opEntry.contents : [opEntry.contents];
    const originationOp = results.find(op => op.kind === taquito_1.OpKind.ORIGINATION);
    return ((_d = (_c = (_b = (_a = originationOp === null || originationOp === void 0 ? void 0 : originationOp.metadata) === null || _a === void 0 ? void 0 : _a.operation_result) === null || _b === void 0 ? void 0 : _b.originated_contracts) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : null);
}
exports.getOriginatedContractAddress = getOriginatedContractAddress;
