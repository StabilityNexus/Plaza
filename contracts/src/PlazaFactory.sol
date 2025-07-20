// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import { Plaza } from "./Plaza.sol";

contract PlazaFactory is Ownable {
    
    mapping(address => Plaza[]) public creatorToProjects;
    mapping(address => uint256) public creatorToTotalProjects;

    Plaza[] public allProjects;
    uint256 public projectCount;

    event ProjectCreated(
        uint256 indexed projectId,
        address projectAddress,
        string name,
        int256 latitude,
        int256 longitude,
        uint256 targetAmount
    );

    constructor(address initialOwner) Ownable(initialOwner) {}

    function createProject(
        string memory name,
        string memory symbol,
        string memory projectName,
        string memory projectDescription,
        int256 latitude,
        int256 longitude,
        uint256 startTime,
        uint256 endTime,
        uint256 targetAmount
    ) external returns (address) {
        projectCount++;

        Plaza newProject = new Plaza(
            name,
            symbol,
            projectName,
            projectDescription,
            latitude,
            longitude,
            startTime,
            endTime,
            targetAmount,
            msg.sender
        );

        allProjects.push(newProject);
        totalProjects++;
        creatorToProjects[msg.sender].push(newProject);
        creatorToTotalProjects[msg.sender]++;

        emit ProjectCreated(
            projectCount,
            address(newProject),
            projectName,
            latitude,
            longitude,
            targetAmount
        );

        return address(newProject);
    }
    
    function getProjectsByCreator(address _creator) external view returns (Plaza[] memory) {
        return creatorToProjects[_creator];
    }
}
