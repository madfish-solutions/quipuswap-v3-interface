import { equal, rejects } from "assert";

import { BigNumber } from "bignumber.js";
import { QuipuswapV3 } from "./../src";
import { CallSettings } from "./../src/types";
import { migrate } from "./scripts/helpers";
import { dexStorage } from "./storage/dexStorage";
import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";
import accounts from "./scripts/sandbox/accounts";
import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(__dirname, "..", "..", ".env") });
dotenv.config();

const alice = accounts.alice;
describe("Tests", async () => {
  let qsV3: QuipuswapV3;
  let tezos: TezosToolkit;
  before(async () => {
    const signerAlice = new InMemorySigner(alice.sk);
    tezos = new TezosToolkit(process.env.RPC!);
    tezos.setSignerProvider(signerAlice);

    const contract = await migrate(
      tezos,
      "dex_core",
      dexStorage,
      "development",
    );
    const defaultCallSettings: CallSettings = {
      swapXY: "returnOperation",
      swapYX: "returnOperation",
      setPosition: "returnOperation",
      updatePosition: "returnOperation",
      transfer: "returnOperation",
      updateOperators: "returnOperation",
      increaseObservationCount: "returnOperation",
    };
    qsV3 = await new QuipuswapV3(defaultCallSettings).init(tezos, contract!);
  });
  describe("Scenario: returns returnOperation", async () => {
    describe("SwapXY", async () => {
      it("SwapXY: Should fail with internal fail", async () => {
        await rejects(
          qsV3.swapXY(
            new BigNumber(10),
            new Date("2022-12-12").toString(),
            new BigNumber(9),
            alice.pkh,
          ),
          (err: Error) => {
            equal(err.message, "321");
            return true;
          },
        );
      });
    });
    describe("SwapYX", async () => {
      it("SwapYX: Should fail with internal fail", async () => {
        await rejects(
          qsV3.swapYX(
            new BigNumber(10),
            new Date("2022-12-12").toString(),
            new BigNumber(9),
            alice.pkh,
          ),
          (err: Error) => {
            equal(err.message, "321");
            return true;
          },
        );
      });
    });
    describe("SetPosition", async () => {
      it("SetPosition: Should fail with internal fail", async () => {
        await rejects(
          qsV3.setPosition(
            new BigNumber(-1),
            new BigNumber(10),
            new BigNumber(-10),
            new BigNumber(10),
            new BigNumber(10),
            new Date("2023-01-01").toString(),
            new BigNumber(10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message, "321");
            return true;
          },
        );
      });
    });
    describe("UpdatePosition", async () => {
      it("UpdatePosition: Should fail with internal fail", async () => {
        await rejects(
          qsV3.updatePosition(
            new BigNumber(1),
            new BigNumber(-10),
            alice.pkh,
            alice.pkh,
            "12321312321",
            new BigNumber(10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message, "321");
            return true;
          },
        );
      });
    });
    describe("Transfer", async () => {
      it("Transfer: Should fail with internal fail", async () => {
        await rejects(
          qsV3.transfer([
            {
              from_: alice.pkh,
              txs: [
                {
                  to_: alice.pkh,
                  token_id: new BigNumber(0),
                  amount: new BigNumber(10),
                },
                {
                  to_: alice.pkh,
                  token_id: new BigNumber(1),
                  amount: new BigNumber(999),
                },
              ],
            },
          ]),
          (err: Error) => {
            equal(err.message, "321");
            return true;
          },
        );
      });
    });
    describe("UpdateOperators", async () => {
      it("UpdateOperators: Should fail with internal fail", async () => {
        await rejects(
          qsV3.updateOperators([
            {
              add_operator: {
                owner: alice.pkh,
                operator: alice.pkh,
                token_id: new BigNumber(0),
              },
            },
          ]),
          (err: Error) => {
            equal(err.message, "321");
            return true;
          },
        );
      });
    });
  });
});
