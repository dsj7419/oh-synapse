"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from "@/trpc/react";
import { generateUploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/server/uploadthing";
import { useSession } from 'next-auth/react';
import { logAction } from "@/utils/auditLogger";
import Image from 'next/image';

const UploadButton = generateUploadButton<OurFileRouter>();

const locationSchema = z.object({
  id: z.string().optional(),
  recipeId: z.string(),
  coordinates: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  image1: z.string().nullable().optional(),
  image2: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  locationName: z.string().nullable().optional(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

interface AdminLocationFormProps {
  recipeId: string;
  onSave: () => void;
  onCancel: () => void;
}

const AdminLocationForm: React.FC<AdminLocationFormProps> = ({ recipeId, onSave, onCancel }) => {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? 'unknown';
  const username = session?.user?.name ?? 'unknown';
  const userRole = session?.user?.roles?.join(', ') ?? 'editor';

  const { data: recipe } = api.recipe.getById.useQuery(recipeId);
  const { data: locationData } = api.location.getByRecipeId.useQuery(recipeId, {
    enabled: !!recipeId,
  });

  const createOrUpdateMutation = api.location.createOrUpdateLocation.useMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      recipeId,
      coordinates: '',
      description: '',
      image1: null,
      image2: null,
      region: '',
      locationName: '',
    },
  });

  useEffect(() => {
    if (locationData) {
      reset({
        id: locationData.id,
        recipeId: locationData.recipeId,
        coordinates: locationData.coordinates ?? '',
        description: locationData.description ?? '',
        image1: locationData.image1 ?? null,
        image2: locationData.image2 ?? null,
        region: locationData.region ?? '',
        locationName: locationData.locationName ?? '',
      });
    }
  }, [locationData, reset]);

  const onSubmit = async (data: LocationFormValues) => {
    try {
      await createOrUpdateMutation.mutateAsync(data);
      await logAction({
        userId,
        username,
        userRole,
        action: data.id ? 'Update Location' : 'Create Location',
        resourceType: 'RecipeLocation',
        resourceId: data.id ?? 'unknown',
        severity: data.id ? 'medium' : 'normal',
        details: {
          recipeId: data.recipeId,
          coordinates: data.coordinates,
          description: data.description,
          region: data.region,
          locationName: data.locationName,
        },
      });
      onSave();
    } catch (error) {
      console.error('Error saving location:', error);
      await logAction({
        userId,
        username,
        userRole,
        action: 'Create/Update Location Failed',
        resourceType: 'RecipeLocation',
        resourceId: data.id ?? 'unknown',
        severity: 'medium',
        details: { error: (error as Error).message },
      });
    }
  };

  const [uploadStatus1, setUploadStatus1] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadStatus2, setUploadStatus2] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <h2 className="text-2xl font-bold mb-4">{recipe?.name}</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Region</label>
        <input
          type="text"
          {...register('region')}
          className="w-full p-2 border rounded"
        />
        {errors.region && <span className="text-red-500">{errors.region.message}</span>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Location Name</label>
        <input
          type="text"
          {...register('locationName')}
          className="w-full p-2 border rounded"
        />
        {errors.locationName && <span className="text-red-500">{errors.locationName.message}</span>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Coordinates</label>
        <input
          type="text"
          {...register('coordinates')}
          className="w-full p-2 border rounded"
        />
        {errors.coordinates && <span className="text-red-500">{errors.coordinates.message}</span>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea {...register('description')} className="w-full p-2 border rounded" />
        {errors.description && <span className="text-red-500">{errors.description.message}</span>}
      </div>

      {/* Image Uploads */}
      <div className="mt-4 flex items-center">
        <label className="block text-sm font-medium text-gray-700 mr-4">Photo Location</label>
        <UploadButton
          endpoint="imageUploader"
          onClientUploadComplete={async (res) => {
            const uploadedFile = res?.[0];
            if (uploadedFile) {
              setValue('image1', uploadedFile.url);
              setUploadStatus1('success');
              // Log upload success
              await logAction({
                userId,
                username,
                userRole,
                action: 'Upload Image Successful',
                resourceType: 'Location Image',
                resourceId: uploadedFile.url,
                severity: 'normal',
                details: { imageUrl: uploadedFile.url },
              });
            }
            setTimeout(() => setUploadStatus1('idle'), 3000);
          }}
          onUploadError={async (error: Error) => {
            console.error('Error uploading file:', error);
            setError(`Upload failed: ${error.message}`);
            setUploadStatus1('error');
            // Log upload failure
            await logAction({
              userId,
              username,
              userRole,
              action: 'Upload Image Failed',
              resourceType: 'Location Image',
              resourceId: 'unknown',
              severity: 'medium',
              details: { error: error.message },
            });
            setTimeout(() => setUploadStatus1('idle'), 3000);
          }}
        />
        {uploadStatus1 === 'uploading' && <span className="ml-2 text-blue-500">Uploading...</span>}
        {uploadStatus1 === 'success' && (
          <span className="ml-2 text-green-500">Upload successful!</span>
        )}
        {uploadStatus1 === 'error' && <span className="ml-2 text-red-500">Upload failed</span>}
      </div>
      {watch('image1') && (
        <div className="mt-2">
          <Image src={watch('image1')!} alt="Photo Location" width={200} height={200} />
        </div>
      )}

      <div className="mt-4 flex items-center">
        <label className="block text-sm font-medium text-gray-700 mr-4">Map Location</label>
        <UploadButton
          endpoint="imageUploader"
          onClientUploadComplete={async (res) => {
            const uploadedFile = res?.[0];
            if (uploadedFile) {
              setValue('image2', uploadedFile.url);
              setUploadStatus2('success');
              // Log upload success
              await logAction({
                userId,
                username,
                userRole,
                action: 'Upload Image Successful',
                resourceType: 'Location Image',
                resourceId: uploadedFile.url,
                severity: 'normal',
                details: { imageUrl: uploadedFile.url },
              });
            }
            setTimeout(() => setUploadStatus2('idle'), 3000);
          }}
          onUploadError={async (error: Error) => {
            console.error('Error uploading file:', error);
            setError(`Upload failed: ${error.message}`);
            setUploadStatus2('error');
            // Log upload failure
            await logAction({
              userId,
              username,
              userRole,
              action: 'Upload Image Failed',
              resourceType: 'Location Image',
              resourceId: 'unknown',
              severity: 'medium',
              details: { error: error.message },
            });
            setTimeout(() => setUploadStatus2('idle'), 3000);
          }}
        />
        {uploadStatus2 === 'uploading' && <span className="ml-2 text-blue-500">Uploading...</span>}
        {uploadStatus2 === 'success' && (
          <span className="ml-2 text-green-500">Upload successful!</span>
        )}
        {uploadStatus2 === 'error' && <span className="ml-2 text-red-500">Upload failed</span>}
      </div>
      {watch('image2') && (
        <div className="mt-2">
          <Image src={watch('image2')!} alt="Map Location" width={200} height={200} />
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {locationData ? 'Update Location' : 'Create Location'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AdminLocationForm;
