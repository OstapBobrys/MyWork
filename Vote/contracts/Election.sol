// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Election {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }
    
     mapping(address => bool) public voters;
     mapping(uint => Candidate) public candidates;

     uint public candidatesCount;

     event votedEvent (
        uint indexed _candidateId
    );

    constructor () public {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    function addCandidate (string memory _name) public {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function vote (uint _candidateId) public {
        require(!voters[msg.sender], "You have already voted!");
        require(_candidateId > 0 && _candidateId <= candidatesCount);
        voters[msg.sender] = true;
        candidates[_candidateId].voteCount ++;
        emit votedEvent(_candidateId);
    }
}


