import { run } from "hardhat";

export const verify = async (contractAddress: string, args: any[]) => {
  console.log("Verifying contract...");

  // wrap run() in a try-catch block to check for errors, especially whether the contract is already verified
  try {
    // run() allows us to access and run functions in the hardhat CLI
    // do yarn hardhat verify --help or go the the github for the verify function to see more
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (err) {
    // @ts-ignore
    if (err.message.toLowerCase().includes("already verified")) {
      console.log("Contract already verified!");
    } else {
      console.log(err);
    }
  }
};
