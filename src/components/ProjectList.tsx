"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useChainId } from "wagmi";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
  address?: string; // Add address for Web3 projects
}

interface ProjectListProps {
  projects: Project[];
}

export default function ProjectList({ projects }: ProjectListProps) {
  // Retrieve the active chain id from Wagmi. If no wallet is connected yet, fall back to Scroll Sepolia (534351)
  const chainId = useChainId() || 534351;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getProjectUrl = (project: Project) => {
    // For blockchain projects, use the [id] route with query parameters
    if (project.address) {
      return `/p?chainId=${chainId}&project=${project.address}`;
    }
    // Otherwise use the simple format
    return `/${project.id}`;
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Projects Found
          </h3>
          <p className="text-gray-600 mb-6">
            You haven&apos;t created any projects yet. Start by creating your first project!
          </p>
          <Link href="/createProject">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Create Your First Project
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer">
            <Link href={getProjectUrl(project)}>
              <CardContent className="p-6 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 truncate flex-1 mr-2">
                    {project.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">
                  {project.description}
                </p>

                {/* Address (if exists) */}
                {project.address && (
                  <div className="mb-4 p-2 bg-gray-50 rounded text-xs">
                    <span className="font-medium">Address:</span>
                    <br />
                    <span className="font-mono">{project.address}</span>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                  <span>Created: {formatDate(project.createdAt)}</span>
                  <span className="text-blue-600 hover:text-blue-800 font-medium">
                    View Details →
                  </span>
                </div>
              </CardContent>
            </Link>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
