const { ethers } = require("hardhat");

async function main() {
    [deployer] = await ethers.getSigners();

    const Bank = await ethers.getContractFactory("Bank", deployer);
    const bankContract = await Bank.deploy()

    const Matic = await ethers.getContractFactory("Matic", deployer);
    const maticContract = await Matic.deploy()
    const Shib = await ethers.getContractFactory("Shib", deployer);
    const shiba = await Shib.deploy()
    const Usdt = await ethers.getContractFactory("Usdt", deployer);
    const usdtContract = await Usdt.deploy()

    await bankContract.deployed()
    await maticContract.deployed()
    await shiba.deployed()
    await usdtContract.deployed()

    await bankContract.whitelistToken(
        ethers.utils.formatBytes32String('Matic'),
        maticContract.address
    );
    await bankContract.whitelistToken(
        ethers.utils.formatBytes32String('Shib'),
        shiba.address
    );
    await bankContract.whitelistToken(
        ethers.utils.formatBytes32String('Usdt'),
        usdtContract.address
    );
    await bankContract.whitelistToken(
        ethers.utils.formatBytes32String('Eth'),
        '0x4B7ee45f30767F36f06F79B32BF1FCa6f726DEda'
    )

    console.log("Bank deployed to:", bankContract.address, "by", deployer.address)
    console.log("Matic deployed to:", maticContract.address, "by", deployer.address)
    console.log("Shib deployed to:", shiba.address, "by", deployer.address)
    console.log("Usdt deployed to:", usdtContract.address, "by", deployer.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
