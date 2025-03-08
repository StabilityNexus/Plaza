import { scrollSepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
// import { ethereumClassic } from '@/components/EthereumClassic'
// import { milkomeda } from '@/components/Milkomeda'

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error(
    "Missing NEXT_PUBLIC_PROJECT_ID. Please add it to your .env.local file"
  );
}

export const config = getDefaultConfig({
  appName: "Plaza",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID ?? "",
  chains: [scrollSepolia],
  ssr: true,
});
