const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Transfers", function () {
    let owner
    let sender
    let senderTwo
    let senderThree
    let transfer

    
    beforeEach(async function() {
        [owner, sender, senderTwo, senderThree] = await ethers.getSigners()

        const Transfers = await ethers.getContractFactory("Transfers", owner)
        transfer = await Transfers.deploy(3)
        await transfer.deployed()
    })
    it("correct owner", async function() {
        const curretOwner = await transfer.owner()
        expect(curretOwner).to.eq(owner.address)

        const maxTransfer = await transfer.maxTransfers()
        expect(maxTransfer).to.eq(3)
    })

    it("correct send transfer", async function() {
        const amount = ethers.utils.parseEther("0.000005")
        const tx = await sender.sendTransaction({
            value: amount,
            to: transfer.address
        })
        await tx.wait()

        const amountTwo = ethers.utils.parseEther("0.00005")
        const txTwo = await senderTwo.sendTransaction({
            value: amountTwo,
            to: transfer.address
        })
        await txTwo.wait()

        const amountThree = ethers.utils.parseEther("0.0005")
        const txThree = await senderThree.sendTransaction({
            value: amountThree,
            to: transfer.address
        })
        await txThree.wait()

        await expect(() => tx).
        to.changeEtherBalance(transfer, amount)

        const currentTrans = await transfer.currentTransfers()
        expect(currentTrans).to.eq(3)

        await expect(
            sender.
            sendTransaction( {value: ethers.utils.parseEther("0.00055"),
                              to: transfer.address })
            ).to.be.revertedWith("Cannot accept more transfers")

        await expect(tx).
        to.emit(transfer, "Send")
        .withArgs(sender.address, amount)

        await expect(txTwo).
        to.emit(transfer, "Send")
        .withArgs(senderTwo.address, amountTwo)
        
        await expect(txThree).
        to.emit(transfer, "Send")
        .withArgs(senderThree.address, amountThree)

    })

    it("allows to withdraw", async function() {
        const token = 5
        const txData = {
            value: token,
            to: transfer.address
        }
        const tx = await sender.sendTransaction(txData)
        await tx.wait()

        const withdraw = await transfer.withdrawTo(owner.address)
        expect(withdraw).to.changeEtherBalance(owner, token)

        await expect(
            transfer.connect(sender).
            withdrawTo(sender.address)
            ).to.be.revertedWith("Not an owner")
    })

    it("allow get Transfer", async function() {
        const amount = ethers.utils.parseEther("0.000005")
        const tx = await sender.sendTransaction({
            value: amount,
            to: transfer.address
        })
        await tx.wait()

        const currentTrans = await transfer.currentTransfers()
        expect(currentTrans).to.eq(1)

        const get = await transfer.getTransfer(1)
        expect(get[0]).to.eq(amount)
        expect(get[1]).to.eq(sender.address)
    })
})