const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { assert } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe, deployer;
          const sendValue = ethers.parseEther("0.04");
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              const fundMe_address = (await deployments.get("FundMe")).address;
              fundMe = await ethers.getContractAt("FundMe", fundMe_address);
          });

          it("Allow people to fund and withdraw", async function () {
              await fundMe.fund({ value: sendValue });
              await fundMe.withdraw();
              const endingFundMeBalance = await ethers.provider.getBalance(
                  await fundMe.getAddress()
              );

              assert.equal(endingFundMeBalance, 0);
          });
      });
