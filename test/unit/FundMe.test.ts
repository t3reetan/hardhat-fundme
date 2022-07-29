import { assert, expect } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { FundMe, MockV3Aggregator } from "../../typechain-types";

const chainId = network.config.chainId!;

// chain id of 31337 is for the development chains of "local host" or "hardhat"
chainId !== 31337
  ? describe.skip
  : describe("FundMe", () => {
      let fundMeContract: FundMe,
        mockv3aggregator: MockV3Aggregator,
        deployer: string;
      let sendValue = ethers.utils.parseEther("1"); // same as 1000000000000000000gwei aka 1ETH

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;

        // deploy fundme contract using hardhat-deploy
        // what fixture does is basically allowing us to run our entire deploy folder
        await deployments.fixture(["all"]);

        // gets the latest deployed instance of the FundMe contract and tells ether which account to connect to this FundMe contract instance
        fundMeContract = await ethers.getContract("FundMe", deployer);

        // deploy mockv3aggregator coz we're testing locally, no chainlink price feed
        mockv3aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("constructor", () => {
        it("sets the correct aggregator address", async () => {
          const response = await fundMeContract.getPriceFeed();

          assert.equal(response, mockv3aggregator.address);
        });
      });

      describe("fund", () => {
        it("fails when not enough ETH is sent", async () => {
          await expect(fundMeContract.fund()).to.be.revertedWith(
            "You need to send more ETH!"
          );
        });

        it("address to amount mapping is properly updated", async () => {
          await fundMeContract.fund({ value: sendValue });
          const response = await fundMeContract.getFundOfGivenAddress(deployer);
          assert.equal(response.toString(), sendValue.toString());
        });

        it("list of funders is properly updated", async () => {
          await fundMeContract.fund({ value: sendValue });
          const funder = await fundMeContract.getFunder(0);
          assert.equal(funder, deployer);
        });
      });

      describe("withdraw", async () => {
        beforeEach(async () => {
          await fundMeContract.fund({ value: sendValue });
        });

        it("withdraw from a single funder", async () => {
          // Arrange
          const startingFundMeBal = await fundMeContract.provider.getBalance(
            fundMeContract.address
          );
          const startingDeployerBal = await fundMeContract.provider.getBalance(
            deployer
          );

          // Act
          const txResponse = await fundMeContract.withdraw();
          const txReceipt = await txResponse.wait(1);
          const totalGasCost = txReceipt.effectiveGasPrice.mul(
            txReceipt.gasUsed
          );

          const endingFundMeBal = await fundMeContract.provider.getBalance(
            fundMeContract.address
          );
          const endingDeployerBal = await fundMeContract.provider.getBalance(
            deployer
          );

          // Assert
          assert.equal(endingFundMeBal.toString(), "0");
          assert.equal(
            startingFundMeBal.add(startingDeployerBal).toString(),
            endingDeployerBal.add(totalGasCost).toString()
          );
        });

        it("normal withdraw from multiple funders", async () => {
          // Arrange - prepare for modification
          const accounts = await ethers.getSigners();
          for (let i = 0; i < 6; i++) {
            // We need to connect the FundMe contract to the individual accounts because
            // it is being connected to the deployer account right now, meaning that
            // the deployer is making calls to the contract every time we invoke a function
            // msg.sender === deployer, we need to change msg.sender = account[i].address
            const connectedFundMeContract = await fundMeContract.connect(
              accounts[i]
            );
            await connectedFundMeContract.fund({ value: sendValue });
          }

          const startingFundMeBal = await fundMeContract.provider.getBalance(
            fundMeContract.address
          );
          const startingDeployerBal = await fundMeContract.provider.getBalance(
            deployer
          );

          // Act - modification
          const txResponse = await fundMeContract.withdraw();
          const txReceipt = await txResponse.wait(1);
          const totalGasCost = txReceipt.effectiveGasPrice.mul(
            txReceipt.gasUsed
          );

          const endingFundMeBal = await fundMeContract.provider.getBalance(
            fundMeContract.address
          );
          const endingDeployerBal = await fundMeContract.provider.getBalance(
            deployer
          );

          // Assert - test the modification
          assert.equal(endingFundMeBal.toString(), "0");
          assert.equal(
            endingDeployerBal.add(totalGasCost).toString(),
            startingFundMeBal.add(startingDeployerBal).toString()
          );

          // return error when accessing 0 index coz array is empty
          await expect(fundMeContract.getFunder(0)).to.be.reverted;

          for (let i = 0; i < 6; i++) {
            assert.equal(
              await (
                await fundMeContract.getFundOfGivenAddress(accounts[i].address)
              ).toString(),
              "0"
            );
          }
        });

        it("efficient withdraw from multiple funders", async () => {
          // Arrange - prepare for modification
          const accounts = await ethers.getSigners();
          for (let i = 0; i < 6; i++) {
            // We need to connect the FundMe contract to the individual accounts because
            // it is being connected to the deployer account right now, meaning that
            // the deployer is making calls to the contract every time we invoke a function
            // msg.sender === deployer, we need to change msg.sender = account[i].address
            const connectedFundMeContract = await fundMeContract.connect(
              accounts[i]
            );
            await connectedFundMeContract.fund({ value: sendValue });
          }

          const startingFundMeBal = await fundMeContract.provider.getBalance(
            fundMeContract.address
          );
          const startingDeployerBal = await fundMeContract.provider.getBalance(
            deployer
          );

          // Act - modification
          const txResponse = await fundMeContract.efficientWithdraw();
          const txReceipt = await txResponse.wait(1);
          const totalGasCost = txReceipt.effectiveGasPrice.mul(
            txReceipt.gasUsed
          );

          const endingFundMeBal = await fundMeContract.provider.getBalance(
            fundMeContract.address
          );
          const endingDeployerBal = await fundMeContract.provider.getBalance(
            deployer
          );

          // Assert - test the modification
          assert.equal(endingFundMeBal.toString(), "0");
          assert.equal(
            endingDeployerBal.add(totalGasCost).toString(),
            startingFundMeBal.add(startingDeployerBal).toString()
          );

          // return error when accessing 0 index coz array is empty
          await expect(fundMeContract.getFunder(0)).to.be.reverted;

          for (let i = 0; i < 6; i++) {
            assert.equal(
              await (
                await fundMeContract.getFundOfGivenAddress(accounts[i].address)
              ).toString(),
              "0"
            );
          }
        });

        it("only allows owner to withdraw funds", async () => {
          const accounts = await ethers.getSigners();
          const notOwnerAccount = accounts[9];
          const connectedNotOwnerContract = await fundMeContract.connect(
            notOwnerAccount
          );
          await expect(
            connectedNotOwnerContract.withdraw()
          ).to.be.revertedWithCustomError(fundMeContract, "FundMe__NotOwner");
        });
      });
    });
