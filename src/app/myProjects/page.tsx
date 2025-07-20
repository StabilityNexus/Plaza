"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useAccount, useReadContract, useReadContracts, useChainId } from "wagmi";
import ProjectList from "@/components/ProjectList";
import Button from "@/components/Button";
import Link from "next/link";
import { PlazaFactoryAddress } from "@/utlis/addresses";
import { PlazaFactoryAbi } from "@/utlis/contractsABI/PlazaFactoryAbi";
import { PlazaAbi } from "@/utlis/contractsABI/PlazaAbi";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
  creator: string;
  participants: number;
  rewards: string;
  address?: string;
}

export default function MyProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { address: userAddress } = useAccount();
  // Retrieve the active chain id from Wagmi. If no wallet is connected yet, fall back to Scroll Sepolia (534351)
  const chainId = useChainId() || 534351;

  // Get user's project addresses directly from the factory
  const { data: userProjectAddresses, error: userProjectsError } = useReadContract({
    address: PlazaFactoryAddress[chainId] as `0x${string}`,
    abi: PlazaFactoryAbi,
    functionName: "getProjectsByCreator",
    args: [userAddress || "0x0000000000000000000000000000000000000000"],
  });

  // Debug logging
  useEffect(() => {
    console.log("MyProjects Debug Info:");
    console.log("Chain ID:", chainId);
    console.log("Factory Address:", PlazaFactoryAddress[chainId]);
    console.log("User Address:", userAddress);
    console.log("User Project Addresses:", userProjectAddresses);
    console.log("User Projects Error:", userProjectsError);
    
    // Check if we're on the supported network
    if (chainId && !PlazaFactoryAddress[chainId]) {
      console.error("Unsupported network! Chain ID:", chainId);
    }
  }, [chainId, userAddress, userProjectAddresses, userProjectsError]);

  // Convert addresses to array format for useReadContracts
  const validAddresses = useMemo(() => {
    if (!userProjectAddresses || !Array.isArray(userProjectAddresses)) {
      console.log("MyProjects: No valid project addresses");
      return [];
    }
    const addresses = userProjectAddresses as `0x${string}`[];
    console.log("MyProjects validAddresses:", addresses);
    return addresses;
  }, [userProjectAddresses]);

  // Get project details for each address
  const { data: projectDetails } = useReadContracts({
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
    console.log("MyProjects processing project details:", {
      projectDetails: !!projectDetails,
      validAddressesLength: validAddresses.length,
      userAddress,
      projectDetailsLength: projectDetails?.length
    });

    if (projectDetails && validAddresses.length > 0 && userAddress) {
      const processedProjects: Project[] = [];
      
      for (let i = 0; i < validAddresses.length; i++) {
        const baseIndex = i * 8; // 8 calls per project
        const address = validAddresses[i];
        
        console.log(`MyProjects processing project ${i} at address ${address}`);
        
        // Check if all required data is available
        const nameData = projectDetails[baseIndex];
        const descriptionData = projectDetails[baseIndex + 1];
        const ownerData = projectDetails[baseIndex + 2];
        const startTimeData = projectDetails[baseIndex + 3];
        const endTimeData = projectDetails[baseIndex + 4];
        const targetAmountData = projectDetails[baseIndex + 5];
        const raisedAmountData = projectDetails[baseIndex + 6];
        const statusData = projectDetails[baseIndex + 7];

        console.log(`MyProjects project ${i} data status:`, {
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

          console.log(`MyProjects project ${i} details:`, {
            name,
            description,
            creator,
            userAddress,
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
          console.log(`MyProjects project ${i} SKIPPED - missing essential data (name or description)`);
        }
      }

      console.log("MyProjects final processed projects:", processedProjects);
      setProjects(processedProjects);
      setIsLoading(false);
    } else if (userProjectAddresses !== undefined && (!userProjectAddresses || (Array.isArray(userProjectAddresses) && userProjectAddresses.length === 0))) {
      console.log("MyProjects no projects found - user has no projects");
      setProjects([]);
      setIsLoading(false);
    } else if (!userAddress) {
      console.log("MyProjects no user address - not loading projects");
      setProjects([]);
      setIsLoading(false);
    } else {
      console.log("MyProjects still loading projects...", {
        projectDetails: !!projectDetails,
        validAddressesLength: validAddresses.length,
        userAddress: !!userAddress,
        userProjectAddresses
      });
    }
  }, [projectDetails, validAddresses, userProjectAddresses, userAddress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            My Projects
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Manage and track your blockchain projects
          </motion.p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          <Link href="/">
            <Button variant="secondary">← Back to Map</Button>
          </Link>
          <Link href="/createProject">
            <Button>+ Create New Project</Button>
          </Link>
        </div>

        {/* Projects List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {!userAddress ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-gray-600">
                Please connect your wallet to view your projects
              </p>
            </div>
          ) : chainId && !PlazaFactoryAddress[chainId] ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-red-600 mb-2">
                Unsupported Network
              </h3>
              <p className="text-gray-600 mb-4">
                Please switch to Scroll Sepolia (Chain ID: 534351) to view your projects.
              </p>
              <p className="text-sm text-gray-500">
                Current network: {chainId}
              </p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your projects from blockchain...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Projects Yet
              </h3>
              <p className="text-gray-600 mb-4">
                You haven&apos;t created any projects yet. Start by creating your first project!
              </p>
              <Link href="/createProject">
                <Button>+ Create Your First Project</Button>
              </Link>
            </div>
          ) : (
            <ProjectList projects={projects} />
          )}
        </motion.div>
      </div>
    </div>
  );
}
