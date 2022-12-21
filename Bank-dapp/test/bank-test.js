const { expect } = require('chai');
const { ethers } = require('hardhat');

const str2Bytes32 = ethers.utils.formatBytes32String;

const deploy = async (name, deployer, ...args) => {
  const factory = await ethers.getContractFactory(name, deployer);
  const contract = await factory.deploy(...args);
  await contract.deployed();
  return contract;
};

describe('Bank', function () {
  let owner;
  let Bank;
  let Matic;
  let Shib;
  let Usdt;
  let deployer;

  beforeEach(async function () {
    [owner, deployer] = await ethers.getSigners();

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
      const id = str2Bytes32('Matic');
      expect(await Bank.whitelistedSymbols(0)).to.eq(id);
      expect(await Bank.whitlistedTokens(id)).to.eq(Matic.address);
    });
    it(`Correct Shib data`, async function () {
      const id = str2Bytes32('Shib');
      expect(await Bank.whitelistedSymbols(1)).to.eq(id);
      expect(await Bank.whitlistedTokens(id)).to.eq(Shib.address);
    });
    it(`Correct Usdt data`, async function () {
      const id = str2Bytes32('Usdt');
      expect(await Bank.whitelistedSymbols(2)).to.eq(id);
      expect(await Bank.whitlistedTokens(id)).to.eq(Usdt.address);
    });
  });
});
