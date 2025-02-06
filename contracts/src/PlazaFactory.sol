// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import { Plaza } from "./Plaza.sol";

contract PlazaFactory is Ownable {
    struct Region {
        uint256[] projectIds;
        mapping(uint256 => bool) containsProject;
    }

    mapping(uint256 => Plaza) public projects;
    mapping(bytes32 => Region) private regions;

    uint256 public projectCount;

    event ProjectCreated(
        uint256 indexed projectId,
        address projectAddress,
        string name,
        int256 latitude,
        int256 longitude,
        Plaza.ProjectType projectType
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
        uint256 targetAmount,
        Plaza.ProjectType projectType
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
            projectType,
            msg.sender
        );

        projects[projectCount] = newProject;

        // Index project in region
        bytes32 regionKey = getRegionKey(latitude, longitude);
        Region storage region = regions[regionKey];
        region.projectIds.push(projectCount);
        region.containsProject[projectCount] = true;

        emit ProjectCreated(
            projectCount,
            address(newProject),
            projectName,
            latitude,
            longitude,
            projectType
        );

        return address(newProject);
    }

    function getProjectsByRegion(
        int256 latitude,
        int256 longitude
    ) external view returns (uint256[] memory) {
        bytes32 regionKey = getRegionKey(latitude, longitude);
        return regions[regionKey].projectIds;
    }

    function getProjectAddress(
        uint256 projectId
    ) external view returns (address) {
        require(
            projectId > 0 && projectId <= projectCount,
            "Invalid project ID"
        );
        return address(projects[projectId]);
    }

    // Helper function to generate region key (groups projects by ~1.1km)
    function getRegionKey(
        int256 latitude,
        int256 longitude
    ) public pure returns (bytes32) {
        int256 roundedLat = latitude / 10000; // Group by 0.01 degrees
        int256 roundedLon = longitude / 10000;
        return keccak256(abi.encodePacked(roundedLat, roundedLon));
    }
}
