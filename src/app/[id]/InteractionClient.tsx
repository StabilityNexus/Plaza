"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { getPublicClient } from "@wagmi/core";
import { config } from "@/utlis/config";
import { PlazaAbi } from "@/utlis/contractsABI/PlazaAbi";

export default function InteractionClient() {
  const searchParams = useSearchParams();
  const { address: userAddress } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [chainId, setChainId] = useState<number>(0);
  const [projectAddress, setProjectAddress] = useState<`0x${string}`>("0x0");

  // Parse chainId and projectId from the query string
  useEffect(() => {
    const project = searchParams.get("projectId");
    const chain = searchParams.get("chainId");
    if (project && chain) {
      setProjectAddress(project as `0x${string}`);
      setChainId(Number(chain));
    }
  }, [searchParams]);

  // Memoize the publicClient so it doesn’t change every render
  const publicClient = useMemo(() => {
    if (!chainId) return null;
    return getPublicClient(config as any, { chainId });
  }, [chainId]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Project info from the contract
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [projectOwner, setProjectOwner] = useState<`0x${string}`>("");
  const [isVolunteering, setIsVolunteering] = useState(false);

  // Fetch project details, owner and current volunteering status
  useEffect(() => {
    if (!chainId || !projectAddress || !publicClient) return;

    async function fetchProjectDetails() {
      setLoading(true);
      setError(null);
      try {
        const [pName, pDesc, lat, lng, sTime, eTime, owner, volunteering] =
          (await Promise.all([
            publicClient.readContract({
              address: projectAddress,
              abi: PlazaAbi,
              functionName: "projectName",
            }),
            publicClient.readContract({
              address: projectAddress,
              abi: PlazaAbi,
              functionName: "projectDescription",
            }),
            publicClient.readContract({
              address: projectAddress,
              abi: PlazaAbi,
              functionName: "latitude",
            }),
            publicClient.readContract({
              address: projectAddress,
              abi: PlazaAbi,
              functionName: "longitude",
            }),
            publicClient.readContract({
              address: projectAddress,
              abi: PlazaAbi,
              functionName: "startTime",
            }),
            publicClient.readContract({
              address: projectAddress,
              abi: PlazaAbi,
              functionName: "endTime",
            }),
            publicClient.readContract({
              address: projectAddress,
              abi: PlazaAbi,
              functionName: "owner",
            }),
            publicClient.readContract({
              address: projectAddress,
              abi: PlazaAbi,
              functionName: "isVolunteering",
              args: [userAddress],
            }),
          ])) as [
            string,
            string,
            bigint,
            bigint,
            bigint,
            bigint,
            `0x${string}`,
            boolean
          ];

        setProjectName(pName);
        setProjectDescription(pDesc);
        setLatitude(Number(lat));
        setLongitude(Number(lng));
        setStartTime(Number(sTime));
        setEndTime(Number(eTime));
        setProjectOwner(owner);
        setIsVolunteering(volunteering);
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError("Failed to fetch project details. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchProjectDetails();
  }, [chainId, projectAddress, publicClient, userAddress]);

  // Handler to prompt for contribution amount and call contribute()
  // Handler for starting contribution (volunteering)
  const handleStartVolunteering = async () => {
    if (!walletClient || !projectAddress) return;
    // Ask the user for the contribution amount (in wei)
    const amountInput = prompt(
      "Enter the amount (in wei) you would like to contribute:"
    );
    if (!amountInput) return;
    let amount: bigint;
    try {
      amount = BigInt(amountInput);
      if (amount <= 0) {
        alert("Amount must be greater than zero.");
        return;
      }
    } catch {
      alert("Invalid amount.");
      return;
    }

    setTxLoading(true);
    setError(null);
    try {
      // Call the contribute function without arguments,
      // but pass the entered amount as msg.value.
      const tx = await walletClient.writeContract({
        address: projectAddress,
        abi: PlazaAbi,
        functionName: "contribute",
        args: [], // no arguments are passed since the contract uses msg.value
        value: amount,
      });
      console.log("Contribution successful:", tx);
    } catch (err) {
      console.error("Error contributing:", err);
      setError("Failed to contribute.");
    } finally {
      setTxLoading(false);
    }
  };

  const handleEndVolunteering = async () => {
    if (!walletClient || !projectAddress) return;
    setTxLoading(true);
    setError(null);
    try {
      const tx = await walletClient.writeContract({
        address: projectAddress,
        abi: PlazaAbi,
        functionName: "endVolunteering",
        args: [],
      });
      console.log("Ended volunteering:", tx);
    } catch (err) {
      console.error("Error ending volunteering:", err);
      setError("Failed to end volunteering.");
    } finally {
      setTxLoading(false);
    }
  };

  const handleWithdrawFunds = async () => {
    if (!walletClient || !projectAddress) return;
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
    } catch (err) {
      console.error("Error withdrawing funds:", err);
      setError("Failed to withdraw funds.");
    } finally {
      setTxLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!walletClient || !projectAddress) return;
    const newStatusStr = prompt(
      "Enter new status: 0 for ACTIVE, 1 for COMPLETED, 2 for CANCELLED"
    );
    if (newStatusStr === null) return;
    const newStatus = Number(newStatusStr);
    if (![0, 1, 2].includes(newStatus)) {
      alert("Invalid status.");
      return;
    }
    setTxLoading(true);
    setError(null);
    try {
      const tx = await walletClient.writeContract({
        address: projectAddress,
        abi: PlazaAbi,
        functionName: "updateProjectStatus",
        args: [newStatus],
      });
      console.log("Updated project status:", tx);
    } catch (err) {
      console.error("Error updating project status:", err);
      setError("Failed to update project status.");
    } finally {
      setTxLoading(false);
    }
  };

  // --- RENDER STATES ---
  if (!projectAddress) {
    return (
      <div className="min-h-screen bg-[#0E1624] text-white flex items-center justify-center">
        <p className="text-gray-300">No project address provided.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E1624] text-white flex items-center justify-center">
        <p className="text-gray-300">Loading project details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0E1624] text-white flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Determine if current user is owner of the project
  const isOwner =
    userAddress &&
    projectOwner &&
    userAddress.toLowerCase() === projectOwner.toLowerCase();

  // --- MAIN UI ---
  return (
    <div className="min-h-screen bg-[#0E1624] text-white">
      {/* Page Header */}
      <header className="border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Project Details</h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Project Details Card */}
        <div className="bg-[#1B2430] border border-gray-700 rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {projectName || "Untitled Project"}
          </h2>

          <p className="text-gray-300 mb-2">
            <span className="font-medium text-white">Start:</span>{" "}
            {new Date(startTime * 1000).toLocaleString()}
          </p>
          <p className="text-gray-300 mb-2">
            <span className="font-medium text-white">End:</span>{" "}
            {new Date(endTime * 1000).toLocaleString()}
          </p>
          <p className="text-gray-300 mb-2">
            <span className="font-medium text-white">Latitude:</span> {latitude}
          </p>
          <p className="text-gray-300 mb-2">
            <span className="font-medium text-white">Longitude:</span>{" "}
            {longitude}
          </p>
          <p className="text-gray-300 mt-4">
            <span className="font-medium text-white">Description:</span>{" "}
            {projectDescription}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
          {isOwner ? (
            <>
              <button
                onClick={handleUpdateStatus}
                disabled={txLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
              >
                Update Status
              </button>
              <button
                onClick={handleWithdrawFunds}
                disabled={txLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
              >
                Withdraw Funds
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleStartVolunteering}
                disabled={txLoading || isVolunteering}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
              >
                Start Contributing
              </button>
              <button
                onClick={handleEndVolunteering}
                disabled={txLoading || !isVolunteering}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
              >
                End Contributing
              </button>
            </>
          )}
        </div>

        {txLoading && (
          <div className="mt-4 text-center text-yellow-400">
            Processing transaction...
          </div>
        )}

        {error && <div className="mt-4 text-center text-red-500">{error}</div>}
      </main>
    </div>
  );
}
