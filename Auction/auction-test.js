const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Auction", function () {
  let owner
  let buyer
  let buyer2
  let auct
  let seller

  beforeEach(async function() {
    [owner, seller, buyer, buyer2] = await ethers.getSigners()

    const Auction = await ethers.getContractFactory("Auction", owner)
    auct = await Auction.deploy()
    await auct.deployed()
    })
    it("correct owner", async function() {
        const curretOwner = await auct.owner()
        expect(curretOwner).to.eq(owner.address)
    })
        it("new item correctly", async function() {
            const tx = await auct.newItem(
            "Puma",
            ethers.utils.parseEther("0.00001")
            )

            const cItemData = await auct.itemsdata(0)
            expect(cItemData.name).to.eq("Puma")
            expect(cItemData.price).to.eq(ethers.utils.parseEther("0.00001"))
            await expect(tx)
            .to.emit(auct, 'ItemCreated')
            .withArgs(0, "Puma", ethers.utils.parseEther("0.00001"))
        })

        it("correct buy item", async function() {
            await auct.connect(seller).newItem(
                "Puma",
                ethers.utils.parseEther("0.00001")
                )


            const buyTx = await auct.connect(buyer).
            buy(0,"Hello", {value: ethers.utils.parseEther("0.00001")})
            const cItemData = await auct.itemsdata(0)
            const finalPrice = await auct.highestRate()
            await expect(() => buyTx).to.changeEtherBalance(seller, finalPrice)

            await expect(
               auct.connect(buyer).
                buy(0,"Hello", {value: ethers.utils.parseEther("0.000001")})
                ).to.be.revertedWith(" low bid ")

            })

            
         it("stop auction", async function() {
            await auct.connect(seller).newItem(
                "Puma",
                ethers.utils.parseEther("0.00001")
                )

            const buyTx = await auct.connect(buyer).
            buy(0,"Hello", {value: ethers.utils.parseEther("0.00001")})
            const finalPrice = await auct.highestRate()

            const stopTx = await auct.connect(owner).stopAuction(0)
            const stopBool = await auct.stop()
            expect(stopBool).to.eq(true)
    
            await expect(stopTx)
            .to.emit(auct, 'AuctionEnded')
            .withArgs(0, finalPrice, buyer.address)

            await expect(
            auct.connect(buyer).
            buy(0,"Hello", {value: ethers.utils.parseEther("0.00001")}) 
            ).to.be.revertedWith("Auction stopped!")

            await expect(
                auct.connect(buyer).
                stopAuction(0)
                ).to.be.revertedWith("Not an owner")
        })
        it("correct show all cost", async function() {
            await auct.connect(seller).newItem(
                "Puma",
                ethers.utils.parseEther("0.00001")
                )

            const buyTx = await auct.connect(buyer).
            buy(0,"Hello", {value: ethers.utils.parseEther("0.00001")})
            const finalPrice = await auct.highestRate()

            const allCost = await auct.showAllCost(0)
            expect(allCost).to.changeEtherBalance(seller, finalPrice)

            await expect(
                auct.connect(buyer).
                showAllCost(0) 
                ).to.be.revertedWith("Not an owner")
        })

        it("correct withdraw", async function() {
            await auct.connect(seller).newItem(
                "Puma",
                ethers.utils.parseEther("0.00001")
                )

            const buyTx = await auct.connect(buyer).
            buy(0,"Hello", {value: ethers.utils.parseEther("0.00001")})
            const finalPrice = await auct.highestRate()

            const withdraw = await auct.withdrawAll(owner.address)
            expect(withdraw).to.changeEtherBalance(owner, finalPrice)

            await expect(
                auct.connect(buyer).
                withdrawAll(buyer.address)
                ).to.be.revertedWith("Not an owner")
        })

        it("receive correct payments", async function() {
            await auct.connect(seller).newItem(
                "Puma",
                ethers.utils.parseEther("0.00001")
                )

            const buyTx = await auct.connect(buyer).
            buy(0,"Hello", {value: ethers.utils.parseEther("0.00001")})

            const correctPayment = await auct.getPayment(buyer.address)
            const amount = ethers.utils.parseEther("0.00001")
            expect(correctPayment).to.eq(amount)

            await expect(
                auct.connect(buyer).
                getPayment(buyer.address)
                ).to.be.revertedWith("Not an owner")
        })

        it("leader auction", async function() {
            await auct.connect(seller).newItem(
                "Puma",
                ethers.utils.parseEther("0.00001")
                )

            const buyTx = await auct.connect(buyer).
            buy(0,"Hello", {value: ethers.utils.parseEther("0.00001")})

            const leaderTx = await auct.connect(buyer2).
            buy(0,"He", {value: ethers.utils.parseEther("0.001")})

            const leader = await auct.showLeader()
            expect(leader).to.eq(buyer2.address)
        })
    })

