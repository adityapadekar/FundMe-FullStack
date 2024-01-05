const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe, MockV3Aggregator, deployer;
          const sendValue = ethers.parseEther("0.05");
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              const deploymentResults = await deployments.fixture(["all"]);
              const fundMe_address = deploymentResults["FundMe"]?.address;
              fundMe = await ethers.getContractAt("FundMe", fundMe_address);
              const mockV3Aggregator_address =
                  deploymentResults["MockV3Aggregator"]?.address;
              MockV3Aggregator = await ethers.getContractAt(
                  "MockV3Aggregator",
                  mockV3Aggregator_address
              );
          });

          describe("constructor", async function () {
              it("Sets the aggregator address correctly", async function () {
                  const response = await fundMe.getPriceFeed();
                  assert.equal(response, await MockV3Aggregator.getAddress());
              });
          });

          describe("fund", async function () {
              it("Fails if enough ETH is not sent", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Didn't Send Enough!!.."
                  );
              });

              it("Updates the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  );
                  assert.equal(response.toString(), sendValue);
              });

              it("Add funder to funders array", async function () {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.getFunders(0);
                  assert.equal(response, deployer);
              });
          });

          describe("withdraw", function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue });
              });

              it("Withdraw ETH from a single founder", async function () {
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(
                          await fundMe.getAddress()
                      );
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  const txResponse = await fundMe.withdraw();
                  const txReceipt = await txResponse.wait(1);

                  const { fee } = txReceipt;

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      await fundMe.getAddress()
                  );
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      (
                          startingDeployerBalance + startingFundMeBalance
                      ).toString(),
                      (endingDeployerBalance + fee).toString()
                  );
              });

              it("Allow us to withdraw with multiple funders", async function () {
                  const accounts = await ethers.getSigners();
                  for (let i = 0; i < accounts.length; i++) {
                      const connectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      await connectedContract.fund({ value: sendValue });
                  }

                  const startingFundMeBalance =
                      await ethers.provider.getBalance(
                          await fundMe.getAddress()
                      );
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  const txResponse = await fundMe.withdraw();
                  const txReceipt = await txResponse.wait(1);

                  const { fee } = txReceipt;

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      await fundMe.getAddress()
                  );
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      (
                          startingDeployerBalance + startingFundMeBalance
                      ).toString(),
                      (endingDeployerBalance + fee).toString()
                  );

                  await expect(fundMe.getFunders(0)).to.be.reverted;

                  for (let i = 0; i < accounts.length; i++) {
                      const response = await fundMe.getAddressToAmountFunded(
                          accounts[i]
                      );
                      assert.equal(response.toString(), 0);
                  }
              });

              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedAccount = await fundMe.connect(
                      attacker
                  );
                  await expect(
                      attackerConnectedAccount.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
              });

            //   it("CheaperWithdraw testing", async function () {
            //       const accounts = await ethers.getSigners();
            //       for (let i = 0; i < accounts.length; i++) {
            //           const connectedContract = await fundMe.connect(
            //               accounts[i]
            //           );
            //           await connectedContract.fund({ value: sendValue });
            //       }

            //       const startingFundMeBalance =
            //           await ethers.provider.getBalance(
            //               await fundMe.getAddress()
            //           );
            //       const startingDeployerBalance =
            //           await ethers.provider.getBalance(deployer);

            //       const txResponse = await fundMe.withdrawCheaper();
            //       const txReceipt = await txResponse.wait(1);

            //       const { fee } = txReceipt;

            //       const endingFundMeBalance = await ethers.provider.getBalance(
            //           await fundMe.getAddress()
            //       );
            //       const endingDeployerBalance =
            //           await ethers.provider.getBalance(deployer);

            //       assert.equal(endingFundMeBalance, 0);
            //       assert.equal(
            //           (
            //               startingDeployerBalance + startingFundMeBalance
            //           ).toString(),
            //           (endingDeployerBalance + fee).toString()
            //       );

            //       await expect(fundMe.getFunders(0)).to.be.reverted;

            //       for (let i = 0; i < accounts.length; i++) {
            //           const response = await fundMe.getAddressToAmountFunded(
            //               accounts[i]
            //           );
            //           assert.equal(response.toString(), 0);
            //       }
            //   });
          });
      });
