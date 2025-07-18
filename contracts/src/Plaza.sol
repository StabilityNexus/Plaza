// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Plaza is ERC20, Ownable, ReentrancyGuard {
    enum ProjectStatus { ACTIVE, COMPLETED, CANCELLED }

    uint256 public constant PROTOCOL_FEE_PERCENTAGE = 3e4;
    address public constant protocolFeeReceiver = 0x599B4E3A27C6073E86a4b8dC2D7be92F74F7C232;

    string public projectName;
    string public projectDescription;
    int256 public latitude;
    int256 public longitude;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public targetAmount;
    uint256 public raisedAmount = 0;   // Total amount raised
    ProjectStatus public status;

    uint256 public constant PRECISION = 1e6;
    uint256 public participantCount;        // Total number of people who ever participated
    uint256 public volunteerCount;          // Current number of active volunteers
    uint256 public contributorCount;        // Total number of people who ever contributed
    uint256 public volunteeredSeconds;      // Total seconds volunteered by all users
    
    mapping(address => bool) public isVolunteering;
    mapping(address => uint256) public volunteerStartTimes;
    mapping(address => bool) public hasContributed;
    mapping(address => uint256) public contributionAmounts;
    mapping(address => uint256) public volunteerSecondsPerParticipant;  // Track volunteer seconds per participant
    mapping(address => bool) public isBlacklisted;                      // Blacklist mapping

    event VolunteerStarted(address indexed volunteer, uint256 startTime);
    event VolunteerEnded(address indexed volunteer, uint256 duration, uint256 tokensAwarded);
    event FundsContributed(address indexed contributor, uint256 amount, uint256 tokensAwarded);
    event ProjectStatusUpdated(ProjectStatus newStatus);
    event ProtocolFeeCollected(uint256 feeAmount);
    event ProtocolFeeReceiverUpdated(address indexed newReceiver);
    event FundsWithdrawn(uint256 amount);
    event ParticipantAdded(address indexed participant);
    event ParticipantBlacklisted(address indexed participant);
    event ParticipantUnblacklisted(address indexed participant);

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _projectName,
        string memory _projectDescription,
        int256 _latitude,
        int256 _longitude,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _targetAmount,
        address _owner
    ) ERC20(_name, _symbol) Ownable(_owner) {        
        projectName = _projectName; 
        projectDescription = _projectDescription; 
        latitude = _latitude; 
        longitude = _longitude; 
        startTime = _startTime; 
        endTime = _endTime; 
        targetAmount = _targetAmount; 
        status = ProjectStatus.ACTIVE; 
    } 

    /**
     * @dev Prevents direct ETH transfers to the contract.
     * Users must use the contribute() function to send funds.
     */
    receive() external payable {
        revert("Use contribute() to send funds");
    }

    /**
     * @dev Prevents fallback calls to the contract.
     * This ensures users can't accidentally send funds through fallback.
     */
    fallback() external payable {
        revert("Function does not exist");
    }

    modifier onlyActive() {
        require(status == ProjectStatus.ACTIVE, "Project is not active");
        require(block.timestamp >= startTime, "Project has not started");
        require(block.timestamp <= endTime, "Project has ended");
        _;
    }

    function startVolunteering(address participant) external onlyActive {
        require(!isBlacklisted[participant], "Participant is blacklisted");
        require(!isVolunteering[participant], "Already volunteering");
        
        if (balanceOf(participant) == 0 && !hasContributed[participant]) {
            participantCount++;
            emit ParticipantAdded(participant);
        }
        
        volunteerStartTimes[participant] = block.timestamp;
        isVolunteering[participant] = true;
        volunteerCount++;
        
        emit VolunteerStarted(participant, block.timestamp);
    }

    function endVolunteering(address participant) external nonReentrant {
        require(isVolunteering[participant], "Not currently volunteering");
        uint256 startTimeOfUser = volunteerStartTimes[participant];
        uint256 duration = block.timestamp - startTimeOfUser;
        
        uint256 tokensToMint = (duration * PRECISION) / 3600;
        
        isVolunteering[participant] = false;
        volunteerCount--;
        volunteeredSeconds += duration;
        volunteerSecondsPerParticipant[participant] += duration;  // Track individual volunteer seconds
        
        _mint(participant, tokensToMint);
        
        emit VolunteerEnded(participant, duration, tokensToMint);
    }

    function contribute() external payable onlyActive nonReentrant {
        require(targetAmount > 0, "Project does not accept funds");
        require(msg.value > 0, "Must contribute some amount");
        
        if (balanceOf(msg.sender) == 0 && !isVolunteering[msg.sender]) {
            participantCount++;
            emit ParticipantAdded(msg.sender);
        }
        
        if (!hasContributed[msg.sender]) {
            contributorCount++;
            hasContributed[msg.sender] = true;
        }

        contributionAmounts[msg.sender] += msg.value;      // Track individual contribution amount
        
        uint256 protocolFee = (msg.value * PROTOCOL_FEE_PERCENTAGE) / PRECISION;
        (bool feeSuccess, ) = protocolFeeReceiver.call{value: protocolFee}("");
        require(feeSuccess, "Protocol fee transfer failed");

        raisedAmount += msg.value;
        _mint(msg.sender, msg.value);        // Still minting tokens based on full contribution
        
        emit FundsContributed(msg.sender, msg.value, msg.value);
        emit ProtocolFeeCollected(protocolFee);
    }

    function withdrawFunds() external onlyOwner nonReentrant {
        uint256 balance = balance();
        require(balance > 0, "No funds to withdraw");
        
        (bool sent, ) = owner().call{value: balance}("");
        require(sent, "Failed to send funds");
        
        emit FundsWithdrawn(balance);
    }

    function updateProjectStatus(ProjectStatus _status) external onlyOwner {
        require(_status != status, "Status already set");
        status = _status;
        emit ProjectStatusUpdated(_status);
    }

    function blacklistParticipant(address participant) external onlyOwner {
        require(!isBlacklisted[participant], "Participant already blacklisted");        
        isBlacklisted[participant] = true;
        emit ParticipantBlacklisted(participant);
    }

    function unblacklistParticipant(address participant) external onlyOwner {
        require(isBlacklisted[participant], "Participant not blacklisted");
        isBlacklisted[participant] = false;
        emit ParticipantUnblacklisted(participant);
    }

    function balance() public view returns (uint256) {
        return address(this).balance;
    }

    function isFundingGoalReached() public view returns (bool) {
        return targetAmount <= raisedAmount;
    }
}

