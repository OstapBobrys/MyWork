// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Auction {
    address public owner;
    uint public highestRate;
    address public addressWinner;
    bool public stop;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Not an owner");
        _;
    }

    event ItemCreated(uint index, string itemName, uint price);
    event AuctionEnded(uint index, uint finalPrice, address winner);

    struct ItemData {
        string name;
        uint price;
        address payable walletSeller;
    }

     struct Balance {
        uint amount;
        string message;
    }

     mapping(address => Balance) public balances;

    function getPayment(address _addr) public onlyOwner view returns(uint) {
        return balances[_addr].amount;
    }

    ItemData[] public itemsdata;

   function showLeader() public view returns(address) {
       return addressWinner;
   }


   function withdrawAll(address payable _to) public onlyOwner {
        _to.transfer(address(this).balance);
    }

    function newItem(string memory _name, uint _price) external {
        ItemData memory newItemData = ItemData({
            name: _name,
            price: _price,
            walletSeller: payable(msg.sender)
        
        });
        
        itemsdata.push(newItemData);

        emit ItemCreated(itemsdata.length - 1, _name, _price);
    }

    function getPriceFor(uint index) public view returns(uint)  {
        ItemData memory cItemData = itemsdata[index];
        return cItemData.price;
    }
    
    function buy(uint index, string memory message) public payable {
        ItemData memory cItemData = itemsdata[index];
        uint cPrice = getPriceFor(index);
        require(msg.value >= cPrice && msg.value >= highestRate, " low bid ");
        cItemData.walletSeller.transfer(cPrice);
        require(stop != true, "Auction stopped!");
        if (msg.value > highestRate) {
            highestRate = msg.value;
            addressWinner = msg.sender;
        }

        Balance memory newBalance = Balance(
            msg.value,
            message
        );

        balances[msg.sender].amount += msg.value;
        
    
    }

    function stopAuction(uint index) external onlyOwner {
        stop = true;
        emit AuctionEnded(index, highestRate, addressWinner);
    }

    function showAllCost(uint index) public onlyOwner view returns(uint) {
        address _thisContract = address(this);
        uint allPrice = _thisContract.balance;
        return allPrice;

    }

}
