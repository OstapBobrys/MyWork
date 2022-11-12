const hre = require("hardhat");
const ethers = hre.ethers
const transfersArtifact = require('../artifacts/contracts/transfer.sol/transfers.json')

async function currentBalance(address, msg = '') {
    const rawBalance = await ethers.provider.getBalance(address)
    console.log(msg, ethers.utils.formatEther(rawBalance))
}

async function main() {
    const [acc1, acc2] = await ethers.getSigners()
    const contractAddr = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    const transfersContract = new ethers.Contract(
        contractAddr,
        transfersArtifact.abi,
        acc1
    )

    // const tx = {
    //     to: contractAddr,
    //     value: ethers.utils.parseEther('1')
    // }

    // const txSend = await acc2.sendTransaction(tx)
    // await txSend.wait()

    
//     const result = await transfersContract.getTransfer(0)
//     console.log(result)
const result = await transfersContract.withdrawTo(acc2.address)
console.log(result)
await currentBalance(acc2.address, 'Account 2 balance:')
await currentBalance(contractAddr, 'Contract balance:')
}



main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
