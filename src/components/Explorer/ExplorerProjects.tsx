"use client";

import { useEffect, useState } from "react";
import CardProject from "./CardExplorer";
import { getPublicClient } from "@wagmi/core";
import { PlazaFactoryAbi } from "@/utlis/contractsABI/PlazaFactoryAbi";
import { PlazaFactoryAddress } from "@/utlis/addresses";
import { PlazaAbi } from "@/utlis/contractsABI/PlazaAbi";
import { config } from "@/utlis/config";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-8 w-8 text-gray-400" />
        </motion.div>
        <span className="ml-3 text-gray-400 font-medium">Loading projects...</span>
      </div>
    );
  }

  if (projects.length === 0 && !loading) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">No projects found. Create your first project!</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {projects.map((project) => (
        <CardProject key={project.projectAddress} project={project} />
      ))}
    </motion.div>
  );
}
