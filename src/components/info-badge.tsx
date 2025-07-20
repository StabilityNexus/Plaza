"use client";
import React from "react";
import Image from "next/image";

interface InfoBadgeProps {
  iconSrc: string; // Source for the icon image
  amount: string; // Display amount
  tokenSymbol: string; // Token symbol
  description: string; // Optional description text (e.g., "for grabs")
  iconSize?: string; // Optional icon size (defaults to "1rem" if not provided)
  className?: string; // Optional class name for additional styling
}

const InfoBadge: React.FC<InfoBadgeProps> = ({
  iconSrc,
  amount,
  tokenSymbol,
  description,
  iconSize = "1rem",
  className = "",
}) => {
  return (
    <div
      className={`flex items-center gap-3 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200 rounded-full py-2 px-4 shadow-sm ${className}`}
    >
      <div className="relative" style={{ width: iconSize, height: iconSize }}>
        <Image
          src={iconSrc}
          alt="Reward icon"
          fill
          className="object-contain"
        />
      </div>
      <div className="flex items-center gap-1 text-sm font-medium text-amber-800">
        <span className="font-bold">{amount}</span>
        <span>{tokenSymbol}</span>
        <span className="text-amber-600">{description}</span>
      </div>
    </div>
  );
};

export default InfoBadge;
