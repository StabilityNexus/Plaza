"use client";

import ExplorerProjects from "@/components/Explorer/ExplorerProjects";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { PlusCircle, Search, Wallet, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function ExplorerPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateProject = () => {
    router.push("/createProject");
  };

  const handleYourProjects = () => {
    router.push("/myProjects");
  };

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <main className="container mx-auto px-8 py-12">
        {/* Header Section */}
        <div className="mb-10 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white">
                Project Archive
              </h1>
              <p className="mt-3 text-gray-300 text-base">
                Welcome to the central repository for accessing all projects.
              </p>
            </div>
            <div className="mt-6 md:mt-0">
              <ConnectButton />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search projects..."
              className="pl-10 bg-zinc-900 border-zinc-800 text-white rounded-md w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-white font-bold mb-6 text-xl">
            Quick Links:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              className="p-5 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition-all cursor-pointer flex items-center justify-between"
              onClick={handleYourProjects}
            >
              <div className="flex items-center gap-4">
                <Wallet className="h-6 w-6 text-white" />
                <div>
                  <div className="font-semibold text-white text-lg">Your Projects</div>
                  <div className="text-sm text-gray-300">View your active projects</div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
            
            <div 
              className="p-5 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition-all cursor-pointer flex items-center justify-between"
              onClick={handleCreateProject}
            >
              <div className="flex items-center gap-4">
                <PlusCircle className="h-6 w-6 text-white" />
                <div>
                  <div className="font-semibold text-white text-lg">Create Project</div>
                  <div className="text-sm text-gray-300">Create your new project</div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-6">All Projects</h2>
          <div className="w-full">
            <ExplorerProjects />
          </div>
        </div>
      </main>
    </div>
  );
}
