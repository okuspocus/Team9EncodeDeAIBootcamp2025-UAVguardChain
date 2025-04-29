
Compile, deploy and tests contracts

node version > 20

```
npm install
npx hardhat node
#and on another terminal
npx hardhat compile
npx hardhat run scripts/deployDroneRegistry.js --network localhost
#or
npx hardhat test contracts-programs/tests/DroneRegistry.js  --network localhost
```

Diagram and specifications for smart contract to register a flight, subscribe to an insurance and clam insurance in case of incident

```
# Mapping

# Functions
registerFlight(droneId, timestamp, ipfsHash…)

# Events
FlightRegistered(pilot, flightId, blockNumber…)
```


