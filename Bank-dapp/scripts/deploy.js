const { ethers } = require('hardhat');

const str2Bytes32 = ethers.utils.formatBytes32String;

const deploy = async (name, deployer, ...args) => {
  const factory = await ethers.getContractFactory(name, deployer);
  const contract = await factory.deploy(...args);
  await contract.deployed();
  console.log(`${name} deployed to: ${contract.address} by ${deployer.address}`);
  return contract;
};

async function main() {
  const [deployer] = await ethers.getSigners();

  const Bank = await deploy('Bank', deployer);
  const Matic = await deploy('Matic', deployer);
  const Shib = await deploy('Shib', deployer);
  const Usdt = await deploy('Usdt', deployer);

  const whitelist = [
    { symbol: 'Matic', address: Matic.address },
    { symbol: 'Shib', address: Shib.address },
    { symbol: 'Usdt', address: Usdt.address },
    { symbol: 'Eth', address: '0x4B7ee45f30767F36f06F79B32BF1FCa6f726DEda' },
  ];

  const add2Whitelist = ({ symbol, address }) => Bank.whitelistToken(str2Bytes32(symbol), address);

  await Promise.all(whitelist.map(add2Whitelist));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

