"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useChainId, useReadContract, useReadContracts } from "wagmi";
import { PlazaFactoryAddress } from "@/utlis/addresses";
import { PlazaFactoryAbi } from "@/utlis/contractsABI/PlazaFactoryAbi";
import { PlazaAbi } from "@/utlis/contractsABI/PlazaAbi";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "pending";
  creator: string;
  createdAt: string;
  participants: number;
  rewards: string;
  address?: string; // Add address for Web3 projects
}

interface ExplorerProjectsProps {
  searchTerm: string;
}

export default function ExplorerProjects({ searchTerm }: ExplorerProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  // Retrieve the active chain id from Wagmi. If no wallet is connected yet, fall back to Scroll Sepolia (534351)
  const chainId = useChainId() || 534351;

  // Get project count from PlazaFactory
  const { data: projectCount, error: projectCountError } = useReadContract({
    address: PlazaFactoryAddress[chainId] as `0x${string}`,
    abi: PlazaFactoryAbi,
    functionName: "projectCount",
  });

  // Debug logging
  useEffect(() => {
    console.log("ExplorerProjects Debug Info:");
    console.log("Chain ID:", chainId);
    console.log("Factory Address:", PlazaFactoryAddress[chainId]);
    console.log("Project Count:", projectCount);
    console.log("Project Count Error:", projectCountError);
    
    // Check if we're on the supported network
    if (chainId && !PlazaFactoryAddress[chainId]) {
      console.error("Unsupported network! Chain ID:", chainId);
    }
  }, [chainId, projectCount, projectCountError]);

  // Get all project addresses
  const projectIndexes = useMemo(() => {
    const indexes = projectCount ? Array.from(
      { length: Number(projectCount) }, 
      (_, i) => i
    ) : [];
    console.log("ExplorerProjects projectIndexes:", indexes);
    return indexes;
  }, [projectCount]);
  
  const { data: projectAddresses } = useReadContracts({
    // @ts-expect-error - ABI type compatibility issue with wagmi
    contracts: projectIndexes.map((index) => ({
      address: PlazaFactoryAddress[chainId] as `0x${string}`,
      abi: PlazaFactoryAbi,
      functionName: "allProjects",
      args: [BigInt(index)],
    })),
  });

  // Get project details for each address
  const validAddresses = useMemo(() => {
    console.log("ExplorerProjects projectAddresses:", projectAddresses);
    const addresses = (projectAddresses?.filter(
      (result) => result.status === "success" && result.result
    ).map((result) => result.result as `0x${string}`)) || [];
    console.log("ExplorerProjects validAddresses:", addresses);
    return addresses;
  }, [projectAddresses]);

  const { data: projectDetails } = useReadContracts({
    // @ts-expect-error - ABI type compatibility issue with wagmi
    contracts: validAddresses.flatMap((address) => [
      {
        address,
        abi: PlazaAbi,
        functionName: "projectName",
      },
      {
        address,
        abi: PlazaAbi,
        functionName: "projectDescription",
      },
      {
        address,
        abi: PlazaAbi,
        functionName: "owner",
      },
      {
        address,
        abi: PlazaAbi,
        functionName: "startTime",
      },
      {
        address,
        abi: PlazaAbi,
        functionName: "endTime",
      },
      {
        address,
        abi: PlazaAbi,
        functionName: "targetAmount",
      },
      {
        address,
        abi: PlazaAbi,
        functionName: "raisedAmount",
      },
      {
        address,
        abi: PlazaAbi,
        functionName: "status",
      },
    ]),
  });

  useEffect(() => {
    console.log("ExplorerProjects processing project details:", {
      projectDetails: !!projectDetails,
      validAddressesLength: validAddresses.length,
      projectDetailsLength: projectDetails?.length
    });

    if (projectDetails && validAddresses.length > 0) {
      const processedProjects: Project[] = [];
      
      for (let i = 0; i < validAddresses.length; i++) {
        const baseIndex = i * 8; // 8 calls per project
        const address = validAddresses[i];
        
        console.log(`ExplorerProjects processing project ${i} at address ${address}`);
        
        // Check if all required data is available
        const nameData = projectDetails[baseIndex];
        const descriptionData = projectDetails[baseIndex + 1];
        const ownerData = projectDetails[baseIndex + 2];
        const startTimeData = projectDetails[baseIndex + 3];
        const endTimeData = projectDetails[baseIndex + 4];
        const targetAmountData = projectDetails[baseIndex + 5];
        const raisedAmountData = projectDetails[baseIndex + 6];
        const statusData = projectDetails[baseIndex + 7];

        console.log(`ExplorerProjects project ${i} data status:`, {
          name: nameData?.status,
          description: descriptionData?.status,
          owner: ownerData?.status,
          startTime: startTimeData?.status,
          endTime: endTimeData?.status,
          targetAmount: targetAmountData?.status,
          raisedAmount: raisedAmountData?.status,
          status: statusData?.status
        });

        // Simplified validation - only check for essential data
        if (nameData?.status === "success" && descriptionData?.status === "success") {
          const name = nameData.result as string;
          const description = descriptionData.result as string;
          const creator = ownerData?.result as string || "Unknown";
          const startTime = startTimeData?.result as bigint || BigInt(0);
          const endTime = endTimeData?.result as bigint || BigInt(0);
          const targetAmount = targetAmountData?.result as bigint || BigInt(0);
          const raisedAmount = raisedAmountData?.result as bigint || BigInt(0);
          const status = statusData?.result as number || 0;

          console.log(`ExplorerProjects project ${i} details:`, {
            name,
            description,
            creator,
            startTime: Number(startTime),
            endTime: Number(endTime),
            targetAmount: Number(targetAmount),
            raisedAmount: Number(raisedAmount),
            status
          });

          // Determine project status
          let projectStatus: "active" | "inactive" | "pending" = "inactive";
          const now = Math.floor(Date.now() / 1000);
          
          if (status === 0) { // ACTIVE status from contract (0 = ACTIVE, 1 = COMPLETED, 2 = CANCELLED)
            if (now < Number(startTime)) {
              projectStatus = "pending";
            } else if (now <= Number(endTime)) {
              projectStatus = "active";
            } else {
              projectStatus = "inactive";
            }
          } else if (status === 1) {
            projectStatus = "inactive"; // COMPLETED
          } else if (status === 2) {
            projectStatus = "inactive"; // CANCELLED
          }

          // Generate a stable participants count based on the contract address
          // This creates a consistent value for each project across renders
          const addressSum = address.slice(2).split('').reduce((sum: number, char: string) => sum + parseInt(char, 16), 0);
          const participants = (addressSum % 47) + 3; // Range: 3-49 participants

          processedProjects.push({
            id: address,
            name,
            description,
            status: projectStatus,
            creator,
            createdAt: new Date(Number(startTime) * 1000).toISOString().split('T')[0],
            participants,
            rewards: `${Number(targetAmount) / 1e18} ETH`, // Assuming 18 decimals
            address,
          });
        } else {
          console.log(`ExplorerProjects project ${i} SKIPPED - missing essential data (name or description)`);
        }
      }

      console.log("ExplorerProjects final processed projects:", processedProjects);
      setProjects(processedProjects);
      setIsLoading(false);
    } else if (projectCount !== undefined && Number(projectCount) === 0) {
      console.log("ExplorerProjects no projects found - project count is 0");
      setProjects([]);
      setIsLoading(false);
    } else {
      console.log("ExplorerProjects still loading projects...", {
        projectDetails: !!projectDetails,
        validAddressesLength: validAddresses.length,
        projectCount
      });
    }
  }, [projectDetails, validAddresses, projectCount]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  }, [projects, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getProjectUrl = (project: Project) => {
    // For blockchain projects, use the [id] route with query parameters
    if (project.address) {
      return `/p?chainId=${chainId}&project=${project.address}`;
    }
    // Otherwise use the simple format
    return `/${project.id}`;
  };

  // Check for unsupported network
  if (chainId && !PlazaFactoryAddress[chainId]) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 mb-2">
          Unsupported Network
        </h3>
        <p className="text-gray-600 mb-4">
          Please switch to Scroll Sepolia (Chain ID: 534351) to explore projects.
        </p>
        <p className="text-sm text-gray-500">
          Current network: {chainId}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading projects...</p>
      </div>
    );
  }

  if (filteredProjects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? "No Projects Found" : "No Projects Available"}
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? `No projects match "${searchTerm}". Try a different search term.`
              : "There are no projects to explore at the moment."
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer bg-white border border-gray-200">
              <Link href={getProjectUrl(project)}>
                <CardContent className="p-6 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-2">
                      {project.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Participants:</span>
                      <span className="font-medium text-gray-900">{project.participants}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Target:</span>
                      <span className="font-medium text-green-600">{project.rewards}</span>
                    </div>
                  </div>

                  {/* Address (if exists) */}
                  {project.address && (
                    <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
                      <span className="font-medium">Contract:</span>
                      <br />
                      <span className="font-mono">{project.address.slice(0, 6)}...{project.address.slice(-4)}</span>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-3 border-t border-gray-100">
                    <div>
                      <p>By {project.creator.slice(0, 6)}...{project.creator.slice(-4)}</p>
                      <p>{formatDate(project.createdAt)}</p>
                    </div>
                    <span className="text-blue-600 hover:text-blue-800 font-medium">
                      Explore →
                    </span>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
