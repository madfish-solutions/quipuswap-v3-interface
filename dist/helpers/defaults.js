"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultCallSettings = void 0;
const types_1 = require("../types");
exports.defaultCallSettings = {
    swapXY: types_1.CallMode.returnConfirmatedOperation,
    swapYX: types_1.CallMode.returnConfirmatedOperation,
    setPosition: types_1.CallMode.returnConfirmatedOperation,
    updatePosition: types_1.CallMode.returnConfirmatedOperation,
    transfer: types_1.CallMode.returnConfirmatedOperation,
    updateOperators: types_1.CallMode.returnConfirmatedOperation,
    increaseObservationCount: types_1.CallMode.returnConfirmatedOperation,
};
