const { network } = require("hardhat");
const {
    DECIMALS,
    developmentChains,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    if (developmentChains.includes(network.name)) {
        log(
            "================================================================="
        );
        log("Local Network detected! Deploying Mocks........\n");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        });
        log("\nMocks Deployed!...");
        log(
            "================================================================="
        );
    }
};

module.exports.tags = ["all", "mocks"];
