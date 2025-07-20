"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import MapComponent from "@/components/map/map";
import { Token } from "@/types/types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import Info from "../info";
import { useToast } from "@/hooks/use-toast";
import NexusLogo from "@/assets/nexusLogo.png";
import Button from "@/components/Button";
import Link from "next/link";

export default function PlayableMap() {
  const router = useRouter(); // Initialize the router

  // Token markers
  const tokens = useMemo(
    () => [
      {
        id: "1",
        latitude: 26.934604725556646,
        longitude: 75.90381648295603,
        symbol: "EME",
        name: "Emerald",
        logoUrl: "/assets/nexuslogo.png",
        backgroundColor: "#8A2BE2",
      },
      {
        id: "2",
        latitude: 26.904604725556646,
        longitude: 75.92381648295603,
        symbol: "RUB",
        name: "Ruby",
        logoUrl: "/assets/nexuslogo.png",
        backgroundColor: "#8A2BE2",
      },
      {
        id: "3",
        latitude: 26.9121,
        longitude: 75.7777,
        symbol: "SHIB",
        name: "Shiba",
        logoUrl: "/assets/nexuslogo.png",
        backgroundColor: "#8A2BE2",
      },
      {
        id: "4",
        latitude: 26.934604725556646,
        longitude: 75.92381648295603,
        symbol: "LNM",
        name: "LNM Hacks",
        logoUrl: "/assets/nexuslogo.png",
        backgroundColor: "#8A2BE2",
      },
    ],
    []
  );

  const [currentUser, setCurrentUser] = useState({
    id: "current",
    latitude: 0,
    longitude: 0,
    name: "You",
    avatarUrl: "📍",
  });

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    selectedItem: (typeof tokens)[0] | null;
  }>({
    isOpen: false,
    selectedItem: null,
  });

  const handleTokenClick = useCallback((token: Token) => {
    setModalState({
      isOpen: true,
      selectedItem: token,
    });
  }, []);

  const handleModalClose = useCallback(() => {
    setModalState({
      isOpen: false,
      selectedItem: null,
    });
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentUser((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
      },
      (error) => console.error("Error retrieving geolocation:", error)
    );
  }, []);

  const mapProps = useMemo(
    () => ({
      tokens,
      currentUser,
      onTokenClick: handleTokenClick,
    }),
    [tokens, currentUser, handleTokenClick]
  );

  return (
    <>
      <main className="flex flex-col items-center justify-center h-screen">
        <MapComponent {...mapProps} />
      </main>

      <Dialog
        open={modalState.isOpen}
        onOpenChange={(open: boolean) => !open && handleModalClose()}
      >
        <DialogContent className="bg-transparent border-none">
          <DialogTitle className="sr-only">
            {modalState.selectedItem?.name || "Item Details"}
          </DialogTitle>
          <div className="mb-4">
            {modalState.selectedItem && (
              <div className="space-y-4">
                <div className="bg-blue-100 rounded-xl p-4">
                  <div className="pb-4">
                    <Info
                      tokenImage={NexusLogo.src}
                      tokenName={modalState.selectedItem.name}
                      tokenType={modalState.selectedItem.symbol}
                      description={[
                        "📧 Connect your wallet.",
                        "🎯 Claim rewards now!",
                      ]}
                      rewardAmount="500"
                      rewardSymbol="$APT"
                    />
                    <div className="flex justify-center mt-4">
                      {" "}
                      {/* Changed from self-stretch flex justify-end to flex justify-center */}
                      <Link href="/mint">
                        <Button>Claim</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}