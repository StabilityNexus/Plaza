import React from "react";

const RainbowBorderComponent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative p-0.5 bg-gradient-to-r from-[#A9FF84] via-[#7FFFE1] to-[#FFEB89] rounded-lg">
      <div className="rainbow-border-bg absolute inset-0 rounded-lg"></div>
      <div className="relative p-2 bg-purple-800 text-white rounded-lg">
        {children}
      </div>
    </div>
  );
};

export default RainbowBorderComponent;
