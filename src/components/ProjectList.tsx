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
  participants?: number;
  rewards?: string;
  targetAmount?: string;
  raisedAmount?: string;
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
          <Card className="h-full hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
            <Link href={getProjectUrl(project)}>
              <CardContent className="p-6 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 truncate flex-1 mr-2 group-hover:text-blue-700 transition-colors duration-200">
                    {project.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      project.status
                    )} group-hover:scale-105 transition-transform duration-200`}
                  >
                    {project.status}
                  </span>
                </div>

                {/* Financial Stats */}
                {(project.targetAmount || project.raisedAmount) && (
                  <div className="space-y-2 mb-4">
                    {project.targetAmount && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Target Amount:</span>
                        <span className="font-medium text-green-600">{project.targetAmount}</span>
                      </div>
                    )}
                    {project.raisedAmount && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Amount Raised:</span>
                        <span className="font-medium text-blue-600">{project.raisedAmount}</span>
                      </div>
                    )}
                    {project.targetAmount && project.raisedAmount && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300 group-hover:bg-blue-500"
                          style={{ 
                            width: `${Math.min(
                              (parseFloat(project.raisedAmount.replace(' ETH', '')) / 
                               parseFloat(project.targetAmount.replace(' ETH', ''))) * 100,
                              100
                            )}%` 
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                )}

                {/* Participants (if available) */}
                {project.participants !== undefined && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Participants:</span>
                      <span className="font-medium text-gray-900">{project.participants}</span>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-sm mt-auto pt-4 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-sm -mx-6 -mb-6 group-hover:from-blue-50 group-hover:to-blue-100 group-hover:border-blue-200 transition-all duration-300">
                  <span className="text-gray-600 font-medium">Created: {formatDate(project.createdAt)}</span>
                  <span className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200 flex items-center gap-1 group-hover:translate-x-1">
                    View Details 
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
