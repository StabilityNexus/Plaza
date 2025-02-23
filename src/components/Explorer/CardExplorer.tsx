"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ProjectData } from "./ExplorerProjects";

export default function CardProject({ project }: { project: ProjectData }) {
  const router = useRouter();

  const handleClick = () => {
    // Navigate to a detailed view for the project.
    router.push(`/project?address=${project.projectAddress}`);
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer transform transition-all duration-200 hover:scale-105"
    >
      <Card className="dark:bg-zinc-900 bg-white dark:border-zinc-800 border-gray-200 dark:hover:border-yellow-300 hover:border-yellow-500 transition-all duration-200 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <h3
            className="text-lg font-semibold truncate max-w-[200px] dark:text-purple-50 text-gray-900"
            title={project.projectName}
          >
            {project.projectName}
          </h3>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-sm dark:text-purple-400 text-purple-600">
              Start:
            </span>{" "}
            {new Date(project.startTime * 1000).toLocaleString()}
          </div>
          <div>
            <span className="text-sm dark:text-purple-400 text-purple-600">
              End:
            </span>{" "}
            {new Date(project.endTime * 1000).toLocaleString()}
          </div>
          <div>
            <span className="text-sm dark:text-purple-400 text-purple-600">
              Status:
            </span>{" "}
            {project.status === 0
              ? "Active"
              : project.status === 1
              ? "Completed"
              : "Cancelled"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
