const { expect } = require("chai")
const { ethers } = require("hardhat")
const { BigNumber } = require("ethers");

describe("Bank", function () {
  let owner
  let bank
  let maticContract
  let shiba
  let usdtContract
  let user
  let deployer
  
  const maticSymbol = ethers.utils.formatBytes32String('Matic')
  const shibaSymbol = ethers.utils.formatBytes32String('Shib')
  const usdtSymbol =  ethers.utils.formatBytes32String('Usdt')

  beforeEach(async function() {
    [owner, user, deployer] = await ethers.getSigners()

    const Bank = await ethers.getContractFactory("Bank", owner)
    bank = await Bank.deploy()
    await bank.deployed()

    const Matic = await ethers.getContractFactory("Matic", deployer);
    maticContract = await Matic.deploy()
    const Shib = await ethers.getContractFactory("Shib", deployer);
    shiba = await Shib.deploy()
    const Usdt = await ethers.getContractFactory("Usdt", deployer);
    usdtContract = await Usdt.deploy()

    await maticContract.deployed()
    await shiba.deployed()
    await usdtContract.deployed()


    await bank.whitelistToken(
      maticSymbol,
      maticContract.address
  );
  await bank.whitelistToken(
      shibaSymbol,
      shiba.address
  );
  await bank.whitelistToken(
      usdtSymbol,
      usdtContract.address
  );
    })

    it("Correct tokens data", async function() {
      expect(await maticContract.name()).to.eq("Polygon")
      expect(await maticContract.symbol()).to.eq("MATIC")
      const symbols = await bank.whitlistedTokens(maticSymbol)
      expect(symbols).to.eq(maticContract.address)
      expect(await bank.whitelistedSymbols(0)).to.eq(maticSymbol)

      expect(await shiba.name()).to.eq("Shiba Inu")
      expect(await shiba.symbol()).to.eq("SHIB")
      const symbols2 = await bank.whitlistedTokens(shibaSymbol)
      expect(symbols2).to.eq(shiba.address)
      expect(await bank.whitelistedSymbols(1)).to.eq(shibaSymbol)

      expect(await usdtContract.name()).to.eq("Tether")
      expect(await usdtContract.symbol()).to.eq("USDT")
      const symbols3 = await bank.whitlistedTokens(usdtSymbol)
      expect(symbols3).to.eq(usdtContract.address)
      expect(await bank.whitelistedSymbols(2)).to.eq(usdtSymbol)

      const wlSymbols = await bank.getWhitelistedSymbols()
      expect(wlSymbols[0]).to.eq(maticSymbol)
      expect(wlSymbols[1]).to.eq(shibaSymbol)
      expect(wlSymbols[2]).to.eq(usdtSymbol)

      expect( await bank.getWhitelistedTokenAddress(maticSymbol)).to.eq(maticContract.address)
      expect( await bank.connect(deployer).getTokenBalance(maticSymbol)).to.eq(5000)
    })

    
})
