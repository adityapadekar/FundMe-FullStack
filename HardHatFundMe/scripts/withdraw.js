const { getNamedAccounts, deployments, ethers } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts();
    const fundMeAddress = (await deployments.get("FundMe")).address;
    const fundMe = await ethers.getContractAt("FundMe", fundMeAddress);
    await fundMe.connect(deployer)
    console.log("Withdraw Funds!...\n");
    const txResponse = await fundMe.withdraw();
    await txResponse.wait(1);
    console.log("Withdrawn!\n");
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
