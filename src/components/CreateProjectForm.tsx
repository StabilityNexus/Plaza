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
  startTime: string;
  endTime: string;
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

      const lat = parseFloat(data.latitude.trim());
      const lon = parseFloat(data.longitude.trim());
      const startTime = Math.floor(new Date(data.startTime).getTime() / 1000);
      const endTime = Math.floor(new Date(data.endTime).getTime() / 1000);
      const targetAmount = BigInt(data.targetAmount);

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
          targetAmount,
        ],
      });

      console.log("Transaction:", tx);
      setSubmitStatus("Project created successfully!");
      toast("Project created successfully!");
    } catch (error: any) {
      console.error("Error creating project:", error);
      setSubmitStatus("Error creating project.");
      toast.error(error?.message || "An error occurred while creating the project.");
    } finally {
      setLoading(false);
      setTimeout(() => setSubmitStatus(null), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Token Name</Label>
          <Input id="name" {...register("name", { required: "Token name is required" })} />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="symbol">Token Symbol</Label>
          <Input id="symbol" {...register("symbol", { required: "Token symbol is required" })} />
          {errors.symbol && <p className="text-red-500 text-sm">{errors.symbol.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="projectName">Project Name</Label>
        <Input id="projectName" {...register("projectName", { required: "Project name is required" })} />
        {errors.projectName && <p className="text-red-500 text-sm">{errors.projectName.message}</p>}
      </div>

      <div>
        <Label htmlFor="projectDescription">Project Description</Label>
        <textarea 
  className="w-full p-2 border border-gray-300 bg-white text-black rounded-md"
  {...register("projectDescription", { required: "Project description is required" })}
/>

        {errors.projectDescription && <p className="text-red-500 text-sm">{errors.projectDescription.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" {...register("latitude", { required: "Latitude is required" })} />
          {errors.latitude && <p className="text-red-500 text-sm">{errors.latitude.message}</p>}
        </div>
        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" {...register("longitude", { required: "Longitude is required" })} />
          {errors.longitude && <p className="text-red-500 text-sm">{errors.longitude.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="targetAmount">Target Amount (in wei)</Label>
        <Input id="targetAmount" {...register("targetAmount", { required: "Target amount is required" })} />
        {errors.targetAmount && <p className="text-red-500 text-sm">{errors.targetAmount.message}</p>}
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Submitting..." : "Create Project"}
      </Button>

      {submitStatus && <p className="text-center text-green-500 mt-2">{submitStatus}</p>}
      <Toaster />
    </form>
  );
}
