"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { getPublicClient } from "@wagmi/core";
import { config } from "@/utlis/config";
import { PlazaAbi } from "@/utlis/contractsABI/PlazaAbi";
import Image from "next/image";
import Logo from "@/components/logo";

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
    <div className="min-h-screen bg-[#0E1624] text-white flex flex-col items-center py-8 px-4 relative">
      <header className="absolute top-0 left-0 px-6 py-4 flex items-center justify-between">
        <Logo />
      </header>
      {/* Page Header */}
      <header className="border-b border-gray-700 w-full max-w-4xl px-6 py-4 flex items-center justify-between mt-12">
        <h1 className="text-3xl font-bold text-[#5DA3FA]">Project Details</h1>
      </header>

      <div className="relative md:max-w-[700px] md:min-w-[500px] min-w-full max-w-full gradient-border p-[2px] rounded-3xl mt-8">
        <main className="w-full min-h-[400px] bg-[#0E1624] backdrop-blur-[4px] rounded-3xl shadow-card lg:p-10 p-5">
          {/* Project Details Card */}
          <h2 className="text-2xl font-semibold text-[#F5F7FA] mb-20 text-center">
            {projectName || "Untitled Project"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400">
            <p>
              <span className="font-medium text-white">📅 Start:</span>{" "}
              {new Date(startTime * 1000).toLocaleString()}
            </p>
            <p>
              <span className="font-medium text-white">⏳ End:</span>{" "}
              {new Date(endTime * 1000).toLocaleString()}
            </p>
            <p>
              <span className="font-medium text-white">📍 Latitude:</span>{" "}
              {latitude}
            </p>
            <p>
              <span className="font-medium text-white">📍 Longitude:</span>{" "}
              {longitude}
            </p>
          </div>

          <p className="text-gray-400 mt-12 text-center text-lg leading-relaxed ">
            <span className="font-medium text-white">📖 Description:</span>{" "}
            {projectDescription}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row justify-center items-center mt-6 space-y-4 md:space-y-0 md:space-x-4">
            {isOwner ? (
              <>
                <button
                  onClick={handleUpdateStatus}
                  disabled={txLoading}
                  className="lg:px-6 px-4 py-2 lg:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300"
                >
                  Update Status
                </button>
                <button
                  onClick={handleWithdrawFunds}
                  disabled={txLoading}
                  className="lg:px-6 px-4 py-2 lg:py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition duration-300"
                >
                  Withdraw Funds
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleStartVolunteering}
                  disabled={txLoading || isVolunteering}
                  className=" px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-300 lg:text-lg text-base"
                >
                  Start Contributing
                </button>
                <button
                  onClick={handleEndVolunteering}
                  disabled={txLoading || !isVolunteering}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition duration-300 lg:text-lg text-base"
                >
                  End Contributing
                </button>
              </>
            )}
          </div>

          {/* Status Messages */}
          {txLoading && (
            <div className="mt-4 text-center text-yellow-400 animate-pulse">
              ⏳ Processing transaction...
            </div>
          )}

          {error && (
            <div className="mt-4 text-center text-red-500 font-semibold">
              ⚠️ {error}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
