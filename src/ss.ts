import BigNumber from "bignumber.js";
import { number, string } from "yargs";
import { Address } from "./utils";
const { validateAddress } = require("@taquito/utils");
// const s = new Address("tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb");
console.log(validateAddress("tz2VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb"));
