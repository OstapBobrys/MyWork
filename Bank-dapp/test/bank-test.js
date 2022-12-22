const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokenJSON = require("../src/artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json")

const str2Bytes32 = ethers.utils.formatBytes32String;

const deploy = async (name, deployer, ...args) => {
  const factory = await ethers.getContractFactory(name, deployer);
  const contract = await factory.deploy(...args);
  await contract.deployed();
  return contract;
};

describe('Bank', function () {
  let deployer;
  let user;

  let Bank;
  let Matic;
  let Shib;
  let Usdt;
  let maticERC20

  let id1
  let id2
  let id3

  beforeEach(async function () {
    [user, deployer] = await ethers.getSigners();

    Bank = await deploy('Bank', deployer);
    Matic = await deploy('Matic', deployer);
    Shib = await deploy('Shib', deployer);
    Usdt = await deploy('Usdt', deployer);

    const whitelist = [
      { id: 'Matic', address: Matic.address },
      { id: 'Shib', address: Shib.address },
      { id: 'Usdt', address: Usdt.address },
      { id: 'Eth', address: '0x4B7ee45f30767F36f06F79B32BF1FCa6f726DEda' },
    ];

    const add2Whitelist = ({ id, address }) => Bank.whitelistToken(str2Bytes32(id), address);

    await Promise.all(whitelist.map(add2Whitelist));

    maticERC20 = new ethers.Contract(Matic.address, tokenJSON.abi, deployer)

    id1 = str2Bytes32('Matic');
    id2 = str2Bytes32('Shib');
    id3 = str2Bytes32('Usdt');
  });

  describe('Check tokens data', async function () {
    it(`Correct Matic data`, async function () {
      expect(await Matic.name()).to.eq('Polygon');
      expect(await Matic.symbol()).to.eq('MATIC');
    });
    it(`Correct Shib data`, async function () {
      expect(await Shib.name()).to.eq('Shiba Inu');
      expect(await Shib.symbol()).to.eq('SHIB');
    });
    it(`Correct Usdt data`, async function () {
      expect(await Usdt.name()).to.eq('Tether');
      expect(await Usdt.symbol()).to.eq('USDT');
    });
  });

  describe('Check filled whitelist', async function () {
    it(`Correct Matic address`, async function () {
      expect(await Bank.whitelistedSymbols(0)).to.eq(id1);
      expect(await Bank.whitlistedTokens(id1)).to.eq(Matic.address);
    });
    it(`Correct Shib data`, async function () {
      expect(await Bank.whitelistedSymbols(1)).to.eq(id2);
      expect(await Bank.whitlistedTokens(id2)).to.eq(Shib.address);
    });
    it(`Correct Usdt data`, async function () {
      expect(await Bank.whitelistedSymbols(2)).to.eq(id3);
      expect(await Bank.whitlistedTokens(id3)).to.eq(Usdt.address);
    });
    it('Allows only owner', async function() {
      await expect(
        Bank.connect(user).
        whitelistToken(id1, Matic.address)
        ).to.be.revertedWith("Ownable: caller is not the owner")
    })
  });

  describe('Correct bank functional', async function() {
    it('Correct tokens balance', async function () {
      const approval = await maticERC20.approve(Bank.address, 5000)
      await approval.wait()
      await Bank.depositTokens(500, id1)
      expect(await Bank.getTokenBalance(id1)).to.eq(500);
    })
    it('Correct whitelisted symbols', async function() {
      const tokens = await Bank.getWhitelistedSymbols()
      expect(tokens[0]).to.eq(id1)
      expect(tokens[1]).to.eq(id2)
      expect(tokens[2]).to.eq(id3)
    })
    it('Correct token address', async function() {
      const tokenAddress = await Bank.getWhitelistedTokenAddress(id1)
      expect(tokenAddress).to.eq(Matic.address)
    });

  describe('Allows withdraw', async function() {
    it('Allows withdraw Eth', async function() {
      const tx = await deployer.sendTransaction({
        value: 8,
        to: Bank.address
    })
    await tx.wait()
    const withdrawEth = await Bank.withdrawEther(1)
    await withdrawEth.wait()
    await expect(
      Bank.withdrawEther(8)
      ).to.be.revertedWith("Not enough funds")
  })
    it('Allows withdraw tokens', async function() {
    const approval = await maticERC20.approve(Bank.address, 5000)
    await approval.wait()
    await Bank.depositTokens(2500, id1)
    await Bank.withdrawTokens(2000, id1)
    await expect(
      Bank.withdrawTokens(1000, id1)
      ).to.be.revertedWith("Not enough funds")
    })  
});
})
})
