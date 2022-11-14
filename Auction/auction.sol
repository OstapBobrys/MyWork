// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Auction {
    // Повертає кошти тим, хто не переіг в аукціоні
    // Таблиця лідерів
    address public owner;
    uint highestRate;
    address addressWinner;
    bool public stop;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Now an owner");
        _;
    }

    event ItemCreated(uint index, string itemName, uint price);
    event AuctionEnded(uint index, uint finalPrice, address winner);

    struct ItemData {
        string name;
        uint price;
        address payable walletSeller;
    }

     struct Payment {
        uint amount;
        string message;
    }

    struct Balance {
        uint totalPayments;
        mapping(uint => Payment) payments;
    }

     mapping(address => Balance)  balances;
     
    function getPayment(address _addr, uint _index) public onlyOwner view returns(Payment memory) {
        return balances[_addr].payments[_index];
    }

    ItemData[] public itemsdata;

   function showWinner() public view returns(uint, address) {
       return(highestRate, addressWinner);
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
        uint maxPrice = cPrice * 20;
        require(msg.value > cPrice && msg.value > highestRate, " low bid ");
        require(msg.value <= maxPrice, "max price!");
        if (stop == true) {
           revert ("Auction stopped");
        }
        if (msg.value == maxPrice) {
            stop = true;
        }
        if (msg.value > highestRate) {
            highestRate = msg.value;
            addressWinner = msg.sender;
        }


        uint paymentNum = balances[msg.sender].totalPayments;
        balances[msg.sender].totalPayments++;
        Payment memory newPayment = Payment(
            msg.value,
            message
        );

        balances[msg.sender].payments[paymentNum] = newPayment;
    
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
