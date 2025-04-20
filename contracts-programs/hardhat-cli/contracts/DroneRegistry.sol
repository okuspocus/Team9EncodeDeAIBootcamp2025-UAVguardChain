// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DroneRegistry {
    uint256 public droneId;

    event RegisteredFlight(uint256 indexed droneId, address indexed registrant);

    constructor() {
        droneId = 0;
    }

    function registerFlight() public {
        droneId += 1;
        emit RegisteredFlight(droneId, msg.sender);
    }
}
