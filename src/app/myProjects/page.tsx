"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { getPublicClient } from "@wagmi/core";
import { motion } from "framer-motion";
import Link from "next/link";

import { PlazaAbi } from "@/utlis/contractsABI/PlazaAbi";
import { PlazaFactoryAbi } from "@/utlis/contractsABI/PlazaFactoryAbi";
import { PlazaFactoryAddress } from "@/utlis/addresses";
import { config } from "@/utlis/config";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectList from "@/components/ProjectList";
import { ConnectButton } from "@rainbow-me/rainbowkit";

enum ProjectStatus {
  ACTIVE = 0,
  COMPLETED = 1,
  CANCELLED = 2,
}

type ProjectData = {
  id: number;
  address: `0x${string}`;
  projectName: string;
  startTime: number;
  endTime: number;
  status: ProjectStatus;
};

export default function MyProjects() {
  const { address: userAddress } = useAccount();
  const chainId = config.state.chainId;

  // Memoize publicClient so it doesn't cause repeated re-renders
  const publicClient = useMemo(() => {
    return getPublicClient(config as any, { chainId });
  }, [chainId]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upcomingProjects, setUpcomingProjects] = useState<ProjectData[]>([]);
  const [ongoingProjects, setOngoingProjects] = useState<ProjectData[]>([]);
  const [pastProjects, setPastProjects] = useState<ProjectData[]>([]);

  useEffect(() => {
    // Only fetch projects if the wallet is connected.
    console.log(userAddress);
    if (!userAddress) return;

    async function fetchProjects() {
      setLoading(true);
      setError(null);
      try {
        // Fetch all projects created by the connected user.
        const creatorProjects = (await publicClient.readContract({
          address: PlazaFactoryAddress[chainId] as `0x${string}`,
          abi: PlazaFactoryAbi,
          functionName: "getProjectsByCreator",
          args: [userAddress],
        })) as `0x${string}[]`;


        console.log(creatorProjects);

        const allProjects: ProjectData[] = [];
        // Loop over each project address from the creator mapping.
        for (let i = 0; i < creatorProjects.length; i++) {
          const projectAddress = creatorProjects[i];

          // Fetch project details from each Plaza contract.
          const [projectName, startTime, endTime, rawStatus] =
            (await Promise.all([
              publicClient.readContract({
                address: projectAddress as `0x${string}`,
                abi: PlazaAbi,
                functionName: "projectName",
              }),
              publicClient.readContract({
                address: projectAddress as `0x${string}`,
                abi: PlazaAbi,
                functionName: "startTime",
              }),
              publicClient.readContract({
                address: projectAddress as `0x${string}`,
                abi: PlazaAbi,
                functionName: "endTime",
              }),
              publicClient.readContract({
                address: projectAddress as `0x${string}`,
                abi: PlazaAbi,
                functionName: "status",
              }),
            ])) as [string, bigint, bigint, number];

          allProjects.push({
            id: i+1,
            address: projectAddress as `0x${string}`,
            projectName,
            startTime: Number(startTime),
            endTime: Number(endTime),
            status: rawStatus,
          });
        }

        // Classify projects as upcoming, ongoing, or past.
        const now = Math.floor(Date.now() / 1000);
        const upcoming: ProjectData[] = [];
        const ongoing: ProjectData[] = [];
        const past: ProjectData[] = [];

        for (const p of allProjects) {
          if (
            p.status === ProjectStatus.COMPLETED ||
            p.status === ProjectStatus.CANCELLED
          ) {
            past.push(p);
          } else {
            // For ACTIVE projects, classify by dates.
            if (now < p.startTime) {
              upcoming.push(p);
            } else if (now >= p.startTime && now <= p.endTime) {
              ongoing.push(p);
            } else {
              ongoing.push(p);
            }
          }
        }

        setUpcomingProjects(upcoming);
        setOngoingProjects(ongoing);
        setPastProjects(past);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to fetch projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [userAddress, publicClient, chainId]);

  return (
    <div className="min-h-screen bg-[#0E1624] text-white">
      {/* Header */}
      <header className="border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Projects</h1>
        <ConnectButton />
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* If wallet is not connected, show a message */}
        {!userAddress && (
          <div className="mt-4">
            <p className="text-gray-300">
              Connect wallet to see your projects.
            </p>
          </div>
        )}

        {/* When wallet is connected */}
        {userAddress && (
          <>
            {loading ? (
              <div className="mt-4">
                <p className="text-gray-300">Loading projects...</p>
              </div>
            ) : error ? (
              <div className="mt-4 text-red-500">
                <p>{error}</p>
              </div>
            ) : (
              <Tabs defaultValue="ongoing" className="w-full mt-4">
                {/* TabsList */}
                <TabsList className="bg-gray-800 p-1 rounded-md flex space-x-1">
                  <TabsTrigger
                    value="past"
                    className="flex-1 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md"
                  >
                    Past
                  </TabsTrigger>
                  <TabsTrigger
                    value="ongoing"
                    className="flex-1 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md"
                  >
                    Ongoing
                  </TabsTrigger>
                  <TabsTrigger
                    value="upcoming"
                    className="flex-1 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md"
                  >
                    Upcoming
                  </TabsTrigger>
                </TabsList>

                {/* TabsContent */}
                <TabsContent value="ongoing" className="mt-6">
                  <ProjectList projects={ongoingProjects} />
                </TabsContent>
                <TabsContent value="upcoming" className="mt-6">
                  <ProjectList projects={upcomingProjects} />
                </TabsContent>
                <TabsContent value="past" className="mt-6">
                  <ProjectList projects={pastProjects} />
                </TabsContent>
              </Tabs>
            )}
          </>
        )}
      </main>
    </div>
  );
}
