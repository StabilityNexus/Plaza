"use client";
import React, { CSSProperties } from "react";

interface InfoBadgeProps {
  iconSrc: string; // Source for the icon image
  amount: string | number; // Display amount
  tokenSymbol: string; // Token symbol
  description?: string; // Optional description text (e.g., "for grabs")
  iconSize?: CSSProperties["width"]; // Optional icon size (defaults to 1rem if not provided)
  className?: string; // Optional class name for additional styling
}

const InfoBadge: React.FC<InfoBadgeProps> = ({
  iconSrc,
  amount,
  tokenSymbol,
  description = "for grabs",
  iconSize = "1rem",
  className = "",
  
}) => {
  return (
    <div
      className={`rounded-sm border-primary border-[1px] border-solid flex flex-row items-center justify-start p-[0.25rem] gap-[0.125rem] ${className}`}
    >
      <img
        className="relative overflow-hidden shrink-0"
        loading="lazy"
        alt="icon"
        src={iconSrc}
        style={{
          height: iconSize,
          width: iconSize,
        }}
      />
      <div className="relative">
        {amount}
      </div>
      <b className="relative" >
        {tokenSymbol}
      </b>
      {description && (
        <div className="relative" >
          {description}
        </div>
      )}
    </div>
  );
};

export default InfoBadge;
