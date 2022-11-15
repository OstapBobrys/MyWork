const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Auction", function () {
  let owner
  let buyer
  let auct
  let seller

  beforeEach(async function() {
    [owner, seller, buyer] = await ethers.getSigners()

    const Auction = await ethers.getContractFactory("Auction", owner)
    auct = await Auction.deploy()
    await auct.deployed()
    })
    it("correct owner", async function() {
        const curretOwner = await auct.owner()
        expect(curretOwner).to.eq(owner.address)
    })

    describe("newItem", function(){
        it("new item correctly", async function() {
            const tx = await auct.newItem(
            "Puma",
            ethers.utils.parseEther("0.00001")
            )

            const cItemData = await auct.itemsdata(0)
            expect(cItemData.name).to.eq("Puma")
            expect(cItemData.price).to.eq(ethers.utils.parseEther("0.00001"))
        })
    })

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
      }
    
    describe("buy", function(){
        it("correct buy item", async function() {
            await auct.connect(seller).newItem(
                "Puma",
                ethers.utils.parseEther("0.00001")
                )

                this.timeout(5000) // 5s
                await delay(1000)

            const buyTx = await auct.connect(buyer).
            buy(0,"Hello", {value: ethers.utils.parseEther("0.00001")})
            const finalPrice = await auct.highestRate()
            await expect(() => buyTx).to.changeEtherBalance(seller, finalPrice)

        })
    })

})
