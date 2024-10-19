// src/components/admin/MemeticForm.tsx

import React, { useState, useEffect } from 'react';
import { Box, Flex, Button, Select, Dialog, Text, TextField } from '@radix-ui/themes';
import { Memetic, Tier, Tag } from '@prisma/client';
import { useThemeContext } from '@/context/ThemeContext';
import { api } from "@/trpc/react";
import ThemedUploadButton from '@/components/common/ThemeUploadButton';
import Image from 'next/image';

const MAX_LEVEL_ASSIGNMENT = 500;

interface MemeticFormProps {
  memetic: Partial<Memetic>;
  onClose: () => void;
  onSave: (memeticData: Partial<Memetic>) => void;
  tiers: Tier[];
  memetics: (Memetic & { tier: Tier | null })[];
}

const MemeticForm: React.FC<MemeticFormProps> = ({ memetic, onClose, onSave, tiers, memetics }) => {
  const [formData, setFormData] = useState<Partial<Memetic>>(memetic);
  const [error, setError] = useState<string | null>(null);
  const [levelAssignmentsText, setLevelAssignmentsText] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const { theme } = useThemeContext();

  const tagsQuery = api.memetic.getAllTags.useQuery();

  useEffect(() => {
    setFormData(memetic);
    setLevelAssignmentsText(memetic.levelAssignments?.join(', ') ?? '');
  }, [memetic]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTierChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tierId: value }));

    const memeticsInTier = memetics.filter(
      (m: Memetic) => m.tierId === value && m.id !== memetic.id
    );
    const usedRanks = new Set(memeticsInTier.map((m: Memetic) => m.defaultRank));
    let lowestAvailableRank = 1;
    while (usedRanks.has(lowestAvailableRank)) {
      lowestAvailableRank++;
    }
    setFormData((prev) => ({ ...prev, defaultRank: lowestAvailableRank }));
  };

  const validateRank = () => {
    const memeticsInTier = memetics.filter(
      (m: Memetic) => m.tierId === formData.tierId && m.id !== memetic.id
    );
    const usedRanks = new Set(memeticsInTier.map((m: Memetic) => m.defaultRank));
    return !usedRanks.has(formData.defaultRank ?? 0);
  };

  const handleLevelAssignmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setLevelAssignmentsText(text);

    const numbers = text
      .split(',')
      .map(s => s.trim())
      .map(s => {
        const num = parseInt(s, 10);
        return isNaN(num) ? null : num;
      })
      .filter((n): n is number => n !== null && n > 0 && n <= MAX_LEVEL_ASSIGNMENT)
      .sort((a, b) => a - b);

    setFormData(prev => ({ ...prev, levelAssignments: numbers }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateRank()) {
      setError('A memetic with this rank already exists in the selected tier.');
      return;
    }

    if (formData.levelAssignments && formData.levelAssignments.length > 0) {
      const invalidAssignments = formData.levelAssignments.filter(n => !Number.isInteger(n) || n <= 0 || n > MAX_LEVEL_ASSIGNMENT);
      if (invalidAssignments.length > 0) {
        setError(`Level assignments must be positive integers not exceeding ${MAX_LEVEL_ASSIGNMENT}. Please correct the input.`);
        return;
      }
    }

    try {
      const dataToSave = {
        ...formData,
        levelAssignments: (formData.levelAssignments ?? []).sort((a, b) => a - b),
        image: formData.image ?? undefined, 
      };
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error("An error occurred:", error);
      setError('Failed to save the memetic. Please try again.');
    }
  };

  const isFormValid =
    formData.title &&
    formData.description &&
    formData.tierId &&
    formData.tagId &&
    validateRank();

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content style={{ maxWidth: 500 }}>
        <Dialog.Title>{formData.id ? 'Edit Memetic' : 'Create Memetic'}</Dialog.Title>
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="3">
            <label htmlFor="title">Title</label>
            <TextField.Root
              id="title"
              name="title"
              value={formData.title  ?? ''}
              onChange={handleChange}
              required
              placeholder="Title"
            />

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description ?? ''}
              onChange={handleChange}
              required
              style={{ height: '100px', padding: 'var(--space-2)', borderRadius: 'var(--radius-3)' }}
            />

            <Select.Root value={formData.tierId ?? ''} onValueChange={handleTierChange} required>
              <Select.Trigger placeholder="Select Tier" />
              <Select.Content>
                {tiers
                  ?.filter((tier) => tier.tier !== 'Unassigned')
                  .map((tier: Tier) => (
                    <Select.Item key={tier.id} value={tier.id}>
                      {tier.tier}
                    </Select.Item>
                  ))}
              </Select.Content>
            </Select.Root>

            <label htmlFor="defaultRank">Default Rank</label>
            <TextField.Root
              id="defaultRank"
              name="defaultRank"
              type="number"
              value={formData.defaultRank?.toString() ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({
                  ...prev,
                  defaultRank: parseInt(e.target.value, 10),
                }))
              }
              required
              placeholder="Default Rank"
            />
            {!validateRank() && (
              <Text color="red">This rank is already taken in the selected tier.</Text>
            )}

            {/* Level Assignments */}
            <label htmlFor="levelAssignments">Level Assignments</label>
            <TextField.Root
              id="levelAssignments"
              name="levelAssignments"
              value={levelAssignmentsText}
              onChange={handleLevelAssignmentsChange}
              placeholder="e.g., 5, 10, 15"
            />

            {/* Tag Selection */}
            <Select.Root
              value={formData.tagId ?? ''}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, tagId: value }))
              }
              required
            >
              <Select.Trigger placeholder="Select Tag" />
              <Select.Content>
                {tagsQuery.data?.map((tag: Tag) => (
                  <Select.Item key={tag.id} value={tag.id}>
                    {tag.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            {/* Image Upload Button for Memetic Icon */}
            <Box>
              <Text as="label" size="2" weight="bold">Memetic Icon</Text>
              <Flex align="center" gap="2" mt="1">
                <ThemedUploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    const uploadedFile = res?.[0];
                    if (uploadedFile) {
                      setFormData((prev) => ({ ...prev, image: uploadedFile.url }));
                      setUploadStatus('success');
                    }
                    setTimeout(() => setUploadStatus('idle'), 3000);
                  }}
                  onUploadError={(error: Error) => {
                    console.error('Error uploading file:', error);
                    setError(`Upload failed: ${error.message}`);
                    setUploadStatus('error');
                    setTimeout(() => setUploadStatus('idle'), 3000);
                  }}
                  onUploadBegin={() => setUploadStatus('uploading')}
                />
                {uploadStatus === 'uploading' && <Text color="blue">Uploading...</Text>}
                {uploadStatus === 'success' && <Text color="green">Upload successful!</Text>}
                {uploadStatus === 'error' && <Text color="red">Upload failed</Text>}
              </Flex>
            </Box>

            {/* Image Preview */}
            {formData.image && (
              <Box mt="2">
                <Image 
                  src={formData.image} 
                  alt="Memetic Icon" 
                  width={64} 
                  height={64} 
                  style={{ objectFit: 'cover', borderRadius: `var(--radius-${theme.radius})` }}
                />
              </Box>
            )}

          </Flex>
          {error && (
            <Text color="red" style={{ marginTop: 'var(--space-3)' }}>
              {error}
            </Text>
          )}
          <Flex gap="3" mt="4" justify="end">
            <Button variant="soft" color="gray" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid}>
              {formData.id ? 'Save Changes' : 'Create Memetic'}
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default MemeticForm;
