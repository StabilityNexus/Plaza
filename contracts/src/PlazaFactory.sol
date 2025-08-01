// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Plaza.sol";

contract PlazaFactory is Ownable {
    mapping(address => Plaza[]) public creatorToProjects;
    mapping(address => uint256) public creatorToTotalProjects;

    Plaza[] public allProjects;
    uint256 public projectCount;

    event ProjectCreated(
        uint256 indexed projectId,
        address indexed creator,
        address projectAddress,
        string  projectName,
        string  projectDescription,
        int256  latitude,
        int256  longitude,
        uint256 startTime,
        uint256 endTime,
        uint256 totalTickets,
        bytes32 merkleRoot
    );

    constructor() {}

    function createProject( string calldata projectName, string calldata projectDescription, int256  latitude, int256  longitude, uint256 startTime, uint256 endTime, uint256 totalTickets) external returns (address) {
        projectCount++;
        Plaza project = new Plaza();

        project.initializePool( startTime, endTime, totalTickets, projectName, projectDescription, latitude, longitude);
        project.transferOwnership(msg.sender);

        allProjects.push(project);
        creatorToProjects[msg.sender].push(project);
        creatorToTotalProjects[msg.sender]++;

        emit ProjectCreated(projectCount,msg.sender, address(project), projectName, projectDescription, latitude, longitude, startTime, endTime, totalTickets, merkleRoot);
        return address(project);
    }

    /// @notice Retrieve all projects created by a given address
    function getProjectsByCreator(address _creator)
        external
        view
        returns (Plaza[] memory)
    {
        return creatorToProjects[_creator];
    }
}
