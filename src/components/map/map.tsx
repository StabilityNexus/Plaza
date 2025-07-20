"use client";

import mapboxgl from "mapbox-gl";
import { useRef, useEffect } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { Token, User } from "@/types/types"; 
import { createTokenMarker } from "@/utlis/markers"; 

interface MapComponentProps {
  tokens: Token[];
  currentUser: User;
  onTokenClick?: (token: Token) => void;
}

export default function MapComponent({
  tokens,
  currentUser,
  onTokenClick,
}: MapComponentProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const currentUserMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const tokenMarkersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
      console.error("Mapbox token is required");
      return;
    }

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current!,
        zoom: 18,
        pitch: 60,
        bearing: 0,
        attributionControl: false,
        projection: "globe",
        logoPosition: "top-left",
      });

      // Create current user marker with emoji
      const currentUserElement = document.createElement("div");
      currentUserElement.innerText = "📍"; // Use emoji for current location marker
      currentUserElement.style.fontSize = "24px";
      currentUserElement.style.color = "#FF0000"; // Optional: Add a color

      currentUserMarkerRef.current = new mapboxgl.Marker({
        element: currentUserElement,
        anchor: "center",
      })
        .setLngLat([currentUser.longitude, currentUser.latitude])
        .addTo(mapRef.current!);

      // Create token markers with NexusLogo
      tokens.forEach((token) => {
        const tokenElement = createTokenMarker({
          ...token,
          logoUrl: "/assets/nexuslogo.png", // Replace with NexusLogo
        });

        if (onTokenClick) {
          tokenElement.addEventListener("click", () => onTokenClick(token));
        }

        const marker = new mapboxgl.Marker({
          element: tokenElement,
          anchor: "center",
        })
          .setLngLat([token.longitude, token.latitude])
          .addTo(mapRef.current!);

        tokenMarkersRef.current.push(marker);
      });
    }

    // Get and watch current user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation: [number, number] = [longitude, latitude];

          mapRef.current?.flyTo({
            center: newLocation,
            zoom: 16,
            essential: true,
          });

          currentUserMarkerRef.current
            ?.setLngLat(newLocation)
            .addTo(mapRef.current!);
        },
        (error) => console.error("Error getting location:", error)
      );

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation: [number, number] = [longitude, latitude];

          if (currentUserMarkerRef.current) {
            currentUserMarkerRef.current.setLngLat(newLocation);
          }

          mapRef.current?.easeTo({
            center: newLocation,
            duration: 1000,
          });
        },
        (error) => console.error("Error watching position:", error),
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 5000,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
        currentUserMarkerRef.current?.remove();
        tokenMarkersRef.current.forEach((marker) => marker.remove());
        tokenMarkersRef.current = [];
      };
    }
  }, [tokens, currentUser, onTokenClick]);

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <style jsx global>{`
        .mapboxgl-control-container {
          display: none !important;
        }
        .mapboxgl-canvas {
          cursor: default !important;
        }
      `}</style>
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
    </main>
  );
}