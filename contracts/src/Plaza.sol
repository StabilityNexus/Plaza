// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Plaza is ERC20, Ownable, ReentrancyGuard {
    enum ProjectStatus { ACTIVE, COMPLETED, CANCELLED }

    uint256 public constant PROTOCOL_FEE_PERCENTAGE = 3e4;
    address public protocolFeeReceiver;

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
    uint256 public volunteeredSeconds;  // Total volunteered seconds
    mapping(address => uint256) public volunteerStartTimes;
    mapping(address => bool) public isVolunteering;

    event VolunteerStarted(address indexed volunteer, uint256 startTime);
    event VolunteerEnded(address indexed volunteer, uint256 duration, uint256 tokensAwarded);
    event FundsContributed(address indexed contributor, uint256 amount, uint256 tokensAwarded);
    event ProjectStatusUpdated(ProjectStatus newStatus);
    event ProtocolFeeCollected(uint256 feeAmount);
    event ProtocolFeeReceiverUpdated(address indexed newReceiver);
    event FundsWithdrawn(uint256 amount);

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
        address _owner,
        address _protocolFeeReceiver
    ) ERC20(_name, _symbol) Ownable(_owner) {
        require(_protocolFeeReceiver != address(0), "Invalid protocol fee receiver");
        
        projectName = _projectName; 
        projectDescription = _projectDescription; 
        latitude = _latitude; 
        longitude = _longitude; 
        startTime = _startTime; 
        endTime = _endTime; 
        targetAmount = _targetAmount; 
        status = ProjectStatus.ACTIVE; 
        protocolFeeReceiver = _protocolFeeReceiver; 
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

    function startVolunteering() external onlyActive {
        require(!isVolunteering[msg.sender], "Already volunteering");
        
        volunteerStartTimes[msg.sender] = block.timestamp;
        isVolunteering[msg.sender] = true;
        
        emit VolunteerStarted(msg.sender, block.timestamp);
    }

    function endVolunteering() external nonReentrant {
        require(isVolunteering[msg.sender], "Not currently volunteering");
        uint256 startTimeOfUser = volunteerStartTimes[msg.sender];
        uint256 duration = block.timestamp - startTimeOfUser;
        
        uint256 tokensToMint = (duration * PRECISION) / 3600;
        
        isVolunteering[msg.sender] = false;
        volunteeredSeconds += duration;
        
        _mint(msg.sender, tokensToMint);
        
        emit VolunteerEnded(msg.sender, duration, tokensToMint);
    }

    function contribute() external payable onlyActive nonReentrant {
        require(targetAmount > 0, "Project does not accept funds");
        require(msg.value > 0, "Must contribute some amount");
        
        uint256 protocolFee = (msg.value * PROTOCOL_FEE_PERCENTAGE) / PRECISION;
        
        // Sending protocol fee to fee receiver
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

    function updateProtocolFeeReceiver(address _newReceiver) external onlyOwner {
        require(_newReceiver != address(0), "Invalid protocol fee receiver");
        protocolFeeReceiver = _newReceiver;
        emit ProtocolFeeReceiverUpdated(_newReceiver);
    }

    function balance() public view returns (uint256) {
        return address(this).balance;
    }

    function isFundingGoalReached() public view returns (bool) {
        return targetAmount <= raisedAmount;
    }
}