import { OriginationOperation, TezosToolkit } from "@taquito/taquito";
import { confirmOperation } from "../../src/helpers/confirmation";

const dotenv = require("dotenv");
import { resolve } from "path";
dotenv.config({ path: resolve(__dirname, "..", "..", ".env") });
dotenv.config();

const fs = require("fs");

export const migrate = async (
  tezos: TezosToolkit,
  contract: string,
  storage: any,
  network: string,
) => {
  try {
    const artifacts: any = JSON.parse(
      fs
        .readFileSync(`${process.env.CONTRACTS_DIR}/${contract}.json`)
        .toString(),
    );
    const operation: OriginationOperation = await tezos.contract
      .originate({
        code: artifacts.michelson,
        storage: storage,
        fee: 1000000,
        gasLimit: 1040000,
        // storageLimit: 20000,
      })
      .catch(e => {
        throw e;
      });

    await confirmOperation(
      tezos,
      operation.hash,
      Number(process.env.CONFIRMATION_TIMEOUT),
      Number(process.env.SYNC_INTERVAL),
    );

    artifacts.networks[network] = { [contract]: operation.contractAddress };

    fs.writeFileSync(
      `${process.env.CONTRACTS_DIR}/${contract}.json`,
      JSON.stringify(artifacts, null, 2),
    );

    return operation.contractAddress;
  } catch (e) {
    console.error(e);
  }
};
