const { assert } = require("chai")

const Aqua = artifacts.require("Aqua")

contract("Aqua", (accounts) => {
    before(async () => {
        aqua = await Aqua.deployed()
        console.log("Aqua Address:", aqua.address)
    })

    it("gives the owner of the token 1M tokens", async () => {
        let balance = await aqua.balanceOf(accounts[0])
        balance = web3.utils.fromWei(balance, 'ether')
        assert.equal(balance, 1000000, "Balance should be 1M tokens for contract creator")
    })

    it("can transfer tokens between accounts", async () => {
        let amount = web3.utils.toWei('1000', 'ether')
        await aqua.transfer(accounts[1], amount, { from: accounts[0] })
        let balance = await aqua.balanceOf(accounts[1])
        balance = web3.utils.fromWei(balance, 'ether')
        assert.equal(balance, '1000', "Balance should be 1k tokens for contract creator")

    })

    
})