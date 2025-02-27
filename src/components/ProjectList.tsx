"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { config } from "@/utlis/config";
import ButtonSvg from "./ui/ButtonSVG";

enum ProjectStatus {
  ACTIVE = 0,
  COMPLETED = 1,
  CANCELLED = 2,
}

type ProjectData = {
  id: number;
  address: `0x${string}`;
  projectName: string;
  projectDescription: string;
  startTime: number;
  endTime: number;
  status: ProjectStatus;
};

export default function ProjectList({ projects }: { projects: ProjectData[] }) {

  const chainId = config.state.chainId;

  if (!projects || projects.length === 0) {
    return <p className="text-gray-400">No projects in this category.</p>;
  }


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {projects.map((project) => (
        <motion.div
          key={project.id}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-[#0E0C15] border border-[#252134] rounded-2xl shadow hover:shadow-md transition-shadow duration-300 py-8">
            <CardContent className="px-4 pb-4">
              <CardTitle className="text-3xl font-semibold bg-gradient-to-bl from-[#FACB7B] via-[#D87CEE] to-[#89F9E8]  text-transparent bg-clip-text ">
                {project.projectName}
              </CardTitle>
              <p className="font-light text-[0.875rem] leading-6 md:text-base text-white/50 line-clamp-2 mb-4 mt-2 min-h-12">
             {project.projectDescription}
              </p>
              <p className="mt-2 text-lg text-white ">
                Start:{" "}
                <span className="font-medium">
                  {new Date(project.startTime * 1000).toLocaleString()}
                </span>
              </p>
              <p className="text-lg text-white">
                End:{" "}
                <span className="font-medium">
                  {new Date(project.endTime * 1000).toLocaleString()}
                </span>
              </p>
              
              <Link
                href={`/p?chainId=${chainId}&projectId=${project.address}`}
                className="inline-block mt-4 px-4 py-2  text-white rounded-md transition-colors relative w-full text-center"
              >
               <span>
                <ButtonSvg/>
                learn more

               </span>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
