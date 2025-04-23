// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DroneFlightRegistry {
    uint256 public flightCounter;

    struct Flight {
        uint256 id;
        address pilot;
        string droneModel;
        string location;
        uint256 timestamp;
    }

    mapping(uint256 => Flight) public flights;
    mapping(address => uint256[]) public flightsByPilot;

    event FlightRegistered(
        uint256 indexed id,
        address indexed pilot,
        string droneModel,
        string location,
        uint256 timestamp
    );

    function registerFlight(string memory _droneModel, string memory _location) external {
        flightCounter++;

        flights[flightCounter] = Flight({
            id: flightCounter,
            pilot: msg.sender,
            droneModel: _droneModel,
            location: _location,
            timestamp: block.timestamp
        });

        flightsByPilot[msg.sender].push(flightCounter);

        emit FlightRegistered(flightCounter, msg.sender, _droneModel, _location, block.timestamp);
    }

    function getFlight(uint256 _id) external view returns (Flight memory) {
        return flights[_id];
    }

    function getMyFlights() external view returns (uint256[] memory) {
        return flightsByPilot[msg.sender];
    }
}
