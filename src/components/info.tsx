"use client";

import { FunctionComponent } from "react";
import Image from "next/image";
import InfoBadge from "./info-badge";

export interface InfoType {
  className?: string;
  tokenImage: string;
  tokenName: string;
  tokenType: string;
  timeAgo: string;
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
  timeAgo,
  shareText,
  description,
  rewardAmount,
  rewardSymbol,
}) => {
  return (
    <div
      className={`flex flex-col items-center gap-6 text-primary ${className}`}
    >
      {/* Token Image */}
      <div className="relative w-32 h-32">
        <Image
          alt="TokenPic"
          className="rounded-tl-3xl rounded-tr-[81px] rounded-b-[81px] object-cover"
          src={tokenImage}
          fill
          priority
        />
      </div>

      {/* Token Info */}
      <div className="w-full flex flex-col items-center gap-4">
        {/* Token Name and Type */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-2xl font-bold">{tokenName}</div>
          <div className="rounded-[81px] bg-purple-400 py-1 px-3 text-sm text-highlight">
            {tokenType}
          </div>
        </div>

        {/* {shareText && (
          <div className="text-sm">
            <span className="opacity-80">Share</span> {shareText}
          </div>
        )} */}

        <p className="text-sm max-w-[90%]">{description}</p>

        {/* Description */}

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
