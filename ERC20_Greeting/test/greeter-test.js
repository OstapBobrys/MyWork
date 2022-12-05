const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Greeter", function () {
  let owner
  let greet

  beforeEach(async function() {
    [owner] = await ethers.getSigners()

    const Greeter = await ethers.getContractFactory("Greeter", owner)
    greet = await Greeter.deploy("Hello my dear friend")
    await greet.deployed()
    })

    it("correct greeter", async function() {
        const hello = await greet.greeting()
        expect(hello).to.eq("Hello my dear friend")
    })
    it("allows get greet", async function() {
        const hello = await greet.getGreet()
        expect(hello).to.eq("Hello my dear friend")
    })
    it("allows set greeting", async function() {
        await greet.setGreeting("Good bye my dear friend")
        expect(await greet.greeting()).to.eq("Good bye my dear friend")

        const hello = await greet.getGreet()
        expect(hello).to.eq("Good bye my dear friend")
    })
})
