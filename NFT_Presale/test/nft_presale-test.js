const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Presale", function () {
  let owner
  let nft
  let user
  let user2
  let user3
 

  beforeEach(async function() {
    [owner, user, user2, user3] = await ethers.getSigners()

    const NFT = await ethers.getContractFactory("NFT", owner)
    nft = await NFT.deploy(
      "Bonita",
      "BON",
      "http/revealNFT",
      "http/notrevealNFT"
    )
    await nft.deployed()
    })

    it("correct NFT data", async function() {
      expect(await nft.name()).to.eq("Bonita")
      expect(await nft.symbol()).to.eq("BON")
      expect(await nft.baseURI()).to.eq("http/revealNFT")
      expect(await nft.cost()).to.eq(ethers.utils.parseEther("1"))
      expect(await nft.maxSupply()).to.eq(1000)
      expect(await nft.nftPerAddressLimit()).to.eq(3)
      expect(await nft.totalSupply()).to.eq(0)
    })

    it("correct owner", async function() {
      const curretOwner = await nft.owner()
      expect(curretOwner).to.eq(owner.address)
  })

    it("allows to mint by owner", async function() {
      await nft.mint(2)
      const balance = await nft.balanceOf(owner.address)
      expect(balance).to.eq(2)

      const ownerNft = await nft.ownerOf(1)
      expect(ownerNft).to.eq(owner.address)

      expect(await nft.totalSupply()).to.eq(2)

      const nftOnWallet = await nft.walletOfOwner(owner.address)
      expect(nftOnWallet[0]).to.eq(1)
      expect(nftOnWallet[1]).to.eq(2)
    })

    it("allows to mint user", async function() {
      await nft.mint(2)
      expect( await nft.onlyWhitelisted()).to.eq(true)

      await nft.whitelistUsers([user.address, user2.address])
      expect(await nft.isWhitelisted(user.address)).to.eq(true)
      expect(await nft.isWhitelisted(user2.address)).to.eq(true)

      expect(await nft.whitelistedAddresses(0)).to.eq(user.address)
      expect(await nft.whitelistedAddresses(1)).to.eq(user2.address)

      await nft.connect(user).mint(2, {value: ethers.utils.parseEther("2")})
      expect( await nft.connect(user).balanceOf(user.address)).to.eq(2)
      expect( await nft.ownerOf(4)).to.eq(user.address)
      expect( await nft.totalSupply()).to.eq(4)
      const nftUser = await nft.walletOfOwner(user.address)
      expect(nftUser[0]).to.eq(3)
      expect(nftUser[1]).to.eq(4)

      await nft.connect(user2).mint(1, {value: ethers.utils.parseEther("1")})
      expect( await nft.balanceOf(user2.address)).to.eq(1)
      expect( await nft.ownerOf(5)).to.eq(user2.address)
      expect( await nft.totalSupply()).to.eq(5)
      const nftUser2 = await nft.walletOfOwner(user2.address)
      expect(nftUser2[0]).to.eq(5)

      await expect(
        nft.mint(0, {value: ethers.utils.parseEther("2")})
         ).to.be.revertedWith("need to mint at least 1 NFT")

         await expect(
          nft.connect(user).mint(4, {value: ethers.utils.parseEther("4")})
           ).to.be.revertedWith("max NFT per address exceeded")

           await expect(
            nft.mint(999, {value: ethers.utils.parseEther("999")})
             ).to.be.revertedWith("max NFT limit exceeded")

             await expect(
              nft.connect(user3).mint(1, {value: ethers.utils.parseEther("1")})
               ).to.be.revertedWith("user is not whitelisted")

               await expect(
                nft.connect(user).mint(1, {value: ethers.utils.parseEther("0")})
                 ).to.be.revertedWith("insufficient funds")

                 await expect(
                  nft.connect(user).whitelistUsers([user.address, user2.address])
                  ).to.be.revertedWith("Ownable: caller is not the owner")

  })

    it("can't mint after pause", async function() {
      await nft.pause(true)

      await expect(
        nft.mint(2, {value: ethers.utils.parseEther("2")})
         ).to.be.revertedWith("the contract is paused")

      await expect(
        nft.connect(user).pause(true)
        ).to.be.revertedWith("Ownable: caller is not the owner")
    })

    it("allows mint all user (notWhitelisted)", async function() {
      await nft.setOnlyWhitelisted(false)
      expect( await nft.onlyWhitelisted()).to.eq(false)
      await nft.connect(user).mint(2, {value: ethers.utils.parseEther("2")})

      await expect(
        nft.connect(user).setOnlyWhitelisted(false)
        ).to.be.revertedWith("Ownable: caller is not the owner")
    })

    it("correct tokenUri and reveal", async function() {
      await nft.mint(2)
      expect( await nft.revealed()).to.eq(false)
      expect( await nft.notRevealedUri()).to.eq("http/notrevealNFT")
      expect( await nft.tokenURI(1)).to.eq("http/notrevealNFT")

      await nft.reveal()
      expect( await nft.baseURI()).to.eq("http/revealNFT")
      expect( await nft.revealed()).to.eq(true)
      expect( await nft.tokenURI(2)).to.eq("http/revealNFT2.json")
      
      await expect(
        nft.tokenURI(3)
        ).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token")

        await expect(
          nft.connect(user).reveal()
          ).to.be.revertedWith("Ownable: caller is not the owner")
    })

    it("Set NFT per address limit, cost, base extansion", async function() {
      await nft.whitelistUsers([user.address, user2.address])
      await nft.setNftPerAddressLimit(5)
      await nft.connect(user).mint(5, {value: ethers.utils.parseEther("5")})

      await nft.setCost(ethers.utils.parseEther("2"))
      await nft.connect(user2).mint(5, {value: ethers.utils.parseEther("10")})

      await nft.setBaseExtension(".patsso")
      await nft.reveal()
      expect( await nft.tokenURI(2)).to.eq("http/revealNFT2.patsso")

      await expect(
        nft.connect(user).setNftPerAddressLimit(5)
        ).to.be.revertedWith("Ownable: caller is not the owner")

        await expect(
          nft.connect(user).setCost(ethers.utils.parseEther("2"))
          ).to.be.revertedWith("Ownable: caller is not the owner")

          await expect(
            nft.connect(user).setBaseExtension(".patsso")
            ).to.be.revertedWith("Ownable: caller is not the owner")

            await expect(
              nft.connect(user).setBaseURI("http/yourNFT")
              ).to.be.revertedWith("Ownable: caller is not the owner")

              await expect(
                nft.connect(user).setNotRevealedURI("http/zeroNFT")
                ).to.be.revertedWith("Ownable: caller is not the owner")
    })
    it("correct withdraw", async function() {
      await nft.whitelistUsers([user.address, user2.address])
      await nft.setNftPerAddressLimit(5)
      await nft.connect(user).mint(5, {value: ethers.utils.parseEther("5")})

      const withdrawTx = await nft.withdraw()
      await expect(() => withdrawTx).to.changeEtherBalance(owner, ethers.utils.parseEther("5"))

      await expect(
        nft.connect(user).withdraw()
        ).to.be.revertedWith("Ownable: caller is not the owner")
    })
})
