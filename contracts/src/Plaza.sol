// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Plaza is ERC20, Ownable, ReentrancyGuard {
    enum ProjectType { VOLUNTEER_HOURS, FUNDRAISING }
    enum ProjectStatus { ACTIVE, COMPLETED, CANCELLED }

    // Project metadata as individual public variables
    string public projectName;
    string public projectDescription;
    int256 public latitude;
    int256 public longitude;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public targetAmount;    // For fundraising projects
    uint256 public raisedAmount;    // Current amount raised
    ProjectType public projectType;
    ProjectStatus public status;

    
    // Other public variables
    uint256 public constant PRECISION = 1e6;
    uint256 public volunteeredSeconds;  // Total volunteered seconds
    mapping(address => uint256) public volunteerStartTimes;
    mapping(address => bool) public isVolunteering;

    event VolunteerStarted(address indexed volunteer, uint256 startTime);
    event VolunteerEnded(address indexed volunteer, uint256 duration, uint256 tokensAwarded);
    event FundsContributed(address indexed contributor, uint256 amount, uint256 tokensAwarded);
    event ProjectStatusUpdated(ProjectStatus newStatus);

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
        ProjectType _projectType,
        address _owner
    ) ERC20(_name, _symbol) Ownable(_owner) {
        projectName = _projectName;
        projectDescription = _projectDescription;
        latitude = _latitude;
        longitude = _longitude;
        startTime = _startTime;
        endTime = _endTime;
        targetAmount = _targetAmount;
        raisedAmount = 0;
        projectType = _projectType;
        status = ProjectStatus.ACTIVE;
    }

    modifier onlyActive() {
        require(status == ProjectStatus.ACTIVE, "Project is not active");
        require(block.timestamp >= startTime, "Project has not started");
        require(block.timestamp <= endTime, "Project has ended");
        _;
    }

    function startVolunteering() external onlyActive {
        require(projectType == ProjectType.VOLUNTEER_HOURS, "Not a volunteer project");
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

    function contribute() external payable onlyActive {
        require(projectType == ProjectType.FUNDRAISING, "Not a fundraising project");
        require(msg.value > 0, "Must contribute some amount");
        
        raisedAmount += msg.value;
        _mint(msg.sender, msg.value);
        
        emit FundsContributed(msg.sender, msg.value, msg.value);
        
        if (raisedAmount >= targetAmount) {
            status = ProjectStatus.COMPLETED;
            emit ProjectStatusUpdated(ProjectStatus.COMPLETED);
        }
    }

    function updateProjectStatus(ProjectStatus _status) external onlyOwner {
        require(_status != status, "Status already set");
        status = _status;
        emit ProjectStatusUpdated(_status);
    }

    function withdrawFunds() external onlyOwner {
        require(projectType == ProjectType.FUNDRAISING, "Not a fundraising project");
        require(status == ProjectStatus.COMPLETED, "Project not completed");
        
        uint256 balance = address(this).balance;
        (bool sent, ) = owner().call{value: balance}("");
        require(sent, "Failed to send funds");
    }
}