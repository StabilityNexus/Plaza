"use client";

import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Button from "@/components/Button";

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (latitude: number, longitude: number) => void;
  initialLatitude?: number;
  initialLongitude?: number;
}

export default function LocationPicker({
  isOpen,
  onClose,
  onLocationSelect,
  initialLatitude,
  initialLongitude,
}: LocationPickerProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // Get current location when dialog opens
  useEffect(() => {
    if (!isOpen) return;

    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        console.warn("Geolocation is not supported by this browser");
        // Use fallback coordinates (Jaipur, India as default)
        setCurrentLocation({ lat: 26.9124, lng: 75.7873 });
        setIsLoadingLocation(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.warn("Error getting current location:", error);
          // Use fallback coordinates (Jaipur, India as default)
          setCurrentLocation({ lat: 26.9124, lng: 75.7873 });
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    };

    getCurrentLocation();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !currentLocation || isLoadingLocation) return;
    
    if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
      console.error("Mapbox access token is not configured. Please add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env.local file");
      return;
    }

    // Set Mapbox access token
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    // Wait for dialog to be fully rendered before initializing map
    const initializeMap = () => {
      if (!mapContainerRef.current || mapRef.current) return;

      // Determine initial center: use provided coordinates, then current location
      const centerLng = initialLongitude ?? currentLocation.lng;
      const centerLat = initialLatitude ?? currentLocation.lat;

      try {
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [centerLng, centerLat],
          zoom: 14,
          attributionControl: true,
          logoPosition: 'bottom-right',
        });

        mapRef.current.on("load", () => {
          console.log("Map loaded successfully");
          
          // If there are initial coordinates, show them on the map
          if (initialLatitude && initialLongitude && 
              !isNaN(initialLatitude) && !isNaN(initialLongitude)) {
            setSelectedCoords({ lat: initialLatitude, lng: initialLongitude });
            
            // Add marker for initial coordinates
            const markerElement = document.createElement("div");
            markerElement.innerText = "📍";
            markerElement.style.fontSize = "24px";
            markerElement.style.cursor = "pointer";
            markerElement.style.zIndex = "1000";

            markerRef.current = new mapboxgl.Marker({
              element: markerElement,
              anchor: "bottom",
            })
              .setLngLat([initialLongitude, initialLatitude])
              .addTo(mapRef.current!);
          } else {
            // Add a subtle indicator for current location
            const currentLocationElement = document.createElement("div");
            currentLocationElement.innerHTML = "📍";
            currentLocationElement.style.fontSize = "20px";
            currentLocationElement.style.opacity = "0.6";
            currentLocationElement.style.pointerEvents = "none";

            new mapboxgl.Marker({
              element: currentLocationElement,
              anchor: "center",
            })
              .setLngLat([currentLocation.lng, currentLocation.lat])
              .addTo(mapRef.current!);
          }
        });

        mapRef.current.on("click", (e) => {
          const { lng, lat } = e.lngLat;
          setSelectedCoords({ lat, lng });

          // Remove existing marker
          if (markerRef.current) {
            markerRef.current.remove();
          }

          // Add new marker
          const markerElement = document.createElement("div");
          markerElement.innerText = "📍";
          markerElement.style.fontSize = "24px";
          markerElement.style.cursor = "pointer";
          markerElement.style.zIndex = "1000";

          markerRef.current = new mapboxgl.Marker({
            element: markerElement,
            anchor: "bottom",
          })
            .setLngLat([lng, lat])
            .addTo(mapRef.current!);
        });

        mapRef.current.on("error", (e) => {
          console.error("Map error:", e);
        });

      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    // Use setTimeout to ensure dialog is fully rendered
    const timeoutId = setTimeout(initializeMap, 100);

    return () => {
      clearTimeout(timeoutId);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [isOpen, initialLatitude, initialLongitude, currentLocation, isLoadingLocation]);

  const handleConfirm = () => {
    if (selectedCoords) {
      onLocationSelect(selectedCoords.lat, selectedCoords.lng);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedCoords(null);
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    onClose();
  };

  // Reset states when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedCoords(null);
      setIsLoadingLocation(true);
      setCurrentLocation(null);
    }
  }, [isOpen]);

  // Check if Mapbox token is configured
  const isMapboxTokenMissing = !process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-6xl w-[90vw] h-[85vh] p-0 overflow-hidden">
        <DialogTitle className="sr-only">Select Location</DialogTitle>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b bg-white flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900">
              Select Location on Map
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Click anywhere on the map to select your project location
            </p>
            
            {isLoadingLocation && (
              <div className="mt-3 flex items-center text-sm text-gray-500">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                Getting your current location...
              </div>
            )}
            
            {selectedCoords && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Selected Coordinates:</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-600 font-medium">Latitude:</span>
                    <span className="font-mono text-blue-700">{selectedCoords.lat.toFixed(6)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600 font-medium">Longitude:</span>
                    <span className="font-mono text-blue-700">{selectedCoords.lng.toFixed(6)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1 relative min-h-0">
            {isMapboxTokenMissing ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 max-w-md">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Map Configuration Required
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    To use the map selector, you need to configure a Mapbox access token:
                  </p>
                  <div className="bg-gray-100 p-3 rounded text-xs text-left font-mono">
                    <p className="mb-2">1. Create a <code>.env.local</code> file in your src folder</p>
                    <p className="mb-2">2. Add this line:</p>
                    <p className="text-blue-600">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token_here</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Get a free token at{" "}
                    <a 
                      href="https://account.mapbox.com/access-tokens/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      mapbox.com
                    </a>
                  </p>
                </div>
              </div>
            ) : isLoadingLocation ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center p-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <div className="text-4xl mb-2">🌍</div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Loading Map
                  </h4>
                  <p className="text-sm text-gray-600">
                    Getting your current location to center the map...
                  </p>
                </div>
              </div>
            ) : (
              <div 
                ref={mapContainerRef} 
                className="absolute inset-0 w-full h-full" 
                style={{ minHeight: '400px' }}
              />
            )}
          </div>
          
          <div className="p-4 border-t bg-white flex justify-end space-x-3 flex-shrink-0">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedCoords || isMapboxTokenMissing}
              className={(!selectedCoords || isMapboxTokenMissing) ? "opacity-50 cursor-not-allowed" : ""}
            >
              Confirm Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 