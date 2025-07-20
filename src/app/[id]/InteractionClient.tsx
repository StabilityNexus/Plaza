"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useAccount, useWalletClient } from "wagmi";
import { getPublicClient } from "@wagmi/core";
import { config } from "@/utlis/config";
import { PlazaAbi } from "@/utlis/contractsABI/PlazaAbi";
import Button from "@/components/Button";
import Link from "next/link";
import { formatEther, parseEther } from "viem";

export default function InteractionClient() {
  const searchParams = useSearchParams();
  const { address: userAddress } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Helper function to check if user address is valid
  const isValidUserAddress = (address: string | undefined): address is `0x${string}` => {
    return !!(address && address !== "0x0000000000000000000000000000000000000000" && address !== "0x0" && /^0x[a-fA-F0-9]{40}$/.test(address));
  };

  // Generic helper for validating any EVM address (non-zero & 40-hex-chars)
  const isValidAddress = (address: string | undefined): address is `0x${string}` => {
    return !!(address && /^0x[a-fA-F0-9]{40}$/.test(address) && !/^0x0{40}$/i.test(address));
  };

  const [chainId, setChainId] = useState<number>(0);
  const [projectAddress, setProjectAddress] = useState<`0x${string}`>("0x0");
  
  // Parse chainId and project from the query string
  useEffect(() => {
    const project = searchParams.get("project");
    const chain = searchParams.get("chainId");
    if (project && chain) {
      const parsedChainId = Number(chain);
      // Validate that the chain ID is supported
      if (parsedChainId === 534351) {
        setProjectAddress(project as `0x${string}`);
        setChainId(parsedChainId);
      } else {
        setError(`Unsupported chain ID: ${parsedChainId}. Only Scroll Sepolia (534351) is supported.`);
      }
    }
  }, [searchParams]);

  // Memoize the publicClient so it doesn't change every render
  const publicClient = useMemo(() => {
    if (!chainId) return null;
    return getPublicClient(config, { chainId: chainId as 534351 });
  }, [chainId]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Project info from the contract
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [projectOwner, setProjectOwner] = useState<`0x${string}`>("0x0");
  const [isVolunteering, setIsVolunteering] = useState(false);
  const [projectStatus, setProjectStatus] = useState<number>(0);
  const [targetAmount, setTargetAmount] = useState<bigint>(BigInt(0));
  const [raisedAmount, setRaisedAmount] = useState<bigint>(BigInt(0));
  const [contractBalance, setContractBalance] = useState<bigint>(BigInt(0));
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [volunteerCount, setVolunteerCount] = useState<number>(0);
  const [contributorCount, setContributorCount] = useState<number>(0);

  // Contribution form state
  const [contributionAmount, setContributionAmount] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<number>(0);

  // Contributor and volunteer details state
  const [lookupAddress, setLookupAddress] = useState("");
  const [lookupDetails, setLookupDetails] = useState<{
    address: string;
    contributionAmount: bigint;
    volunteerSeconds: bigint;
    hasContributed: boolean;
    isCurrentlyVolunteering: boolean;
    suggestedTokens: bigint;
    volunteerTokens: bigint;
    contributionTokens: bigint;
  } | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  
  // Current user details
  const [currentUserDetails, setCurrentUserDetails] = useState<{
    contributionAmount: bigint;
    volunteerSeconds: bigint;
    hasContributed: boolean;
    isCurrentlyVolunteering: boolean;
    suggestedTokens: bigint;
    volunteerTokens: bigint;
    contributionTokens: bigint;
  } | null>(null);

  // Format time to UTC 24-hour format
  const formatTimeUTC = (timestamp: number) => {
    if (!timestamp) return "Not set";
    const date = new Date(timestamp * 1000);
    return date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  };

  // Get status label
  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0: return "ACTIVE";
      case 1: return "COMPLETED";
      case 2: return "CANCELLED";
      default: return "UNKNOWN";
    }
  };

  // Get status color
  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return "text-green-600 bg-green-50";
      case 1: return "text-blue-600 bg-blue-50";
      case 2: return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  // Format volunteer time
  const formatVolunteerTime = (seconds: bigint) => {
    const totalSeconds = Number(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // Fetch project details, owner and current volunteering status
  useEffect(() => {
    if (!chainId || !publicClient || !isValidAddress(projectAddress)) return;

    async function fetchProjectDetails() {
      setLoading(true);
      setError(null);
      try {
        const [
          pName,
          pDesc,
          lat,
          lng,
          sTime,
          eTime,
          owner,
          volunteering,
          status,
          target,
          raised,
          balance,
          participants,
          volunteers,
          contributors
        ] = (await Promise.all([
          publicClient!.readContract({
            address: projectAddress,
            abi: PlazaAbi,
            functionName: "projectName",
          }),
          publicClient!.readContract({
            address: projectAddress,
            abi: PlazaAbi,
            functionName: "projectDescription",
          }),
          publicClient!.readContract({
            address: projectAddress,
            abi: PlazaAbi,
            functionName: "latitude",
          }),
          publicClient!.readContract({
            address: projectAddress,
            abi: PlazaAbi,
            functionName: "longitude",
          }),
          publicClient!.readContract({
            address: projectAddress,
            abi: PlazaAbi,
            functionName: "startTime",
          }),
          publicClient!.readContract({
            address: projectAddress,
            abi: PlazaAbi,
            functionName: "endTime",
          }),
          publicClient!.readContract({
            address: projectAddress,
            abi: PlazaAbi,
            functionName: "owner",
          }),
          publicClient!.readContract({
            address: projectAddress,
            abi: PlazaAbi,
            functionName: "isVolunteering",
            args: [userAddress || "0x0000000000000000000000000000000000000000"],
          }),
          publicClient!.readContract({
            address: projectAddress,
            abi: PlazaAbi,
            functionName: "status",
          }),
          publicClient!.readContract({
            address: projectAddress,
            abi: PlazaAbi,
            functionName: "targetAmount",
          }),
          publicClient!.readContract({
            address: projectAddress,
            abi: PlazaAbi,
            functionName: "raisedAmount",
          }),
          publicClient!.readContract({
            address: projectAddress,
            abi: PlazaAbi,
            functionName: "balance",
          }),
          publicClient!.readContract({
            address: projectAddress,
            abi: PlazaAbi,
            functionName: "participantCount",
          }),
          publicClient!.readContract({
            address: projectAddress,
            abi: PlazaAbi,
            functionName: "volunteerCount",
          }),
          publicClient!.readContract({
            address: projectAddress,
            abi: PlazaAbi,
            functionName: "contributorCount",
          }),
        ])) as [
          string,
          string,
          bigint,
          bigint,
          bigint,
          bigint,
          `0x${string}`,
          boolean,
          number,
          bigint,
          bigint,
          bigint,
          bigint,
          bigint,
          bigint
        ];

        setProjectName(pName);
        setProjectDescription(pDesc);
        setLatitude(Number(lat));
        setLongitude(Number(lng));
        setStartTime(Number(sTime));
        setEndTime(Number(eTime));
        setProjectOwner(owner);
        setIsVolunteering(volunteering);
        setProjectStatus(status);
        setTargetAmount(target);
        setRaisedAmount(raised);
        setContractBalance(balance);
        setParticipantCount(Number(participants));
        setVolunteerCount(Number(volunteers));
        setContributorCount(Number(contributors));
        setSelectedStatus(status);
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError("Failed to fetch project details. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchProjectDetails();
  }, [chainId, projectAddress, publicClient, userAddress]);

  // Fetch current user details
  useEffect(() => {
    if (!chainId || !publicClient || !isValidAddress(projectAddress) || !isValidUserAddress(userAddress)) return;

    async function fetchCurrentUserDetails() {
      try {
        const [
          contributionAmount,
          volunteerSeconds,
          hasContributed,
          isCurrentlyVolunteering,
          suggestedTokenData
        ] = await Promise.all([
          publicClient!.readContract({
            address: projectAddress,
            abi: PlazaAbi,
            functionName: "contributionAmounts",
            args: [userAddress],
          }),
          publicClient!.readContract({
            address: projectAddress,
            abi: PlazaAbi,
            functionName: "volunteerSecondsPerParticipant",
            args: [userAddress],
          }),
          publicClient!.readContract({
            address: projectAddress,
            abi: PlazaAbi,
            functionName: "hasContributed",
            args: [userAddress],
          }),
          publicClient!.readContract({
            address: projectAddress,
            abi: PlazaAbi,
            functionName: "isVolunteering",
            args: [userAddress],
          }),
          publicClient!.readContract({
            address: projectAddress,
            abi: PlazaAbi,
            functionName: "suggestTokenAmount",
            args: [userAddress],
          }),
        ]) as [bigint, bigint, boolean, boolean, [bigint, bigint, bigint]];

        setCurrentUserDetails({
          contributionAmount,
          volunteerSeconds,
          hasContributed,
          isCurrentlyVolunteering,
          suggestedTokens: suggestedTokenData[0],
          volunteerTokens: suggestedTokenData[1],
          contributionTokens: suggestedTokenData[2],
        });
      } catch (err) {
        console.error("Error fetching current user details:", err);
      }
    }

    fetchCurrentUserDetails();
  }, [chainId, projectAddress, publicClient, userAddress]);

  // Fetch details for a specific address
  const fetchAddressDetails = async (address: string) => {
    if (!chainId || !publicClient || !isValidAddress(projectAddress) || !isValidAddress(address as `0x${string}`)) {
      setLookupError("Invalid address provided");
      return;
    }

    setLookupLoading(true);
    setLookupError(null);
    
    try {
      const [
        contributionAmount,
        volunteerSeconds,
        hasContributed,
        isCurrentlyVolunteering,
        suggestedTokenData
      ] = await Promise.all([
        publicClient.readContract({
          address: projectAddress,
          abi: PlazaAbi,
          functionName: "contributionAmounts",
          args: [address as `0x${string}`],
        }),
        publicClient.readContract({
          address: projectAddress,
          abi: PlazaAbi,
          functionName: "volunteerSecondsPerParticipant",
          args: [address as `0x${string}`],
        }),
        publicClient.readContract({
          address: projectAddress,
          abi: PlazaAbi,
          functionName: "hasContributed",
          args: [address as `0x${string}`],
        }),
        publicClient.readContract({
          address: projectAddress,
          abi: PlazaAbi,
          functionName: "isVolunteering",
          args: [address as `0x${string}`],
        }),
        publicClient.readContract({
          address: projectAddress,
          abi: PlazaAbi,
          functionName: "suggestTokenAmount",
          args: [address as `0x${string}`],
        }),
      ]) as [bigint, bigint, boolean, boolean, [bigint, bigint, bigint]];

      setLookupDetails({
        address,
        contributionAmount,
        volunteerSeconds,
        hasContributed,
        isCurrentlyVolunteering,
        suggestedTokens: suggestedTokenData[0],
        volunteerTokens: suggestedTokenData[1],
        contributionTokens: suggestedTokenData[2],
      });
    } catch (err) {
      console.error("Error fetching address details:", err);
      setLookupError("Failed to fetch address details");
    } finally {
      setLookupLoading(false);
    }
  };

  // Handler for address lookup
  const handleAddressLookup = () => {
    if (!lookupAddress.trim()) {
      setLookupError("Please enter a valid address");
      return;
    }
    fetchAddressDetails(lookupAddress.trim());
  };

  // Handler to show current user details
  const handleShowCurrentUser = () => {
    if (!userAddress) {
      setLookupError("Please connect your wallet first");
      return;
    }
    setLookupAddress(userAddress);
    fetchAddressDetails(userAddress);
  };

  // Handler for contributing with form
  const handleContribute = async () => {
    if (!walletClient || !contributionAmount || !isValidUserAddress(userAddress) || !isValidAddress(projectAddress)) {
      setError("Please connect your wallet first.");
      return;
    }
    
    try {
      const amount = parseEther(contributionAmount);
      if (amount <= 0) {
        setError("Amount must be greater than zero.");
        return;
      }

      setTxLoading(true);
      setError(null);
      
      const tx = await walletClient.writeContract({
        address: projectAddress,
        abi: PlazaAbi,
        functionName: "contribute",
        args: [],
        value: amount,
      });
      
      console.log("Contribution successful:", tx);
      setContributionAmount("");
      // Refetch project details to update data
      window.location.reload();
    } catch (err) {
      console.error("Error contributing:", err);
      setError("Failed to contribute.");
    } finally {
      setTxLoading(false);
    }
  };

  const handleStartVolunteering = async () => {
    if (!walletClient || !isValidUserAddress(userAddress) || !isValidAddress(projectAddress)) {
      setError("Please connect your wallet first.");
      return;
    }
    setTxLoading(true);
    setError(null);
    try {
      const tx = await walletClient.writeContract({
        address: projectAddress,
        abi: PlazaAbi,
        functionName: "startVolunteering",
        args: [userAddress],
      });
      console.log("Started volunteering:", tx);
      window.location.reload();
    } catch (err) {
      console.error("Error starting volunteering:", err);
      setError("Failed to start volunteering.");
    } finally {
      setTxLoading(false);
    }
  };

  const handleEndVolunteering = async () => {
    if (!walletClient || !isValidUserAddress(userAddress) || !isValidAddress(projectAddress)) {
      setError("Please connect your wallet first.");
      return;
    }
    setTxLoading(true);
    setError(null);
    try {
      const tx = await walletClient.writeContract({
        address: projectAddress,
        abi: PlazaAbi,
        functionName: "endVolunteering",
        args: [userAddress],
      });
      console.log("Ended volunteering:", tx);
      window.location.reload();
    } catch (err) {
      console.error("Error ending volunteering:", err);
      setError("Failed to end volunteering.");
    } finally {
      setTxLoading(false);
    }
  };

  const handleWithdrawFunds = async () => {
    if (!walletClient || !isValidAddress(projectAddress)) return;
    setTxLoading(true);
    setError(null);
    try {
      const tx = await walletClient.writeContract({
        address: projectAddress,
        abi: PlazaAbi,
        functionName: "withdrawFunds",
        args: [],
      });
      console.log("Withdraw funds:", tx);
      window.location.reload();
    } catch (err) {
      console.error("Error withdrawing funds:", err);
      setError("Failed to withdraw funds.");
    } finally {
      setTxLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!walletClient || !isValidAddress(projectAddress)) return;
    if (selectedStatus === projectStatus) {
      setError("Please select a different status.");
      return;
    }
    
    setTxLoading(true);
    setError(null);
    try {
      const tx = await walletClient.writeContract({
        address: projectAddress,
        abi: PlazaAbi,
        functionName: "updateProjectStatus",
        args: [selectedStatus],
      });
      console.log("Updated project status:", tx);
      window.location.reload();
    } catch (err) {
      console.error("Error updating project status:", err);
      setError("Failed to update project status.");
    } finally {
      setTxLoading(false);
    }
  };

  // Loading and error states
  if (!isValidAddress(projectAddress)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Project</h1>
          <p className="text-gray-600 mb-6">No project address provided in URL parameters. Please use the format: /p?chainId=534351&project=0x...</p>
          <Link href="/">
            <Button>← Back to Map</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/">
            <Button>← Back to Map</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Determine if current user is owner of the project
  const isOwner =
    userAddress &&
    projectOwner &&
    userAddress.toLowerCase() === projectOwner.toLowerCase();

  const fundingProgress = targetAmount > 0 ? Number((raisedAmount * BigInt(100)) / targetAmount) : 0;

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              {projectName || "Loading..."}
            </h1>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(projectStatus)}`}>
              {getStatusLabel(projectStatus)}
            </div>
          </div>
        </div>

        {/* Project Description */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">📝 Project Description</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            {projectDescription || "Loading project description..."}
          </p>
        </div>

        {/* Funding Progress */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">💰 Funding Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Target Amount</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatEther(targetAmount)} ETH
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Raised Amount</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatEther(raisedAmount)} ETH
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Available Amount</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatEther(contractBalance)} ETH
              </p>
            </div>
          </div>

          {targetAmount > 0 && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-medium text-gray-700">{fundingProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Project Details */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">📋 Project Details</h2>
            
            <div className="space-y-4">
              <div>
                <span className="font-medium text-gray-700">📅 Start Time:</span>
                <p className="text-gray-600 mt-1">{formatTimeUTC(startTime)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">⏰ End Time:</span>
                <p className="text-gray-600 mt-1">{formatTimeUTC(endTime)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">📍 Location:</span>
                <p className="text-gray-600 mt-1">
                  Lat: {latitude}, Lng: {longitude}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">👤 Project Owner:</span>
                <p className="text-gray-600 font-mono text-sm mt-1 break-all">
                  {projectOwner}
                </p>
              </div>
            </div>

            {/* Participation Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{participantCount}</p>
                  <p className="text-sm text-gray-600">Participants</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{volunteerCount}</p>
                  <p className="text-sm text-gray-600">Active Volunteers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{contributorCount}</p>
                  <p className="text-sm text-gray-600">Contributors</p>
                </div>
              </div>
            </div>

            {/* Details Button */}
            <div className="mt-6">
              <Button
                onClick={() => setShowDetails(!showDetails)}
                variant="secondary"
                className="w-full"
              >
                {showDetails ? "Hide" : "Show"} Contributor & Volunteer Details
              </Button>
            </div>
          </div>

          {/* Actions Panel */}
          <div className="space-y-6">
            {/* Volunteering Status */}
            {isValidUserAddress(userAddress) && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🤝 Volunteering Status</h3>
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Your Status:</span>{" "}
                    {isVolunteering ? (
                      <span className="text-green-600 font-semibold">Currently Volunteering</span>
                    ) : (
                      <span className="text-gray-600">Not Volunteering</span>
                    )}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={handleStartVolunteering}
                    disabled={txLoading || isVolunteering || projectStatus !== 0}
                    variant="secondary"
                    className="flex-1"
                  >
                    {isVolunteering ? "Already Volunteering" : "Start Volunteering"}
                  </Button>
                  {isVolunteering && (
                    <Button
                      onClick={handleEndVolunteering}
                      disabled={txLoading}
                      variant="secondary"
                      className="flex-1"
                    >
                      End Volunteering
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Contribution Form */}
            {!isOwner && isValidUserAddress(userAddress) && isValidAddress(projectAddress) && targetAmount > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">💝 Make a Contribution</h3>
                                 <div className="space-y-4">
                   <div>
                     <label htmlFor="contribution" className="block text-sm font-medium text-gray-700 mb-2">
                       Amount (ETH)
                     </label>
                     <input
                       type="number"
                       id="contribution"
                       step="0.001"
                       min="0"
                       value={contributionAmount}
                       onChange={(e) => setContributionAmount(e.target.value)}
                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                       placeholder="0.1"
                       disabled={txLoading || projectStatus !== 0}
                     />
                   </div>
                   <Button
                     onClick={() => handleContribute()}
                     disabled={txLoading || !contributionAmount || projectStatus !== 0}
                     variant="secondary"
                     className="w-full"
                   >
                     {txLoading ? "Processing..." : "Contribute"}
                   </Button>
                 </div>
              </div>
            )}

            {/* Owner Controls */}
            {isOwner && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">⚙️ Owner Controls</h3>
                
                {/* Status Update */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Project Status
                  </label>
                  <div className="flex gap-3">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(Number(e.target.value))}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={txLoading}
                    >
                      <option value={0}>ACTIVE</option>
                      <option value={1}>COMPLETED</option>
                      <option value={2}>CANCELLED</option>
                    </select>
                    <Button
                      onClick={handleUpdateStatus}
                      disabled={txLoading || selectedStatus === projectStatus}
                      variant="secondary"
                    >
                      Update
                    </Button>
                  </div>
                </div>

                {/* Withdraw Funds */}
                                 <Button
                   onClick={handleWithdrawFunds}
                   disabled={txLoading || contractBalance === BigInt(0)}
                   variant="secondary"
                   className="w-full"
                 >
                   Withdraw Funds ({formatEther(contractBalance)} ETH)
                 </Button>
              </div>
            )}
          </div>
        </div>

        {/* Contributor and Volunteer Details */}
        {showDetails && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">👥 Contributor & Volunteer Details</h3>
            
            {/* Current User Details */}
            {isValidUserAddress(userAddress) && currentUserDetails && (
              <div className="mb-8 p-6 bg-blue-50 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-900 mb-4">Your Activity</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contribution Details */}
                  <div className="bg-white p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-3">💰 Contribution</h5>
                    {currentUserDetails.hasContributed ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Total Contributed:</span>{" "}
                          <span className="text-green-600 font-bold">
                            {formatEther(currentUserDetails.contributionAmount)} ETH
                          </span>
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Contribution Tokens:</span>{" "}
                          <span className="text-blue-600 font-bold">
                            {formatEther(currentUserDetails.contributionTokens)}
                          </span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No contributions yet</p>
                    )}
                  </div>

                  {/* Volunteer Details */}
                  <div className="bg-white p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-3">🤝 Volunteering</h5>
                    {currentUserDetails.volunteerSeconds > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Total Time:</span>{" "}
                          <span className="text-green-600 font-bold">
                            {formatVolunteerTime(currentUserDetails.volunteerSeconds)}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Volunteer Tokens:</span>{" "}
                          <span className="text-purple-600 font-bold">
                            {formatEther(currentUserDetails.volunteerTokens)}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Status:</span>{" "}
                          <span className={currentUserDetails.isCurrentlyVolunteering ? "text-green-600 font-semibold" : "text-gray-600"}>
                            {currentUserDetails.isCurrentlyVolunteering ? "Currently Volunteering" : "Not Currently Volunteering"}
                          </span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No volunteer time yet</p>
                    )}
                  </div>
                </div>

                {/* Suggested Tokens */}
                {currentUserDetails.suggestedTokens > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Total Suggested Tokens:</span>{" "}
                      <span className="text-blue-600 font-bold text-lg">
                        {formatEther(currentUserDetails.suggestedTokens)}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Address Lookup */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">🔍 Look Up Address Details</h4>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={lookupAddress}
                  onChange={(e) => setLookupAddress(e.target.value)}
                  placeholder="Enter address (0x...)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  disabled={lookupLoading}
                />
                <Button
                  onClick={handleAddressLookup}
                  disabled={lookupLoading || !lookupAddress.trim()}
                  variant="secondary"
                >
                  {lookupLoading ? "Loading..." : "Look Up"}
                </Button>
                {isValidUserAddress(userAddress) && (
                  <Button
                    onClick={handleShowCurrentUser}
                    disabled={lookupLoading}
                    variant="secondary"
                  >
                    Show My Details
                  </Button>
                )}
              </div>

              {lookupError && (
                <div className="text-red-600 text-sm mb-4 p-2 bg-red-50 rounded">
                  {lookupError}
                </div>
              )}
            </div>

            {/* Lookup Results */}
            {lookupDetails && (
              <div className="p-6 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  📊 Details for {lookupDetails.address}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contribution Info */}
                  <div className="bg-white p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-3">💰 Contribution Details</h5>
                    {lookupDetails.hasContributed ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Total Contributed:</span>{" "}
                          <span className="text-green-600 font-bold">
                            {formatEther(lookupDetails.contributionAmount)} ETH
                          </span>
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Contribution Tokens:</span>{" "}
                          <span className="text-blue-600 font-bold">
                            {formatEther(lookupDetails.contributionTokens)}
                          </span>
                        </p>
                        <p className="text-xs text-green-600 font-medium">✅ Has Contributed</p>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">
                        <p>❌ No contributions</p>
                      </div>
                    )}
                  </div>

                  {/* Volunteer Info */}
                  <div className="bg-white p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-3">🤝 Volunteer Details</h5>
                    {lookupDetails.volunteerSeconds > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Total Time:</span>{" "}
                          <span className="text-green-600 font-bold">
                            {formatVolunteerTime(lookupDetails.volunteerSeconds)}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Volunteer Tokens:</span>{" "}
                          <span className="text-purple-600 font-bold">
                            {formatEther(lookupDetails.volunteerTokens)}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Current Status:</span>{" "}
                          <span className={lookupDetails.isCurrentlyVolunteering ? "text-green-600 font-semibold" : "text-gray-600"}>
                            {lookupDetails.isCurrentlyVolunteering ? "Currently Volunteering" : "Not Currently Volunteering"}
                          </span>
                        </p>
                        <p className="text-xs text-green-600 font-medium">
                          {lookupDetails.isCurrentlyVolunteering ? "🟢 Active Volunteer" : "⭐ Past Volunteer"}
                        </p>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">
                        <p>❌ No volunteer time</p>
                        <p className="text-xs">
                          Status: {lookupDetails.isCurrentlyVolunteering ? "Currently volunteering but no time logged yet" : "Not volunteering"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total Suggested Tokens */}
                {lookupDetails.suggestedTokens > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <p className="text-center">
                      <span className="font-medium text-gray-700">Total Suggested Tokens: </span>
                      <span className="text-blue-600 font-bold text-xl">
                        {formatEther(lookupDetails.suggestedTokens)}
                      </span>
                    </p>
                  </div>
                )}

                {/* Summary */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 text-center">
                    {lookupDetails.hasContributed && lookupDetails.volunteerSeconds > 0
                      ? "🌟 This address has both contributed and volunteered!"
                      : lookupDetails.hasContributed
                      ? "💝 This address has contributed to the project"
                      : lookupDetails.volunteerSeconds > 0
                      ? "🤝 This address has volunteered for the project"
                      : "ℹ️ This address has not participated in the project yet"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transaction Status */}
        {txLoading && (
          <div className="text-center text-blue-600 animate-pulse mb-4">
            <div className="inline-flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Processing transaction...
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="text-center text-red-600 font-semibold mb-4 p-4 bg-red-50 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Connection Warning */}
        {!userAddress && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-center">Please connect your wallet to interact with this project.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
