"use client";

import { CreateProjectForm } from "@/components/CreateProjectForm";
import { Orbitron } from "next/font/google";


export default function CreateProject() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-8 bg-white text-black dark:bg-gray-900 dark:text-white`}
    >
      <div className="z-10 max-w-3xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8">
          Create a New Project
        </h1>
        <CreateProjectForm />
      </div>
    </main>
  );
}
