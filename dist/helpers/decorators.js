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
exports.extendCallQS = exports.sendAndConfirmation = exports.send = exports.paramsOnly = void 0;
const types_1 = require("../types");
const utils_1 = require("../utils");
const confirmation_1 = require("./confirmation");
function paramsOnly(contract, callback, ...callParams) {
    try {
        const transferParams = callback(contract, ...callParams);
        return transferParams;
    }
    catch (error) {
        console.log(error);
    }
}
exports.paramsOnly = paramsOnly;
function send(contract, tezos, callback, ...callParams) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transferParams = callback(contract, ...callParams);
            const operation = yield (0, utils_1.sendBatch)(tezos, [transferParams]);
            return operation;
        }
        catch (error) {
            throw error;
        }
    });
}
exports.send = send;
function sendAndConfirmation(contract, tezos, callback, SYNC_INTERVAL, CONFIRM_TIMEOUT, ...callParams) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transferParams = callback(contract, ...callParams);
            const operation = yield (0, utils_1.sendBatch)(tezos, [transferParams]);
            yield (0, confirmation_1.confirmOperation)(tezos, operation.opHash, CONFIRM_TIMEOUT, SYNC_INTERVAL);
            return operation;
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.sendAndConfirmation = sendAndConfirmation;
function extendCallQS(target, propertyKey, descriptor) {
    const f = descriptor.value;
    descriptor.value = function (...args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { callParams, callback } = yield f(...args);
            switch (this.callSettings[propertyKey]) {
                case types_1.CallMode.returnOperation:
                    return send(this.contract, this.tezos, callback, ...callParams);
                case types_1.CallMode.returnConfirmatedOperation:
                    return sendAndConfirmation(this.contract, this.tezos, callback, this.syncInterval, this.confirmtaionTimeout, ...callParams);
                default:
                    return paramsOnly(this.contract, callback, ...callParams);
            }
        });
    };
    Object.defineProperty(target, propertyKey, descriptor);
}
exports.extendCallQS = extendCallQS;
