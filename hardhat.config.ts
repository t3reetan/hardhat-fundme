import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [{ version: "0.8.8" }, { version: "0.6.6" }]
  },
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_RPC_URL,
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 4
    }
  },
  namedAccounts: {
    deployer: {
      default: 0 // this means the 0th account is named "deployer"
      // 4: 1, // e.g. on Rinkeby, we want the 1st account to be named deployer
      // 31337: 2, // // e.g. on the Hardhat network, we want the 2nd account to be named deployer
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    token: "ETH",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY
  }
};

export default config;
