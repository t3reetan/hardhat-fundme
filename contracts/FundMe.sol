// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

// The reason for having the FundMe__ prefix is such that when the error is thrown,
// it's obvious that the error is coming from the FundMe contract
///FundMe__NotOwner
error FundMe__NotOwner();

/** @title A funding contract.
 *  @author Terry Tan
 *  @notice This contract demos a funding process (Notice is pretty much just a description)
 *  @dev The contract allows funds to be deposited by anyone and withdrawn by the owner
 */
contract FundMe {
    using PriceConverter for uint256;

    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;

    // Could we make this constant?  /* hint: no! We should make it immutable! */
    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10**18;

    AggregatorV3Interface private s_pricefeed;

    constructor(address pricefeedAddress) {
        i_owner = msg.sender;
        s_pricefeed = AggregatorV3Interface(pricefeedAddress);
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate(s_pricefeed) >= MINIMUM_USD,
            "You need to send more ETH!"
        );
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    modifier onlyOwner() {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    function withdraw() public payable onlyOwner {
        // reading a lot from storage, very gas intensive
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function efficientWithdraw() public payable onlyOwner {
        address[] memory m_funders = s_funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < m_funders.length;
            funderIndex++
        ) {
            address funder = m_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0; // mappings can't be stored in memory, so no choice
        }

        s_funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    // the reason why we have all these get functions is because we don't want people who interact with our code to have
    // to deal with the s_xxx, but we want to retain it so that we ourselves know that we are dealing with storage vars
    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFundOfGivenAddress(address funderAddress)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[funderAddress];
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_pricefeed;
    }

    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \
    //         yes  no
    //         /     \
    //    receive()?  fallback()
    //     /   \
    //   yes   no
    //  /        \
    //receive()  fallback()

    fallback() external payable {
        fund();
    }

    receive() external payable {
        fund();
    }
}

// Concepts we didn't cover yet (will cover in later sections)
// 1. Enum
// 2. Events
// 3. Try / Catch
// 4. Function Selector
// 5. abi.encode / decode
// 6. Hash with keccak256
// 7. Yul / Assembly
