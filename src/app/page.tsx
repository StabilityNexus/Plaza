"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import PlayableMap from "@/components/map/playable-map";
import Button from "@/components/Button";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative w-full h-screen overflow-hidden">        
        <div className="absolute inset-0 z-10">
          <PlayableMap />
        </div>
      </div>
    </div>
  );
}
