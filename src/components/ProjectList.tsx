"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { config } from "@/utlis/config";

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
          <Card className="bg-[#1B2430] border border-gray-700 rounded-lg shadow hover:shadow-md transition-shadow duration-300">
            <CardContent className="px-4 pb-4">
              <CardTitle className="text-lg font-semibold text-white">
                {project.projectName}
              </CardTitle>
              <p className="mt-2 text-sm text-gray-300">
                Start:{" "}
                <span className="font-medium">
                  {new Date(project.startTime * 1000).toLocaleString()}
                </span>
              </p>
              <p className="text-sm text-gray-300">
                End:{" "}
                <span className="font-medium">
                  {new Date(project.endTime * 1000).toLocaleString()}
                </span>
              </p>
              <Link
                href={`/p?chainId=${chainId}&projectId=${project.address}`}
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
              >
                Learn More
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
