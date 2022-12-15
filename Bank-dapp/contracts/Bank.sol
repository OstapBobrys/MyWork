//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Bank is Ownable {
    bytes32[] public whitelistedSymbols;
    mapping(bytes32 => address) public whitlistedTokens;
    mapping (address => mapping(bytes32 => uint)) public balances;

    function whitelistToken(bytes32 symbol, address tokenAddress) external onlyOwner {
        whitelistedSymbols.push(symbol);
        whitlistedTokens[symbol] = tokenAddress;
    }

    function getWhitelistedSymbols() external view returns(bytes32[] memory) {
        return whitelistedSymbols;
    }

    function getWhitelistedTokenAddress(bytes32 symbol) external view returns(address) {
    return whitlistedTokens[symbol];
    }

    receive() external payable {
        balances[msg.sender]['Eth'] += msg.value;
    }

    function withdrawEther(uint amount) external {
        require(balances[msg.sender]['Eth'] >= amount, "Not enough funds");
        balances[msg.sender]['Eth'] -= amount;
        payable(msg.sender).call{value: amount}("");
    }

    function depositTokens(uint amount, bytes32 symbol) external {
        balances[msg.sender][symbol] += amount;
        IERC20(whitlistedTokens[symbol]).transferFrom(msg.sender, address(this), amount);
    }

    function withdrawTokens( uint amount, bytes32 symbol) external {
        require(balances[msg.sender][symbol] >= amount, "Not enough funds");
        balances[msg.sender][symbol] -= amount;
        IERC20(whitlistedTokens[symbol]).transfer(msg.sender, amount);
    }

    function getTokenBalance(bytes32 symbol) external view returns(uint) {
        return balances[msg.sender][symbol];
    }
}
