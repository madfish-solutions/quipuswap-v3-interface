import yargs from "yargs";

yargs
  .command(
    "compile [format] [contract] [contracts_dir] [output_dir] [ligo_version]",
    "compiles the contract",
    {
      format: {
        description: "fromat of output file",
        alias: "f",
        type: "string",
      },
      contracts_list: {
        description: "the contract to compile",
        alias: "c",
        type: "array",
      },
      contracts_dir: {
        description: "contracts directory",
        alias: "p",
        type: "string",
      },
      output_dir: {
        description: "output directory",
        alias: "o",
        type: "string",
      },
      ligo_version: {
        description: "ligo version",
        alias: "v",
        type: "string",
      },
    },
  )
  .help()
  .strictCommands()
  .demandCommand(1)
  .alias("help", "h").argv;
