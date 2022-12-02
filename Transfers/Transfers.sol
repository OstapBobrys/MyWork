// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Transfers {
    struct Transfer {
        uint amount;
        address sender;
    }

    event Send(address _from, uint _amount);

    Transfer[] public transfers;

    mapping(uint => Transfer) public transferCount;

    address public owner;
    uint8 public  maxTransfers;
    uint8 public currentTransfers;

    constructor(uint8 _maxTransfers) {
        owner = msg.sender;
        maxTransfers = _maxTransfers;
    }

    function getTransfer(uint _index) public view returns(Transfer memory) {
        return transferCount[_index];
    }

    modifier requireOwner() {
        require(owner == msg.sender, "Not an owner");
        _;
    }

    function withdrawTo(address payable _to) public requireOwner {
        _to.transfer(address(this).balance);
    }

    receive() external payable {
        if(currentTransfers >= maxTransfers) {
            revert("Cannot accept more transfers");
        }
        currentTransfers++;
        transferCount[currentTransfers] = Transfer(msg.value, msg.sender); 

        emit Send(msg.sender, msg.value);
    }

}
