// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();

contract FundMe {
    using PriceConverter for uint256;

    address private immutable i_owner;
    uint256 public constant MIN_ACCEPTABLE_VALUE = 1 * 1e18;
    address[] private funders;
    mapping(address => uint256) private addressToAmountFunded;
    AggregatorV3Interface private priceFeed;

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    constructor(address priceFeedAddress) {
        priceFeed = AggregatorV3Interface(priceFeedAddress);
        i_owner = msg.sender;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate(priceFeed) >= MIN_ACCEPTABLE_VALUE,
            "Didn't Send Enough!!.."
        );
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value;
    }

    // function withdraw() public onlyOwner {
    //     for (uint256 i = 0; i < funders.length; i++) {
    //         addressToAmountFunded[funders[i]] = 0;
    //     }

    //     funders = new address[](0);

    //     (bool success, ) = i_owner.call{value: address(this).balance}("");
    //     require(success,"Withdraw Failed!");
    // }

    function withdraw() public onlyOwner {
        address[] memory m_funders = funders;
        for (uint256 i = 0; i < m_funders.length; i++) {
            addressToAmountFunded[m_funders[i]] = 0;
        }

        funders = new address[](0);

        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success,"Withdraw Failed!");
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return priceFeed;
    }

    function getAddressToAmountFunded(
        address fundingAddress
    ) public view returns (uint256) {
        return addressToAmountFunded[fundingAddress];
    }

    function getFunders(uint256 index) public view returns (address) {
        return funders[index];
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }
}
