"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "./Button";
import LocationPicker from "./LocationPicker";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { PlazaFactoryAddress } from "@/utlis/addresses";
import { PlazaFactoryAbi } from "@/utlis/contractsABI/PlazaFactoryAbi";
import { config } from "@/utlis/config";
import { parseEther } from "viem";

interface FormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  latitude: string;
  longitude: string;
  targetAmount: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  latitude?: string;
  longitude?: string;
  targetAmount?: string;
}

export default function CreateProjectForm() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { connect } = useConnect();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    latitude: "",
    longitude: "",
    targetAmount: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [locationInputMode, setLocationInputMode] = useState<'manual' | 'map'>('manual');
  
  const { writeContract, data: hash, error: contractError, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Project description is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    if (!formData.latitude.trim()) {
      newErrors.latitude = "Latitude is required";
    } else if (isNaN(Number(formData.latitude))) {
      newErrors.latitude = "Latitude must be a valid number";
    }

    if (!formData.longitude.trim()) {
      newErrors.longitude = "Longitude is required";
    } else if (isNaN(Number(formData.longitude))) {
      newErrors.longitude = "Longitude must be a valid number";
    }

    if (!formData.targetAmount.trim()) {
      newErrors.targetAmount = "Target amount is required";
    } else if (isNaN(Number(formData.targetAmount)) || Number(formData.targetAmount) <= 0) {
      newErrors.targetAmount = "Target amount must be a valid positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // If wallet is not connected, connect it first and stop
    if (!isConnected) {
      setIsLoading(true);
      try {
        await connect({ connector: injected() });
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
      setIsLoading(false);
      return; // Stop here, user needs to click again to deploy
    }

    // Check if current chain is supported
    if (!PlazaFactoryAddress[chainId]) {
      alert(`Unsupported network. Please switch to Scroll Sepolia or Ethereum Classic.`);
      return;
    }

    // Now proceed with project deployment
    setIsLoading(true);
    
    try {
      // Convert form data to contract parameters
      const tokenName = `${formData.name} Token`;
      const tokenSymbol = formData.name.replace(/\s+/g, '').toUpperCase().slice(0, 6);
      const startTime = BigInt(Math.floor(new Date(formData.startDate).getTime() / 1000));
      const endTime = BigInt(Math.floor(new Date(formData.endDate).getTime() / 1000));
      const latitude = BigInt(Math.floor(parseFloat(formData.latitude) * 1000000)); // Store with 6 decimal precision
      const longitude = BigInt(Math.floor(parseFloat(formData.longitude) * 1000000)); // Store with 6 decimal precision
      const targetAmount = parseEther(formData.targetAmount);

      await writeContract({
        address: PlazaFactoryAddress[chainId] as `0x${string}`,
        abi: PlazaFactoryAbi as any,
        functionName: "createProject",
        args: [
          tokenName,
          tokenSymbol,
          formData.name,
          formData.description,
          latitude,
          longitude,
          startTime,
          endTime,
          targetAmount
        ],
      });

    } catch (error: unknown) {
      console.error("Error creating project:", error);
      setIsLoading(false);
    }
  };

  // Handle transaction confirmation with useEffect
  useEffect(() => {
    if (isConfirmed) {
      setIsLoading(false);
      router.push("/myProjects");
    }
  }, [isConfirmed, router]);

  // Handle contract error with useEffect
  useEffect(() => {
    if (contractError) {
      setIsLoading(false);
      console.error("Contract error:", contractError);
    }
  }, [contractError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleLocationSelect = (latitude: number, longitude: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    }));
    
    // Clear location errors
    setErrors(prev => ({
      ...prev,
      latitude: undefined,
      longitude: undefined,
    }));
  };

  const openLocationPicker = () => {
    setIsLocationPickerOpen(true);
  };

  const closeLocationPicker = () => {
    setIsLocationPickerOpen(false);
  };

  // Update loading state based on transaction status
  const actualIsLoading = isLoading || isPending || isConfirming;

  return (
    <>
      <style jsx>{`
        .date-picker-input::-webkit-calendar-picker-indicator {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          background-color: transparent;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%23374151' viewBox='0 0 24 24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'/%3E%3C/svg%3E");
          background-size: 100% 100%;
          background-repeat: no-repeat;
          cursor: pointer;
          opacity: 1;
          z-index: 10;
        }
        
        .date-picker-input::-webkit-calendar-picker-indicator:hover {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%23111827' viewBox='0 0 24 24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'/%3E%3C/svg%3E");
        }
        
        .date-picker-input::-webkit-datetime-edit {
          color: #111827;
        }
        
        .date-picker-input::-webkit-datetime-edit-text {
          color: #6b7280;
          padding: 0 2px;
        }
        
        .date-picker-input::-webkit-datetime-edit-month-field,
        .date-picker-input::-webkit-datetime-edit-day-field,
        .date-picker-input::-webkit-datetime-edit-year-field,
        .date-picker-input::-webkit-datetime-edit-hour-field,
        .date-picker-input::-webkit-datetime-edit-minute-field {
          color: #111827;
          font-weight: 500;
        }
        
        .date-picker-input:focus::-webkit-datetime-edit {
          color: #111827;
        }
        
        /* Firefox date picker styling */
        .date-picker-input[type="datetime-local"] {
          position: relative;
        }
        
        /* Ensure proper spacing for the icon */
        .date-picker-input {
          padding-right: 2.5rem !important;
        }
      `}</style>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 w-full mx-auto border border-gray-100"
      >
      <div className="relative mb-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center pt-2">
          Create Project
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 bg-gray-50 text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder-gray-500 ${
              errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="Enter your project name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Project Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Project Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 bg-gray-50 text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all resize-none placeholder-gray-500 ${
              errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="Describe your project"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Date Range */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className={`date-picker-input w-full px-4 py-3 bg-gray-50 text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all ${
                  errors.startDate ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                min={new Date().toISOString().slice(0, 16)}
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.startDate}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className={`date-picker-input w-full px-4 py-3 bg-gray-50 text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all ${
                  errors.endDate ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                min={formData.startDate || new Date().toISOString().slice(0, 16)}
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>
          
          {/* Quick End Date Selection */}
          {formData.startDate && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-blue-900 font-medium mr-2">
                  Quick select end date:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    // Same Day: Set end time to 23:59 of the same day
                    const startDateTime = formData.startDate; // e.g., "2024-01-15T14:30"
                    const dateOnly = startDateTime.split('T')[0]; // "2024-01-15"
                    const endDateTime = `${dateOnly}T23:59`; // "2024-01-15T23:59"
                    setFormData(prev => ({
                      ...prev,
                      endDate: endDateTime
                    }));
                  }}
                  className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
                >
                  Same Day
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // +1 Day: Keep same time, add 1 day
                    const startDate = new Date(formData.startDate);
                    const endDate = new Date(startDate.getTime() + (24 * 60 * 60 * 1000)); // Add 1 day in milliseconds
                    setFormData(prev => ({
                      ...prev,
                      endDate: endDate.toISOString().slice(0, 16)
                    }));
                  }}
                  className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors font-medium"
                >
                  +1 Day
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // +3 Days: Keep same time, add 3 days
                    const startDate = new Date(formData.startDate);
                    const endDate = new Date(startDate.getTime() + (3 * 24 * 60 * 60 * 1000)); // Add 3 days in milliseconds
                    setFormData(prev => ({
                      ...prev,
                      endDate: endDate.toISOString().slice(0, 16)
                    }));
                  }}
                  className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors font-medium"
                >
                  +3 Days
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // +1 Week: Keep same time, add 7 days
                    const startDate = new Date(formData.startDate);
                    const endDate = new Date(startDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // Add 7 days in milliseconds
                    setFormData(prev => ({
                      ...prev,
                      endDate: endDate.toISOString().slice(0, 16)
                    }));
                  }}
                  className="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors font-medium"
                >
                  +1 Week
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // +1 Month: Keep same time, add 1 month
                    const startDate = new Date(formData.startDate);
                    const endDate = new Date(startDate);
                    endDate.setMonth(startDate.getMonth() + 1);
                    // Ensure the time stays exactly the same
                    endDate.setHours(startDate.getHours(), startDate.getMinutes(), startDate.getSeconds(), startDate.getMilliseconds());
                    setFormData(prev => ({
                      ...prev,
                      endDate: endDate.toISOString().slice(0, 16)
                    }));
                  }}
                  className="px-3 py-1.5 text-xs bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors font-medium"
                >
                  +1 Month
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                {formData.endDate && (
                  <span className="text-xs text-green-600 font-medium">
                    ✓ End date set!
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Helper for when no start date is selected */}
          {!formData.startDate && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Select a start date to see quick end date options</span>
              </div>
            </div>
          )}

          {/* Date Range Helper */}
          {formData.startDate && formData.endDate && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-green-800">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">
                    Duration: {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
                <div className="text-xs text-green-600">
                  {new Date(formData.startDate).toLocaleDateString()} - {new Date(formData.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Target Amount */}
        <div>
          <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-2">
            Target Amount (ETH) *
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.001"
              min="0"
              id="targetAmount"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-50 text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder-gray-500 ${
                errors.targetAmount ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="e.g. 1.5"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm font-medium">ETH</span>
            </div>
          </div>
          {errors.targetAmount && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.targetAmount}
            </p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            The funding goal for your project in ETH
          </p>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Project Location *
            </label>
            <div className="flex rounded-lg border border-gray-300 bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => setLocationInputMode('manual')}
                className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                  locationInputMode === 'manual'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Manual Input
              </button>
              <button
                type="button"
                onClick={() => setLocationInputMode('map')}
                className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                  locationInputMode === 'map'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Select on Map
              </button>
            </div>
          </div>

          {locationInputMode === 'manual' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude *
                </label>
                <input
                  type="text"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-50 text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder-gray-500 ${
                    errors.latitude ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="e.g. 40.7128"
                />
                {errors.latitude && (
                  <p className="text-red-500 text-sm mt-1">{errors.latitude}</p>
                )}
              </div>

              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude *
                </label>
                <input
                  type="text"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-50 text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder-gray-500 ${
                    errors.longitude ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="e.g. -74.0060"
                />
                {errors.longitude && (
                  <p className="text-red-500 text-sm mt-1">{errors.longitude}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="text-center">
                  <div className="text-3xl mb-2">🗺️</div>
                  <p className="text-sm text-gray-600 mb-3">
                    Click the button below to open the map and select your project location
                  </p>
                  <Button
                    variant="secondary"
                    onClick={openLocationPicker}
                  >
                    📍 Open Map Selector
                  </Button>
                  {formData.latitude && formData.longitude && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Location:</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex flex-col">
                          <span className="text-gray-600 font-medium">Latitude:</span>
                          <span className="font-mono text-blue-700 text-base">{parseFloat(formData.latitude).toFixed(6)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-600 font-medium">Longitude:</span>
                          <span className="font-mono text-blue-700 text-base">{parseFloat(formData.longitude).toFixed(6)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {(errors.latitude || errors.longitude) && (
                <p className="text-red-500 text-sm">
                  {errors.latitude || errors.longitude}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Transaction Status */}
        {(isPending || isConfirming || contractError) && (
          <div className="p-4 rounded-lg border">
            {isPending && (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span>Waiting for wallet confirmation...</span>
              </div>
            )}
            {isConfirming && (
              <div className="flex items-center text-yellow-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                <span>Transaction is being confirmed...</span>
              </div>
            )}
            {contractError && (
              <div className="flex items-center text-red-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Transaction failed: {contractError.message}</span>
              </div>
            )}
            {hash && (
              <div className="mt-2 text-sm text-gray-600">
                Transaction hash: 
                <code className="ml-1 bg-gray-100 px-1 rounded text-xs">
                  {hash.slice(0, 6)}...{hash.slice(-4)}
                </code>
              </div>
            )}
          </div>
        )}



        {/* Network Status */}
        {isConnected && (
          <div className={`p-4 border rounded-lg ${
            PlazaFactoryAddress[chainId] 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                PlazaFactoryAddress[chainId] ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              {PlazaFactoryAddress[chainId] ? (
                <span className="font-medium">
                  Connected to {chainId === 534351 ? 'Scroll Sepolia' : 'Ethereum Classic'} ✓
                </span>
              ) : (
                <span className="font-medium">
                  Unsupported network (Chain ID: {chainId}). Please switch to Scroll Sepolia or Ethereum Classic.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            size="lg"
            disabled={actualIsLoading || (isConnected && !PlazaFactoryAddress[chainId])}
            className="w-full"
          >
            {!isConnected && isLoading
              ? "Connecting Wallet..."
              : isConnected && !PlazaFactoryAddress[chainId]
                ? "Switch to Supported Network"
                : isPending 
                  ? "Confirm in Wallet..."
                  : isConfirming
                    ? "Confirming Transaction..."
                    : actualIsLoading
                      ? "Creating Project..."
                      : !isConnected
                        ? "Create Project (Connect Wallet)"
                        : "Create Project"
            }
          </Button>
        </div>
      </form>

      <LocationPicker
        isOpen={isLocationPickerOpen}
        onClose={closeLocationPicker}
        onLocationSelect={handleLocationSelect}
        initialLatitude={formData.latitude ? parseFloat(formData.latitude) : undefined}
        initialLongitude={formData.longitude ? parseFloat(formData.longitude) : undefined}
      />
    </motion.div>
    </>
  );
}
