// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DroneRegistry {
    uint256 public doneId;

    event registeredFlight(uint256 indexed droneId, address indexed registrant);

    constructor() {
        doneId = 0;
    }

    function registerFlight() public {
        doneId += 1;
        emit registeredFlight(doneId, msg.sender);
    }
}
