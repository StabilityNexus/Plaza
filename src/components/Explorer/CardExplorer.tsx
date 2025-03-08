"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ProjectData } from "./ExplorerProjects";
import { config } from "@/utlis/config";
import { motion } from "framer-motion";
import { Calendar, Clock, Activity, ArrowUpRight } from "lucide-react";

export default function CardProject({ project }: { project: ProjectData }) {
  const router = useRouter();
  const chainId = config.state.chainId;

  const handleClick = () => {
    // Navigate to a detailed view for the project.
    router.push(
      `/p?chainId=${chainId}&projectId=${project.projectAddress}`
    );
  };

  // Determine status color
  const getStatusColor = () => {
    switch (project.status) {
      case 0: return "text-green-400"; // Active
      case 1: return "text-blue-400";  // Completed
      default: return "text-gray-400"; // Cancelled
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      className="cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 shadow-md overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <h3
            className="text-lg font-semibold truncate max-w-[200px] text-white"
            title={project.projectName}
          >
            {project.projectName}
          </h3>
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="text-gray-400 hover:text-white"
          >
            <ArrowUpRight size={18} />
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Start</span>
              <span className="text-sm text-white">
                {new Date(project.startTime * 1000).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">End</span>
              <span className="text-sm text-white">
                {new Date(project.endTime * 1000).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Status</span>
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {project.status === 0
                  ? "Active"
                  : project.status === 1
                  ? "Completed"
                  : "Cancelled"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
