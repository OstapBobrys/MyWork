const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Election", function () {
  let owner
  let acc1
  let acc2
  let election

  beforeEach(async function() {
    [owner, acc1, acc2] = await ethers.getSigners()

    const Election = await ethers.getContractFactory("Election", owner)
    election = await Election.deploy()
    await election.deployed()
    })
    it("Deploying with two candidate", async function() {
      const candidates = await election.candidatesCount()
      expect(candidates).to.eq(2)
    })
    it("Candidates with the correct values", async function () {
      const firstCandidate = await election.candidates(1)
      expect(firstCandidate[0]).to.eq(1)
      expect(firstCandidate[1]).to.eq("Candidate 1")
      expect(firstCandidate[2]).to.eq(0)

      const secondCandidate = await election.candidates(2)
      expect(secondCandidate[0]).to.eq(2)
      expect(secondCandidate[1]).to.eq("Candidate 2")
      expect(secondCandidate[2]).to.eq(0)
    })
    it("Allows a voted to cast a vote", async function() {
      let candidateId = 1
      const txVote = await election.connect(acc1).vote(candidateId)
      await expect(txVote)
            .to.emit(election, 'votedEvent')
            .withArgs(candidateId)

      const votesCount = await election.candidates(candidateId)
      expect(votesCount[2]).to.eq(1)

      const voteBool = await election.voters(acc1.address)
      expect(voteBool).to.eq(true)

      await expect(
        election.connect(acc1).
        vote(candidateId) 
        ).to.be.revertedWith("You have already voted!")

        const txVote2 = await election.connect(acc2).vote(candidateId)
      await expect(txVote2)
            .to.emit(election, 'votedEvent')
            .withArgs(candidateId)

      const votesCount2 = await election.candidates(candidateId)
      expect(votesCount2[2]).to.eq(2)

      const voteBool2 = await election.voters(acc2.address)
      expect(voteBool2).to.eq(true)

      await expect(
        election.connect(acc2).
        vote(candidateId) 
        ).to.be.revertedWith("You have already voted!")
    })
    it("Allows add candidate", async function() {
      const add = await election.addCandidate("Valera")
      const candidates = await election.candidatesCount()
      expect(candidates).to.eq(3)

      const trirdCandidate = await election.candidates(3)
      expect(trirdCandidate[0]).to.eq(3)
      expect(trirdCandidate[1]).to.eq("Valera")
      expect(trirdCandidate[2]).to.eq(0)
    })
  })
