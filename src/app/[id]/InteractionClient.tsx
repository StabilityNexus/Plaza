"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { getPublicClient } from "@wagmi/core";
import { config } from "@/utlis/config";
import { PlazaAbi } from "@/utlis/contractsABI/PlazaAbi";

export default function InteractionClient() {
  const searchParams = useSearchParams();
  const { address: userAddress } = useAccount();

  const [chainId, setChainId] = useState<number>(0);
  const [vaultAddress, setProjectAddress] = useState<`0x${string}`>("0x0");

  // Parse chainId and projectId from the query string
  const chainIdParam = searchParams.get("chainId");
  const projectAddressParam = searchParams.get("projectId");

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
  const [error, setError] = useState<string | null>(null);

  // Project info from the contract
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);

  useEffect(() => {
    // Only fetch if we have a valid chainId, project address, and client
    if (!chainId || !projectAddressParam || !publicClient) return;

    async function fetchProjectDetails() {
      setLoading(true);
      setError(null);
      try {
        // Reading multiple contract variables in parallel
        const [pName, pDesc, lat, lng, sTime, eTime] = (await Promise.all([
          publicClient?.readContract({
            address: projectAddressParam as `0x${string}`,
            abi: PlazaAbi,
            functionName: "projectName",
          }),
          publicClient?.readContract({
            address: projectAddressParam as `0x${string}`,
            abi: PlazaAbi,
            functionName: "projectDescription",
          }),
          publicClient?.readContract({
            address: projectAddressParam as `0x${string}`,
            abi: PlazaAbi,
            functionName: "latitude",
          }),
          publicClient?.readContract({
            address: projectAddressParam as `0x${string}`,
            abi: PlazaAbi,
            functionName: "longitude",
          }),
          publicClient?.readContract({
            address: projectAddressParam as `0x${string}`,
            abi: PlazaAbi,
            functionName: "startTime",
          }),
          publicClient?.readContract({
            address: projectAddressParam as `0x${string}`,
            abi: PlazaAbi,
            functionName: "endTime",
          }),
        ])) as [string, string, bigint, bigint, bigint, bigint];

        setProjectName(pName);
        setProjectDescription(pDesc);
        setLatitude(Number(lat));
        setLongitude(Number(lng));
        setStartTime(Number(sTime));
        setEndTime(Number(eTime));
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError("Failed to fetch project details. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchProjectDetails();
  }, [chainId, projectAddressParam, publicClient]);

  // --- RENDER STATES ---
  if (!projectAddressParam) {
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

  // --- MAIN UI ---
  return (
    <div className="min-h-screen bg-[#0E1624] text-white">
      {/* Page Header */}
      <header className="border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Project Details</h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Card container */}
        <div className="bg-[#1B2430] border border-gray-700 rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold text-white mb-4">
            {projectName || "Untitled Project"}
          </h2>

          {/* Start / End Time */}
          <p className="text-gray-300 mb-2">
            <span className="font-medium text-white">Start:</span>{" "}
            {new Date(startTime * 1000).toLocaleString()}
          </p>
          <p className="text-gray-300 mb-2">
            <span className="font-medium text-white">End:</span>{" "}
            {new Date(endTime * 1000).toLocaleString()}
          </p>

          {/* Lat / Long */}
          <p className="text-gray-300 mb-2">
            <span className="font-medium text-white">Latitude:</span> {latitude}
          </p>
          <p className="text-gray-300 mb-2">
            <span className="font-medium text-white">Longitude:</span>{" "}
            {longitude}
          </p>

          {/* Description */}
          <p className="text-gray-300 mt-4">
            <span className="font-medium text-white">Description:</span>{" "}
            {projectDescription}
          </p>
        </div>
      </main>
    </div>
  );
}
