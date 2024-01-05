const { network } = require("hardhat");
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config");
require("dotenv").config();

const { verify } = require("../utils/verify");

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
    }
    log("\n=================================================================");
    log("Deploying Contract........\n");
    // log(ethUsdPriceFeedAddress);

    const args = [ethUsdPriceFeedAddress];
    const fundMe = await deploy("FundMe", {
        // contract: "FundMe",
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log("\nContract Deployed!...");
    // log("=================================================================\n");
    // if (
    //     !developmentChains.includes(network.name) &&
    //     process.env.ETHERSCAN_API_KEY
    // ) {
    //     await verify(fundMe.address, args);
    // }
    // log("=================================================================");
};

module.exports.tags = ["fundme", "all"];
