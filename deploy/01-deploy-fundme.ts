import { network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { networkConfig } from "../helper-hardhat-config";
import { verify } from "../utils/verify";

module.exports = async ({
  getNamedAccounts,
  deployments
}: HardhatRuntimeEnvironment) => {
  const { deployer } = await getNamedAccounts(); // get the named account from hardhat.config.ts
  const { deploy, log, get } = deployments;
  const chainId = network.config.chainId!;

  let ethPriceFeedAddress;

  if (chainId === 31337) {
    const ethUsdAggregator = await get("MockV3Aggregator");
    ethPriceFeedAddress = ethUsdAggregator.address;
  } else {
    // @ts-ignore
    ethPriceFeedAddress = networkConfig[network.name].ethPriceFeedAddress;
  }

  // deploy contract
  const arguments = [ethPriceFeedAddress];
  const fundMeContract = await deploy("FundMe", {
    from: deployer,
    args: arguments,
    log: true, // log out something like deploying "MockV3Aggregator" (tx: 0x627db34b2edc927a5ed9fde5a0a1e76d6062adc9760478f2e749e1588623d996)...: deployed at 0x5FbDB2315678afecb367f032d93F642f64180aa3 with 569635 gas
    // @ts-ignore
    waitConfirmations: networkConfig[network.name].blockConfirmations || 0
  });

  if (chainId !== 31337 && process.env.ETHERSCAN_API_KEY) {
    await verify(fundMeContract.address, args);
  }

  log("-------------------------------------------------------");
};

module.exports.tags = ["all", "fundme"];
