// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    mapping(bytes32 => bool) public hasVoted;
    uint256 public voteCount;

    function vote(bytes32 fingerprint) public {
        require(!hasVoted[fingerprint], "Already voted.");
        hasVoted[fingerprint] = true;
        voteCount++;
    }
}