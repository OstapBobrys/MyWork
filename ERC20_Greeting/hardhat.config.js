require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  paths: {
    artifacts: './src/artifacts',
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    goerli: {
      url: `https://goerli.infura.io/v3/36c434c19a424afa99a5ca0929b3230d`,
      accounts: [`0xfdf58643b07e511563dcbb42b8388c85c5f667160a4138d0aa32074f957c923b`]
    },
  }
};
