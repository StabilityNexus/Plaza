"use client";

import { FunctionComponent } from "react";
import Image from "next/image";
import InfoBadge from "./info-badge";

export interface InfoType {
  className?: string;
  tokenImage: string;
  tokenName: string;
  tokenType: string;
  timeAgo?: string;
  shareText?: string;
  description: string[];
  rewardAmount: string;
  rewardSymbol: string;
}

const Info: FunctionComponent<InfoType> = ({
  className = "",
  tokenImage,
  tokenName,
  tokenType,
  description,
  rewardAmount,
  rewardSymbol,
}) => {
  return (
    <div
      className={`flex flex-col items-center gap-6 text-gray-800 ${className}`}
    >
      {/* Token Image */}
      <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-lg">
        <Image
          alt={`${tokenName} token`}
          className="object-cover"
          src={tokenImage}
          fill
          priority
        />
      </div>

      {/* Token Info */}
      <div className="w-full flex flex-col items-center gap-4">
        {/* Token Name and Type */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-2xl font-bold text-center">{tokenName}</div>
          <div className="rounded-full bg-gradient-to-r from-purple-500 to-blue-500 py-2 px-4 text-sm text-white font-medium">
            {tokenType}
          </div>
        </div>

        {/* Description */}
        <div className="text-center space-y-2">
          {description.map((desc, index) => (
            <p key={index} className="text-sm text-gray-600">
              {desc}
            </p>
          ))}
        </div>

        {/* Reward Badge */}
        <div className="w-fit mt-2">
          <InfoBadge
            iconSrc="/tablericoncoins.svg"
            amount={rewardAmount}
            tokenSymbol={rewardSymbol}
            description="for grabs"
            iconSize="1.2rem"
          />
        </div>
      </div>
    </div>
  );
};

export default Info;
