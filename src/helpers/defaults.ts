import { CallSettings } from "../types";

export const defaultCallSettings: CallSettings = {
  swapXY: "returnConfirmatedOperation",
  swapYX: "returnConfirmatedOperation",
  setPosition: "returnConfirmatedOperation",
  updatePosition: "returnConfirmatedOperation",
  transfer: "returnConfirmatedOperation",
  updateOperators: "returnConfirmatedOperation",
  increaseObservationCount: "returnConfirmatedOperation",
};
