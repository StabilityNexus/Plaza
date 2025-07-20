"use client";

import { motion } from "framer-motion";
import CreateProjectForm from "@/components/CreateProjectForm";
import Button from "@/components/Button";
import Link from "next/link";
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function CreateProject() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Content */}
        <div className="max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl pt-8 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CreateProjectForm />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
