// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Plaza is Ownable, ReentrancyGuard {
    string  public projectName;
    string  public projectDescription;
    int256  public latitude;
    int256  public longitude;

    bytes32 public merkleRoot;              // Root of the ticket-password-claimer Merkle tree
    uint256 public totalTickets;            // Total number of one-time passwords issued
    mapping(uint256 => bool) public ticketUsed;

    address[] public tokensDeposited;
    mapping(address => bool)    private tokensAvailable;
    mapping(address => uint256) public  tokenDeposits;

    uint256 public startTime;
    uint256 public endTime;

    event TokenDeposited( address indexed depositor, address indexed token, uint256 amount);
    event TokenClaimed(   address indexed claimer,   address indexed token, uint256 amount);
    event MerkleRootUpdated(bytes32 newRoot, uint256 totalTickets);
    event WindowUpdated(   uint256 startTime, uint256 endTime);
    event ProjectInfoUpdated( string  projectName, string  projectDescription, int256  latitude, int256  longitude );

    constructor() Ownable(msg.sender) {}

    modifier onlyActive() {
        require(block.timestamp >= startTime, "Not started");
        require(block.timestamp <= endTime,   "Already ended");
        _;
    }


    function initializePool(
        uint256  _startTime,
        uint256  _endTime,
        string  calldata _projectName,
        string  calldata _projectDescription,
        int256   _latitude,
        int256   _longitude
    ) external onlyOwner {
        require(_startTime < _endTime, "Bad window");

        startTime    = _startTime;
        endTime      = _endTime;
        emit WindowUpdated(_startTime, _endTime);

        projectName        = _projectName;
        projectDescription = _projectDescription;
        latitude           = _latitude;
        longitude          = _longitude;
        emit ProjectInfoUpdated(_projectName, _projectDescription, _latitude, _longitude);
    }

    function updateMerkleRoot( uint256 _totalTickets, bytes32 _merkleRoot) external onlyOwner {
        totalTickets = _totalTickets;
        merkleRoot   = _merkleRoot;
        emit MerkleRootUpdated(_merkleRoot, _totalTickets);
    }

    function updateWindow(uint256 _startTime, uint256 _endTime) external onlyOwner {
        require(_startTime < _endTime, "Bad window");
        startTime = _startTime;
        endTime   = _endTime;
        emit WindowUpdated(_startTime, _endTime);
    }

    function updateProjectInfo( string  calldata _projectName, string  calldata _projectDescription, int256   _latitude, int256   _longitude) external onlyOwner {
        projectName        = _projectName;
        projectDescription = _projectDescription;
        latitude           = _latitude;
        longitude          = _longitude;
        emit ProjectInfoUpdated(_projectName, _projectDescription, _latitude, _longitude);
    }

    function depositToken(IERC20 token, uint256 amount) external nonReentrant onlyActive
    {
        require(amount > 0, "Must deposit >0");
        address t = address(token);
        if (!tokensAvailable[t]) {
            tokensAvailable[t] = true;
            tokensDeposited.push(t);
        }
        token.transferFrom(msg.sender, address(this), amount);
        tokenDeposits[t] += amount;
        emit TokenDeposited(msg.sender, t, amount);
    }


    function claim( uint256 index,  bytes32 secret,  bytes32[] calldata proof,  address[] calldata tokensToClaim) external nonReentrant onlyActive {
        require(index < totalTickets, "Invalid index");

        // 1) Recompute leaf including caller's address
        bytes32 leaf = keccak256(abi.encodePacked(index, secret, msg.sender));

        // 2) Verify Merkle proof
        require(_verifyProof(proof, merkleRoot, leaf), "Bad proof");

        // 3) Ensure this ticket hasn't been used before
        require(!ticketUsed[index], "Ticket already spent");
        ticketUsed[index] = true;

        // 4) Transfer share of each requested token
        for (uint256 i = 0; i < tokensToClaim.length; i++) {
            address t = tokensToClaim[i];
            require(tokensAvailable[t], "Token not supported");

            uint256 total = tokenDeposits[t];
            uint256 share = total / totalTickets;
            require(share > 0, "No share available");

            IERC20(t).transfer(msg.sender, share);
            emit TokenClaimed(msg.sender, t, share);
        }
    }

    /// @notice Owner can withdraw any remaining tokens after pool end.
    function withdrawToken(IERC20 token, uint256 amount) external onlyOwner {
        token.transfer(owner(), amount);
    }

    // --- Internal proof verification ---
    function _verifyProof( bytes32[] memory proof, bytes32 root,bytes32 leaf ) internal pure returns (bool) {
        bytes32 hash = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 p = proof[i];
            hash = hash < p
                ? keccak256(abi.encodePacked(hash, p))
                : keccak256(abi.encodePacked(p, hash));
        }
        return hash == root;
    }

    /// @notice Returns the list of supported tokens
    function getSupportedTokens() external view returns (address[] memory) {
        return tokensDeposited;
    }
}
