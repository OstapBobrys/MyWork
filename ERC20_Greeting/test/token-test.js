const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Token", function () {
  let owner
  let token
  let recipient

  beforeEach(async function() {
    [owner, recipient] = await ethers.getSigners()

    const Token = await ethers.getContractFactory("Token", owner)
    token = await Token.deploy()
    await token.deployed()
    })
    it("correct data", async function() {
        expect( await token.name()).to.eq("PatSsso Solana Boss")
        expect( await token.symbol()).to.eq("PSB")
        expect( await token.totalSupply()).to.eq(1000000)
    })

    it("correct balacnce", async function() {
        const supply = await token.totalSupply()
        const balance = await token.balanceOf(owner.address)
        expect(balance).to.eq(supply)
    })

    it("allows to transfer", async function() {
        const amount = 150000
        const supply = await token.totalSupply() - amount
        const tx = await token.transfer(
            recipient.address,
            amount
        )
        await tx.wait()
        
        const balanceToken = await token.balances(owner.address)
        expect(balanceToken).to.eq(supply)

        const tokenBalance = await token.balances(recipient.address)
        expect(tokenBalance).to.eq(amount)

        await expect(
            token.transfer(
                recipient.address,
                900000
            ) 
            ).to.be.revertedWith("Not enough tokens")
    })
})