const PlazaFactory = {
  "abi": [
    {
      "type": "constructor",
      "inputs": [
        { "name": "initialOwner", "type": "address", "internalType": "address" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "allProjects",
      "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "outputs": [
        { "name": "", "type": "address", "internalType": "contract Plaza" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "createProject",
      "inputs": [
        { "name": "name", "type": "string", "internalType": "string" },
        { "name": "symbol", "type": "string", "internalType": "string" },
        { "name": "projectName", "type": "string", "internalType": "string" },
        {
          "name": "projectDescription",
          "type": "string",
          "internalType": "string"
        },
        { "name": "latitude", "type": "int256", "internalType": "int256" },
        { "name": "longitude", "type": "int256", "internalType": "int256" },
        { "name": "startTime", "type": "uint256", "internalType": "uint256" },
        { "name": "endTime", "type": "uint256", "internalType": "uint256" },
        { "name": "targetAmount", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "creatorToProjects",
      "inputs": [
        { "name": "", "type": "address", "internalType": "address" },
        { "name": "", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        { "name": "", "type": "address", "internalType": "contract Plaza" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "creatorToTotalProjects",
      "inputs": [
        { "name": "", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        { "name": "", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getProjectsByCreator",
      "inputs": [
        { "name": "_creator", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        { "name": "", "type": "address[]", "internalType": "contract Plaza[]" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "owner",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "projectCount",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "renounceOwnership",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "transferOwnership",
      "inputs": [
        { "name": "newOwner", "type": "address", "internalType": "address" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "OwnershipTransferred",
      "inputs": [
        {
          "name": "previousOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "newOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "ProjectCreated",
      "inputs": [
        {
          "name": "projectId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "projectAddress",
          "type": "address",
          "indexed": false,
          "internalType": "address"
        },
        {
          "name": "name",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        },
        {
          "name": "latitude",
          "type": "int256",
          "indexed": false,
          "internalType": "int256"
        },
        {
          "name": "longitude",
          "type": "int256",
          "indexed": false,
          "internalType": "int256"
        },
        {
          "name": "targetAmount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "error",
      "name": "OwnableInvalidOwner",
      "inputs": [
        { "name": "owner", "type": "address", "internalType": "address" }
      ]
    },
    {
      "type": "error",
      "name": "OwnableUnauthorizedAccount",
      "inputs": [
        { "name": "account", "type": "address", "internalType": "address" }
      ]
    }
  ]
}

export const PlazaFactoryAbi = PlazaFactory.abi;