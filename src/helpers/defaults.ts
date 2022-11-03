import { CallMode, CallSettings } from "../types";

export const defaultCallSettings: CallSettings = {
  swapXY: CallMode.returnConfirmatedOperation,
  swapYX: CallMode.returnConfirmatedOperation,
  setPosition: CallMode.returnConfirmatedOperation,
  updatePosition: CallMode.returnConfirmatedOperation,
  transfer: CallMode.returnConfirmatedOperation,
  updateOperators: CallMode.returnConfirmatedOperation,
  increaseObservationCount: CallMode.returnConfirmatedOperation,
};
