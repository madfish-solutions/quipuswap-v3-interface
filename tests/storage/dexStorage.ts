import { MichelsonMap } from "@taquito/michelson-encoder";

import { Nat, quipuswapV3Types as qsTypes } from "../../src/types";
import BigNumber from "bignumber.js";

const cumulativesBuffer: qsTypes.TimedCumulativesBuffer = {
  map: new qsTypes.CumulativeBufferMap(MichelsonMap.fromLiteral({}), {}),
  first: new Nat(0),
  last: new Nat(0),
  reservedLength: new Nat(0),
};

const constants: qsTypes.Constants = {
  fee_bps: new BigNumber(0),
  ctez_burn_fee_bps: new BigNumber(0),
  token_x: { fa12: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb" },
  token_y: { fa12: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb" },
  tick_spacing: new BigNumber(0),
} as unknown as qsTypes.Constants;

const balanceNatX128 = {
  x: BigNumber(0) as unknown as qsTypes.x128n,
  y: BigNumber(0) as unknown as qsTypes.x128n,
} as qsTypes.BalanceNatX128;

export const dexStorage: qsTypes.Storage = {
  liquidity: new BigNumber(0),
  sqrt_price: new BigNumber(0),
  cur_tick_index: new BigNumber(0),
  cur_tick_witness: BigNumber(0),
  fee_growth: balanceNatX128,
  ticks: MichelsonMap.fromLiteral({}),
  positions: MichelsonMap.fromLiteral({}),
  cumulatives_buffer: cumulativesBuffer,
  metadata: MichelsonMap.fromLiteral({}),
  new_position_id: new BigNumber(0),
  operators: MichelsonMap.fromLiteral({}),
  constants: constants,
  ladder: MichelsonMap.fromLiteral({}),
} as unknown as qsTypes.Storage;
