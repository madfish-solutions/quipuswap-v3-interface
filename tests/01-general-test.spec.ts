import { deepEqual, equal, rejects } from "assert";
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
      swapXY: "returnParams",
      swapYX: "returnParams",
      setPosition: "returnParams",
      updatePosition: "returnParams",
      transfer: "returnParams",
      updateOperators: "returnParams",
      increaseObservationCount: "returnParams",
    };
    qsV3 = await new QuipuswapV3(defaultCallSettings).init(tezos, contract!);
  });
  describe("Scenario: returns onlyParams", async () => {
    describe("SwapXY", async () => {
      it("Should fail if amount not nat: 0.1, -0.1, -10, '-10', 'ten'", async () => {
        await rejects(
          qsV3.swapXY(new BigNumber(0.1), "1", new BigNumber(0), alice.pkh),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapXY(new BigNumber(-0.1), "1", new BigNumber(0), alice.pkh),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapXY(new BigNumber(-10), "1", new BigNumber(0), alice.pkh),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapXY(new BigNumber("-10"), "1", new BigNumber(0), alice.pkh),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapXY(new BigNumber("ten"), "1", new BigNumber(0), alice.pkh),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
      });
      it("Should fail if deadline not timestamp", async () => {
        await rejects(
          qsV3.swapXY(
            new BigNumber(10),
            new Date("today").toString(),
            new BigNumber(0),
            alice.pkh,
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid timestamp"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapXY(
            new BigNumber(10),
            new Date("3213232").toString(),
            new BigNumber(0),
            alice.pkh,
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid timestamp"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapXY(new BigNumber(10), "-1.00", new BigNumber(0), alice.pkh),
          (err: Error) => {
            equal(err.message.includes("Invalid timestamp"), true);
            return true;
          },
        );
      });
      it("Should fail if recipient not tezos address", async () => {
        await rejects(
          qsV3.swapXY(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber(0),
            "12321312321",
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid address"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapXY(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber(0),
            "dasdsadasdasdsa",
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid address"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapXY(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber(0),
            "tw1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx",
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid address"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapXY(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber(0),
            "tz3KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx",
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid address"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapXY(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber(0),
            "tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZ1x",
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid address"), true);
            return true;
          },
        );
      });
      it("Should fail if minExpectedAmount not nat", async () => {
        await rejects(
          qsV3.swapXY(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber(-10),
            alice.pkh,
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapXY(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber("-10"),
            alice.pkh,
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapXY(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber("ten"),
            alice.pkh,
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapXY(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber("-0.1"),
            alice.pkh,
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapXY(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber("0.1"),
            alice.pkh,
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapXY(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber(-0.1),
            alice.pkh,
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapXY(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber(0.1),
            alice.pkh,
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
      });
      it("SwapXY: Should return transferParams", async () => {
        const params = await qsV3.swapXY(
          new BigNumber(10),
          new Date("2022-12-12").toString(),
          new BigNumber(9),
          alice.pkh,
        );
        const deadline = Date.parse(new Date("2022-12-12").toString());
        const expectedParams = qsV3.contract.methodsObject
          .x_to_y({
            dx: new BigNumber(10).toFixed(),
            deadline: deadline,
            min_dy: new BigNumber(9).toFixed(),
            to_dy: alice.pkh,
          })
          .toTransferParams();

        deepEqual(params, expectedParams);
      });
    });
    describe("SwapYX", async () => {
      it("Should fail if amount not nat: 0.1, -0.1, -10, '-10', 'ten'", async () => {
        await rejects(
          qsV3.swapYX(new BigNumber(0.1), "1", new BigNumber(0), alice.pkh),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapYX(new BigNumber(-0.1), "1", new BigNumber(0), alice.pkh),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapYX(new BigNumber(-10), "1", new BigNumber(0), alice.pkh),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapYX(new BigNumber("-10"), "1", new BigNumber(0), alice.pkh),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapYX(new BigNumber("ten"), "1", new BigNumber(0), alice.pkh),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
      });
      it("Should fail if deadline not timestamp", async () => {
        await rejects(
          qsV3.swapYX(
            new BigNumber(10),
            new Date("today").toString(),
            new BigNumber(0),
            alice.pkh,
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid timestamp"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapYX(
            new BigNumber(10),
            new Date("3213232").toString(),
            new BigNumber(0),
            alice.pkh,
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid timestamp"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapYX(new BigNumber(10), "-1.00", new BigNumber(0), alice.pkh),
          (err: Error) => {
            equal(err.message.includes("Invalid timestamp"), true);
            return true;
          },
        );
      });
      it("Should fail if recipient not tezos address", async () => {
        await rejects(
          qsV3.swapYX(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber(0),
            "12321312321",
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid address"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapYX(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber(0),
            "dasdsadasdasdsa",
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid address"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapYX(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber(0),
            "tw1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx",
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid address"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapYX(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber(0),
            "tz3KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx",
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid address"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapYX(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber(0),
            "tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZ1x",
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid address"), true);
            return true;
          },
        );
      });
      it("Should fail if minExpectedAmount not nat", async () => {
        await rejects(
          qsV3.swapYX(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber(-10),
            alice.pkh,
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapYX(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber("-10"),
            alice.pkh,
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapYX(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber("ten"),
            alice.pkh,
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapYX(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber("-0.1"),
            alice.pkh,
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapYX(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber("0.1"),
            alice.pkh,
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapYX(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber(-0.1),
            alice.pkh,
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.swapYX(
            new BigNumber(10),
            new Date("2021-12-12").toString(),
            new BigNumber(0.1),
            alice.pkh,
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
      });
      it("Should return transferParams", async () => {
        const params = await qsV3.swapYX(
          new BigNumber(10),
          new Date("2022-12-12").toString(),
          new BigNumber(9),
          alice.pkh,
        );
        const deadline = Date.parse(new Date("2022-12-12").toString());
        const expectedParams = qsV3.contract.methodsObject
          .y_to_x({
            dy: new BigNumber(10).toFixed(),
            deadline: deadline,
            min_dx: new BigNumber(9).toFixed(),
            to_dx: alice.pkh,
          })
          .toTransferParams();

        deepEqual(params, expectedParams);
      });
    });
    describe("setPosition", () => {
      it("Should fail if indexes not int", async () => {
        await rejects(
          qsV3.setPosition(
            new BigNumber(-1.22),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(10),
            "13123123123",
            new BigNumber(10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid int"), true);
            return true;
          },
        );
        await rejects(
          qsV3.setPosition(
            new BigNumber("dsad"),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(10),
            "13123123123",
            new BigNumber(10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid int"), true);
            return true;
          },
        );
        await rejects(
          qsV3.setPosition(
            new BigNumber(-1),
            new BigNumber(5.654),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(10),
            "13123123123",
            new BigNumber(10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid int"), true);
            return true;
          },
        );
        await rejects(
          qsV3.setPosition(
            new BigNumber(-1),
            new BigNumber(-5),
            new BigNumber(-4.323),
            new BigNumber(-10),
            new BigNumber(10),
            "13123123123",
            new BigNumber(10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid int"), true);
            return true;
          },
        );
        await rejects(
          qsV3.setPosition(
            new BigNumber(-1),
            new BigNumber(-5),
            new BigNumber(-4),
            new BigNumber(-10.89898),
            new BigNumber(10),
            "13123123123",
            new BigNumber(10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid int"), true);
            return true;
          },
        );
      });
      it("Should fail if liquidity not nat", async () => {
        await rejects(
          qsV3.setPosition(
            new BigNumber(-1),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(-10),
            "13123123123",
            new BigNumber(10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.setPosition(
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(2.333),
            "13123123123",
            new BigNumber(10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.setPosition(
            new BigNumber(-1),
            new BigNumber(0),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber("desyat'"),
            "13123123123",
            new BigNumber(10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
      });
      it("Should fail if deadline not timestamp", async () => {
        await rejects(
          qsV3.setPosition(
            new BigNumber(-1),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(10),
            "today",
            new BigNumber(10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid timestamp"), true);
            return true;
          },
        );
        await rejects(
          qsV3.setPosition(
            new BigNumber(-1),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(10),
            new Date("ewqeqwewq").toString(),
            new BigNumber(10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid timestamp"), true);
            return true;
          },
        );
      });
      it("Should fail if maximumTokensContributed not nat", async () => {
        await rejects(
          qsV3.setPosition(
            new BigNumber(-1),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(10),
            "13123123123",
            new BigNumber(-10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.setPosition(
            new BigNumber(-1),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(10),
            "13123123123",
            new BigNumber(10),
            new BigNumber("dsadsa"),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.setPosition(
            new BigNumber(-1),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(10),
            "13123123123",
            new BigNumber(10),
            new BigNumber(10.231232),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.setPosition(
            new BigNumber(-1),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(10),
            "13123123123",
            new BigNumber(10),
            new BigNumber(-10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.setPosition(
            new BigNumber(-1),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(10),
            "13123123123",
            new BigNumber(10),
            new BigNumber("dsadsa"),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.setPosition(
            new BigNumber(-1),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(-10),
            new BigNumber(10),
            "13123123123",
            new BigNumber(10),
            new BigNumber(10.231232),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
      });
      it("Should return transferParams", async () => {
        const transferParams = await qsV3.setPosition(
          new BigNumber(-1),
          new BigNumber(10),
          new BigNumber(-10),
          new BigNumber(10),
          new BigNumber(10),
          new Date("2023-01-01").toString(),
          new BigNumber(10),
          new BigNumber(10),
        );
        const expectedTransferParams = qsV3.contract.methods
          .set_position(
            new BigNumber(-1).toFixed(),
            new BigNumber(10).toFixed(),
            new BigNumber(-10).toFixed(),
            new BigNumber(10).toFixed(),
            new BigNumber(10).toFixed(),
            Date.parse(new Date("2023-01-01").toString()).toString(),
            new BigNumber(10).toFixed(),
            new BigNumber(10).toFixed(),
          )
          .toTransferParams();
        deepEqual(transferParams, expectedTransferParams);
      });
    });
    describe("updatePosition", () => {
      it("Should fail if position_id not nat", async () => {
        await rejects(
          qsV3.updatePosition(
            new BigNumber(-1),
            new BigNumber(10),
            alice.pkh,
            alice.pkh,
            "12321312321",
            new BigNumber(10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.updatePosition(
            new BigNumber("-1"),
            new BigNumber(10),
            alice.pkh,
            alice.pkh,
            "12321312321",
            new BigNumber(10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.updatePosition(
            new BigNumber(1.213213),
            new BigNumber(10),
            alice.pkh,
            alice.pkh,
            "12321312321",
            new BigNumber(10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.updatePosition(
            new BigNumber("ddasdasd"),
            new BigNumber(10),
            alice.pkh,
            alice.pkh,
            "12321312321",
            new BigNumber(10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
      });
      it("Should fail if liquidity_delta not int", async () => {
        await rejects(
          qsV3.updatePosition(
            new BigNumber(1),
            new BigNumber(-10.231231),
            alice.pkh,
            alice.pkh,
            "12321312321",
            new BigNumber(10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid int"), true);
            return true;
          },
        );
        await rejects(
          qsV3.updatePosition(
            new BigNumber(1),
            new BigNumber("1.2312"),
            alice.pkh,
            alice.pkh,
            "12321312321",
            new BigNumber(10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid int"), true);
            return true;
          },
        );
        await rejects(
          qsV3.updatePosition(
            new BigNumber(1),
            new BigNumber("dasdsa"),
            alice.pkh,
            alice.pkh,
            "12321312321",
            new BigNumber(10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid int"), true);
            return true;
          },
        );
      });
      it("Should fail if maximum_tokens_contributed not nat", async () => {
        await rejects(
          qsV3.updatePosition(
            new BigNumber(1),
            new BigNumber(-10),
            alice.pkh,
            alice.pkh,
            "12321312321",
            new BigNumber(-10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.updatePosition(
            new BigNumber(1),
            new BigNumber(-10),
            alice.pkh,
            alice.pkh,
            "12321312321",
            new BigNumber("1.2312"),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.updatePosition(
            new BigNumber(1),
            new BigNumber(-10),
            alice.pkh,
            alice.pkh,
            "12321312321",
            new BigNumber(10),
            new BigNumber(-10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.updatePosition(
            new BigNumber(1),
            new BigNumber(-10),
            alice.pkh,
            alice.pkh,
            "12321312321",
            new BigNumber(10),
            new BigNumber(2.31232),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
      });
      it("Should fail if deadline not timestamp", async () => {
        await rejects(
          qsV3.updatePosition(
            new BigNumber(1),
            new BigNumber(-10),
            alice.pkh,
            alice.pkh,
            new Date("today").toString(),
            new BigNumber(10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid timestamp"), true);
            return true;
          },
        );
      });
      it("Should fail if recipient not tezos address", async () => {
        await rejects(
          qsV3.updatePosition(
            new BigNumber(1),
            new BigNumber(-10),
            "tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx2",
            alice.pkh,
            "12321312321",
            new BigNumber(10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid address"), true);
            return true;
          },
        );
        await rejects(
          qsV3.updatePosition(
            new BigNumber(1),
            new BigNumber(-10),
            "tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx2",
            alice.pkh,
            "12321312321",
            new BigNumber(10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid address"), true);
            return true;
          },
        );
        await rejects(
          qsV3.updatePosition(
            new BigNumber(1),
            new BigNumber(-10),

            alice.pkh,
            "tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSxss2",
            "12321312321",
            new BigNumber(10),
            new BigNumber(10),
          ),
          (err: Error) => {
            equal(err.message.includes("Invalid address"), true);
            return true;
          },
        );
      });
      it("Should return transferParams", async () => {
        const params = await qsV3.updatePosition(
          new BigNumber(1),
          new BigNumber(-10),
          alice.pkh,
          alice.pkh,
          "12321312321",
          new BigNumber(10),
          new BigNumber(10),
        );

        const expectedParams = qsV3.contract.methods
          .update_position(
            new BigNumber(1).toFixed(),
            new BigNumber(-10).toFixed(),
            alice.pkh,
            alice.pkh,
            "12321312321",
            new BigNumber(10).toFixed(),
            new BigNumber(10).toFixed(),
          )
          .toTransferParams();

        deepEqual(params, expectedParams);
      });
    });
    describe("FA2 transfer", () => {
      it("Should fail if from not tezos address", async () => {
        await rejects(
          qsV3.transfer([
            {
              from_: "tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8Lhssss",
              txs: [
                {
                  to_: alice.pkh,
                  token_id: new BigNumber(0),
                  amount: new BigNumber(10),
                },
              ],
            },
          ]),
          (err: Error) => {
            equal(err.message.includes("Invalid address"), true);
            return true;
          },
        );
        await rejects(
          qsV3.transfer([
            {
              from_: alice.pkh,
              txs: [
                {
                  to_: "tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8Lhssss",
                  token_id: new BigNumber(0),
                  amount: new BigNumber(10),
                },
              ],
            },
          ]),
          (err: Error) => {
            equal(err.message.includes("Invalid address"), true);
            return true;
          },
        );
      });
      it("Should fail if amount and token id not nat", async () => {
        await rejects(
          qsV3.transfer([
            {
              from_: alice.pkh,
              txs: [
                {
                  to_: alice.pkh,
                  token_id: new BigNumber(0),
                  amount: new BigNumber(-10),
                },
              ],
            },
          ]),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.transfer([
            {
              from_: alice.pkh,
              txs: [
                {
                  to_: alice.pkh,
                  token_id: new BigNumber(0),
                  amount: new BigNumber(10.223232),
                },
              ],
            },
          ]),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.transfer([
            {
              from_: alice.pkh,
              txs: [
                {
                  to_: alice.pkh,
                  token_id: new BigNumber(-10),
                  amount: new BigNumber(10),
                },
              ],
            },
          ]),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.transfer([
            {
              from_: alice.pkh,
              txs: [
                {
                  to_: alice.pkh,
                  token_id: new BigNumber(2.444),
                  amount: new BigNumber(10),
                },
              ],
            },
          ]),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
      });
      it("Should return transferParams", async () => {
        const params = await qsV3.transfer([
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
          {
            from_: alice.pkh,
            txs: [
              {
                to_: alice.pkh,
                token_id: new BigNumber(2),
                amount: new BigNumber(10),
              },
              {
                to_: alice.pkh,
                token_id: new BigNumber(3),
                amount: new BigNumber(999),
              },
            ],
          },
        ]);

        const expectedParams = qsV3.contract.methods
          .transfer([
            {
              from_: alice.pkh,
              txs: [
                {
                  to_: alice.pkh,
                  token_id: new BigNumber(0).toFixed(),
                  amount: new BigNumber(10).toFixed(),
                },
                {
                  to_: alice.pkh,
                  token_id: new BigNumber(1).toFixed(),
                  amount: new BigNumber(999).toFixed(),
                },
              ],
            },
            {
              from_: alice.pkh,
              txs: [
                {
                  to_: alice.pkh,
                  token_id: new BigNumber(2).toFixed(),
                  amount: new BigNumber(10).toFixed(),
                },
                {
                  to_: alice.pkh,
                  token_id: new BigNumber(3).toFixed(),
                  amount: new BigNumber(999).toFixed(),
                },
              ],
            },
          ])
          .toTransferParams();

        deepEqual(params, expectedParams);
      });
    });
    describe("FA2 updateOperators", () => {
      it("Should fail if owner not tezos address", async () => {
        await rejects(
          qsV3.updateOperators([
            {
              add_operator: {
                owner: "tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8Lhssss",
                operator: alice.pkh,
                token_id: new BigNumber(0),
              },
            },
          ]),
          (err: Error) => {
            equal(err.message.includes("Invalid address"), true);
            return true;
          },
        );
        await rejects(
          qsV3.updateOperators([
            {
              add_operator: {
                owner: alice.pkh,
                operator: "tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8Lhssss",
                token_id: new BigNumber(0),
              },
            },
          ]),
          (err: Error) => {
            equal(err.message.includes("Invalid address"), true);
            return true;
          },
        );
      });
      it("Should fail if token id not nat", async () => {
        await rejects(
          qsV3.updateOperators([
            {
              add_operator: {
                owner: alice.pkh,
                operator: alice.pkh,
                token_id: new BigNumber(-10),
              },
            },
          ]),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
        await rejects(
          qsV3.updateOperators([
            {
              add_operator: {
                owner: alice.pkh,
                operator: alice.pkh,
                token_id: new BigNumber(2.444),
              },
            },
          ]),
          (err: Error) => {
            equal(err.message.includes("Invalid nat"), true);
            return true;
          },
        );
      });
      it("Should return updateOperatorsParams", async () => {
        const params = await qsV3.updateOperators([
          {
            add_operator: {
              owner: alice.pkh,
              operator: alice.pkh,
              token_id: new BigNumber(0),
            },
          },
          {
            add_operator: {
              owner: alice.pkh,
              operator: alice.pkh,
              token_id: new BigNumber(1),
            },
          },
        ]);

        const expectedParams = qsV3.contract.methods
          .update_operators([
            {
              add_operator: {
                owner: alice.pkh,
                operator: alice.pkh,
                token_id: new BigNumber(0).toFixed(),
              },
            },
            {
              add_operator: {
                owner: alice.pkh,
                operator: alice.pkh,
                token_id: new BigNumber(1).toFixed(),
              },
            },
          ])
          .toTransferParams();

        deepEqual(params, expectedParams);
      });
    });
  });
});
