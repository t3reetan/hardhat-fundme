import { assert } from "chai";
import { ethers, getNamedAccounts, network } from "hardhat";
import { FundMe } from "../../typechain-types";

const chainId = network.config.chainId!;

// chain id of 31337 is for the development chains of "local host" or "hardhat"
chainId === 31337
  ? describe.skip
  : describe("FundMe", () => {
      let fundMeContract: FundMe, deployer: string;
      let sendValue = ethers.utils.parseEther("1");

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        fundMeContract = await ethers.getContract("FundMe", deployer);
      });

      it("should be able to fund and withdraw", async () => {
        // const txResponse = await fundMeContract.fund({ value: sendValue });
        // const txReceipt = await txResponse.wait(1);
        // const totalGasCost = txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice);

        // const balAfterFunding = await ethers.provider.getBalance(
        //   fundMeContract.address
        // );
        // assert.equal(balAfterFunding.add(totalGasCost), sendValue);

        // await fundMeContract.withdraw();
        // const endingBal = await fundMeContract.provider.getBalance(
        //   fundMeContract.address // everytime u are reading/writing to the bc, it is n async call
        // );
        // assert.equal(endingBal.toString(), "0");
        await fundMeContract.fund({ value: sendValue });

        const tx = await fundMeContract.withdraw();
        await tx.wait(1);

        const endingBalance = await fundMeContract.provider.getBalance(
          fundMeContract.address
        );

        assert.equal(endingBalance.toString(), "0");
      });
    });
