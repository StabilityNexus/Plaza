"use client";

import { useEffect, useState } from "react";
import CardProject from "./CardExplorer";
import { getPublicClient } from "@wagmi/core";
import { PlazaFactoryAbi } from "@/utlis/contractsABI/PlazaFactoryAbi";
import { PlazaFactoryAddress } from "@/utlis/addresses";
import { PlazaAbi } from "@/utlis/contractsABI/PlazaAbi";
import { config } from "@/utlis/config";

export type ProjectData = {
  projectAddress: `0x${string}`;
  projectName: string;
  startTime: number;
  endTime: number;
  status: number;
};

export default function ExplorerProjects() {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<ProjectData[]>([]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const chainId = config.state.chainId;
      const publicClient = getPublicClient(config as any, { chainId });

      // 1. Read how many total projects have been created.
      const totalProjects = (await publicClient.readContract({
        address: PlazaFactoryAddress[chainId] as `0x${string}`,
        abi: PlazaFactoryAbi,
        functionName: "projectCount",
      })) as bigint;

      // 2. For each index, read the project address from the `allProjects` array.
      const allProjects: ProjectData[] = [];
      for (let i = 0; i < Number(totalProjects); i++) {
        const projectAddress = (await publicClient.readContract({
          address: PlazaFactoryAddress[chainId] as `0x${string}`,
          abi: PlazaFactoryAbi,
          functionName: "allProjects",
          args: [BigInt(i)],
        })) as `0x${string}`;

        // 3. Read details from each Plaza project.
        const [projectName, startTime, endTime, rawStatus] = (await Promise.all(
          [
            publicClient.readContract({
              address: projectAddress,
              abi: PlazaAbi,
              functionName: "projectName",
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
              functionName: "status",
            }),
          ]
        )) as [string, bigint, bigint, number];

        allProjects.push({
          projectAddress,
          projectName,
          startTime: Number(startTime),
          endTime: Number(endTime),
          status: Number(rawStatus),
        });
      }

      setProjects(allProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="w-full space-y-4">
      {loading ? (
        <div className="text-center text-gray-900 dark:text-white">
          Loading projects...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
          {projects.map((project, index) => (
            <CardProject
              key={`${project.projectAddress}-${index}`}
              project={project}
            />
          ))}
        </div>
      )}
    </div>
  );
}
