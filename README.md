# Team9EncodeDeAIBootcamp2025-UAVguardChain
Bootcamp final project

<img width="1547" alt="droneAI_web3" src="https://github.com/user-attachments/assets/c2cb6c88-33d7-4ac7-83f6-8299de165e24" />

## Step-by-Step Description

### The user/pilot opens the app
The system (with AI agents) requests all necessary flight information:  
drone specifications, flight plan, date, time, duration, location, etc.

### AI validates and prepares flight registration
The AI agent checks data consistency and completeness.

It may suggest recommendations to comply with regulations (if applicable).

### Public blockchain registration
The AI sends flight data to the registration smart contract on the blockchain.

A unique identifier is generated and stored immutably, making it universally accessible.

### Option to purchase decentralized insurance
The AI offers the user the option to buy a decentralized insurance policy for the flight.

It collects relevant information and facilitates the payment in cryptocurrency via the insurance smart contract.

Once completed, the blockchain records the transaction, and the user receives digital proof of coverage.

### Claims process (in case of an incident)
If an incident/accident occurs, the user files a claim within the app.

The AI gathers evidence (flight data, photos, location, witness statements, etc.)  
and submits it to the claims smart contract.

The blockchain registers the claim and opens a “challenge” period during which  
other agents (or humans) can contest or verify the information to prevent fraud.

### Review and compensation
If the claim is uncontested (or valid after a failed challenge), the smart contract releases compensation to the pilot.

If the claim is contested and proven invalid, no compensation is issued.

The final resolution (payment or rejection) is recorded on the blockchain.
    
![UAVguardCHAIN-2025-04-13-112304](https://github.com/user-attachments/assets/68d13bef-0298-40ea-a368-436e306d7c2a)


Architecture:

       +------------------------------------------+
       |               User Interface             |
       |              (Next.js Frontend)          |
       +------------------------------------------+
                         | 
                         v
          +--------------------------------------------+
          |               Backend Server               |
          |           (Node.js API / Python)           |
          +--------------------------------------------+
               |                     |                   |
               v                     v                   v
     +------------------+   +---------------------+    +---------------------+
     |     AI Agent     |   |   Blockchain Layer   |    |     RAG System      |
     | (LangChain /     |   | (Solidity Smart      |    | (LangChain /        |
     |  LlamaIndex)     |   |  Contracts)          |    |  LlamaIndex)        |
     +------------------+   +---------------------+    +---------------------+
         |                |                         |       
         v                v                         v
       +-------------------+  +--------------------+   +-------------------------+
       | Flight Data Store  |  | Flight Registry    |   | Insurance Smart         |
       | (Text File / DB)   |  | Contract (Solidity)|   | Contract (Solidity)     |
       +-------------------+  +--------------------+   +-------------------------+
                                   |                         |
                                   v                         v
                             +---------------------+   +-------------------------+
                             | Claims Smart        |   | Transaction Confirmation |
                             | Contract (Solidity) |   | (Blockchain interaction) |
                             +---------------------+   +-------------------------+
/*
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

*/
I will be explaining this project in details that is the smart contract
1 we have the license Identifier
2 We have our state variable which this allows users to access it
3 Then we have our our User defined variable event that is used to be able call out the value emit in to regulate the movement in the smart contact or what the Engineer is doing
//  event RegisteredFlight(uint256 indexed droneId, //address indexed registrant);
6 Then to create a constructor that is  called only one for the owner
7 Then the function that we called a local variable that was assigned to a value  
//  function registerFlight() public {
  //      droneId += 1;
        emit RegisteredFlight(droneId, msg.sender);
  //  }
  Then we have to emit to tell the user that will be using the Dapp that we have only the droneID and the him/her as the owner.



