"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { writeContract } from "@wagmi/core";
import { PlazaFactoryAbi } from "@/utlis/contractsABI/PlazaFactoryAbi";
import { PlazaFactoryAddress } from "@/utlis/addresses";
import { Toaster, toast } from "sonner";
import { config } from "@/utlis/config";

interface ProjectFormData {
  name: string;
  symbol: string;
  projectName: string;
  projectDescription: string;
  latitude: string;
  longitude: string;
  startTime: string; // Only date in yyyy-mm-dd format
  endTime: string; // Only date in yyyy-mm-dd format
  targetAmount: string;
}

export function CreateProjectForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>();

  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const onSubmit = async (data: ProjectFormData) => {
    setLoading(true);
    try {
      const chainId = config.state.chainId;

      // Convert string inputs into the expected types:
      const lat = parseInt(data.latitude.trim());
      const lon = parseInt(data.longitude.trim());
      // Since the input type is "date", the time defaults to midnight (00:00)
      const startTime = Math.floor(new Date(data.startTime).getTime() / 1000);
      const endTime = Math.floor(new Date(data.endTime).getTime() / 1000);
      const targetAmount = BigInt(data.targetAmount);

      // Call the createProject function from the PlazaFactory contract.
      const tx = await writeContract(config as any, {
        address: PlazaFactoryAddress[chainId] as `0x${string}`,
        abi: PlazaFactoryAbi,
        functionName: "createProject",
        args: [
          data.name,
          data.symbol,
          data.projectName,
          data.projectDescription,
          lat,
          lon,
          startTime,
          endTime,
          targetAmount,
        ],
      });

      console.log("Transaction:", tx);
      setSubmitStatus("Project created successfully!");
      toast("Project created successfully!");
    } catch (error: any) {
      console.error("Error creating project:", error);
      setSubmitStatus("Error creating project.");
      toast.error(
        error?.message || "An error occurred while creating the project."
      );
    } finally {
      setLoading(false);
      // Clear status after a delay.
      setTimeout(() => setSubmitStatus(null), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">Token Name</Label>
        <Input
          id="name"
          {...register("name", { required: "Token name is required" })}
          className="rounded-md border border-gray-300 bg-white text-black"
        />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="symbol">Token Symbol</Label>
        <Input
          id="symbol"
          {...register("symbol", { required: "Token symbol is required" })}
          className="rounded-md border border-gray-300 bg-white text-black"
        />
        {errors.symbol && (
          <p className="text-red-500">{errors.symbol.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="projectName">Project Name</Label>
        <Input
          id="projectName"
          {...register("projectName", { required: "Project name is required" })}
          className="rounded-md border border-gray-300 bg-white text-black"
        />
        {errors.projectName && (
          <p className="text-red-500">{errors.projectName.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="projectDescription">Project Description</Label>
        <textarea
          id="projectDescription"
          {...register("projectDescription", {
            required: "Project description is required",
          })}
          className="w-full p-2 border border-gray-300 bg-white text-black rounded-md"
          placeholder="Enter project description..."
        />
        {errors.projectDescription && (
          <p className="text-red-500">{errors.projectDescription.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="latitude">Latitude</Label>
        <Input
          id="latitude"
          {...register("latitude", { required: "Latitude is required" })}
          className="rounded-md border border-gray-300 bg-white text-black"
        />
        {errors.latitude && (
          <p className="text-red-500">{errors.latitude.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="longitude">Longitude</Label>
        <Input
          id="longitude"
          {...register("longitude", { required: "Longitude is required" })}
          className="rounded-md border border-gray-300 bg-white text-black"
        />
        {errors.longitude && (
          <p className="text-red-500">{errors.longitude.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="startTime">Start Date</Label>
        <Input
          id="startTime"
          type="date"
          {...register("startTime", { required: "Start date is required" })}
          className="rounded-md border border-gray-300 bg-white text-black"
        />
        {errors.startTime && (
          <p className="text-red-500">{errors.startTime.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="endTime">End Date</Label>
        <Input
          id="endTime"
          type="date"
          {...register("endTime", { required: "End date is required" })}
          className="rounded-md border border-gray-300 bg-white text-black"
        />
        {errors.endTime && (
          <p className="text-red-500">{errors.endTime.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="targetAmount">Target Amount (in wei)</Label>
        <Input
          id="targetAmount"
          {...register("targetAmount", {
            required: "Target amount is required",
          })}
          className="rounded-md border border-gray-300 bg-white text-black"
        />
        {errors.targetAmount && (
          <p className="text-red-500">{errors.targetAmount.message}</p>
        )}
      </div>

      <Button type="submit" disabled={loading} className="border border-black">
        {loading ? "Submitting..." : "Submit"}
      </Button>

      {submitStatus && <p className="text-green-500">{submitStatus}</p>}
      <Toaster />
    </form>
  );
}
