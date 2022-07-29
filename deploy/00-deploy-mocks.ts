// 00 because this is the pre-deploy stuff

import { network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DECIMALS, INITIAL_PRICE } from "../helper-hardhat-config";

module.exports = async ({
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) => {
  const { deployer } = await getNamedAccounts(); // get the named account from hardhat.config.ts
  const { deploy, log } = deployments;
  const chainId = network.config.chainId!;

  if (chainId === 31337) {
    console.log("Local network detected. Deploying mocks.");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_PRICE], // for our simulated eth/usd
    });

    log("Mock deployed.");
    log("-----------------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
