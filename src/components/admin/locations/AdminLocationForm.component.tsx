"use client";

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from "@/trpc/react";
import ThemedUploadButton from '@/components/common/ThemeUploadButton';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useThemeContext } from '@/context/ThemeContext';
import { Box, Flex, Heading, TextField, Button, Text, Card } from '@radix-ui/themes';

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
  const logActionMutation = api.auditLogs.logAction.useMutation();

  const { theme } = useThemeContext();

  const {
    control,
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
      await logActionMutation.mutateAsync({
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
        userId: session?.user?.id,
        username: session?.user?.name ?? undefined,
        userRole: session?.user?.roles?.join(', '),
      });
      onSave();
    } catch (error) {
      console.error('Error saving location:', error);
      await logActionMutation.mutateAsync({
        action: 'Create/Update Location Failed',
        resourceType: 'RecipeLocation',
        resourceId: data.id ?? 'unknown',
        severity: 'medium',
        details: { error: (error as Error).message },
        userId: session?.user?.id,
        username: session?.user?.name ?? undefined,
        userRole: session?.user?.roles?.join(', '),
      });
    }
  };

  const [uploadStatus1, setUploadStatus1] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadStatus2, setUploadStatus2] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  return (
    <Card size="3">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction="column" gap="4">
          {error && <Text color="red" mb="4">{error}</Text>}
          <Heading size="4" mb="4">{recipe?.name}</Heading>
          <Controller
            name="region"
            control={control}
            render={({ field }) => (
              <TextField.Root
                size="3"
                variant="surface"
                radius={theme.radius}
                style={{ flex: 1 }}
                value={field.value || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value)}
                placeholder="Region"
              />
            )}
          />
          {errors.region && <Text color="red">{errors.region.message}</Text>}

          <Controller
            name="locationName"
            control={control}
            render={({ field }) => (
              <TextField.Root
                size="3"
                variant="surface"
                radius={theme.radius}
                style={{ flex: 1 }}
                value={field.value || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value)}
                placeholder="Location Name"
              />
            )}
          />
          {errors.locationName && <Text color="red">{errors.locationName.message}</Text>}

          <Controller
            name="coordinates"
            control={control}
            render={({ field }) => (
              <TextField.Root
                size="3"
                variant="surface"
                radius={theme.radius}
                style={{ flex: 1 }}
                value={field.value || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value)}
                placeholder="Coordinates"
              />
            )}
          />
          {errors.coordinates && <Text color="red">{errors.coordinates.message}</Text>}

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField.Root
                size="3"
                variant="surface"
                radius={theme.radius}
                style={{ flex: 1 }}
                value={field.value || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value)}
                placeholder="Description"
              />
            )}
          />
          {errors.description && <Text color="red">{errors.description.message}</Text>}

          <Box>
            <Text as="label" size="2" weight="bold">Photo Location</Text>
            <Flex align="center" gap="2" mt="1">
              <ThemedUploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  const uploadedFile = res?.[0];
                  if (uploadedFile) {
                    setValue('image1', uploadedFile.url);
                    setUploadStatus1('success');
                    // Log upload success
                  }
                  setTimeout(() => setUploadStatus1('idle'), 3000);
                }}
                onUploadError={(error: Error) => {
                  console.error('Error uploading file:', error);
                  setError(`Upload failed: ${error.message}`);
                  setUploadStatus1('error');
                  // Log upload failure
                  setTimeout(() => setUploadStatus1('idle'), 3000);
                }}
                onUploadBegin={() => setUploadStatus1('uploading')}
              />
              {uploadStatus1 === 'uploading' && <Text color="blue">Uploading...</Text>}
              {uploadStatus1 === 'success' && <Text color="green">Upload successful!</Text>}
              {uploadStatus1 === 'error' && <Text color="red">Upload failed</Text>}
            </Flex>
          </Box>
          {watch('image1') && (
            <Box mt="2">
              <Image src={watch('image1')!} alt="Photo Location" width={128} height={128} style={{ objectFit: 'cover', borderRadius: `var(--radius-${theme.radius})` }} />
            </Box>
          )}

          <Box>
            <Text as="label" size="2" weight="bold">Map Location</Text>
            <Flex align="center" gap="2" mt="1">
              <ThemedUploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  const uploadedFile = res?.[0];
                  if (uploadedFile) {
                    setValue('image2', uploadedFile.url);
                    setUploadStatus2('success');
                    // Log upload success
                  }
                  setTimeout(() => setUploadStatus2('idle'), 3000);
                }}
                onUploadError={(error: Error) => {
                  console.error('Error uploading file:', error);
                  setError(`Upload failed: ${error.message}`);
                  setUploadStatus2('error');
                  // Log upload failure
                  setTimeout(() => setUploadStatus2('idle'), 3000);
                }}
                onUploadBegin={() => setUploadStatus2('uploading')}
              />
              {uploadStatus2 === 'uploading' && <Text color="blue">Uploading...</Text>}
              {uploadStatus2 === 'success' && <Text color="green">Upload successful!</Text>}
              {uploadStatus2 === 'error' && <Text color="red">Upload failed</Text>}
            </Flex>
          </Box>
          {watch('image2') && (
            <Box mt="2">
              <Image src={watch('image2')!} alt="Map Location" width={128} height={128} style={{ objectFit: 'cover', borderRadius: `var(--radius-${theme.radius})` }} />
            </Box>
          )}

          <Flex justify="between" mt="4">
            <Button
              onClick={handleSubmit(onSubmit)}
              style={{
                backgroundColor: `var(--${theme.accentColor}-9)`,
                color: 'var(--color-background)',
                borderRadius: `var(--radius-${theme.radius})`,
              }}
            >
              {locationData ? 'Update Location' : 'Create Location'}
            </Button>
            <Button
              onClick={onCancel}
              style={{
                backgroundColor: 'var(--gray-5)',
                color: 'var(--gray-12)',
                borderRadius: `var(--radius-${theme.radius})`,
              }}
            >
              Cancel
            </Button>
          </Flex>
        </Flex>
      </form>
    </Card>
  );
};

export default AdminLocationForm;