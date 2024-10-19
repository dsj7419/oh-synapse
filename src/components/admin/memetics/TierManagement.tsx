// src/components/admin/TierManagement.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { api } from "@/trpc/react";
import {
  Box,
  Flex,
  Heading,
  TextField,
  Button,
  Dialog,
} from '@radix-ui/themes';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableItem from './common/SortableItem.component';
import { type Tier } from '@prisma/client';
import { useQueryClient } from '@tanstack/react-query';
import ConfirmationModal from '@/components/common/ConfirmationModal.component';
import Toast from '@/components/common/Toast';
import { useThemeContext } from '@/context/ThemeContext';
import { TRPCClientError } from '@trpc/client';

const TierManagement: React.FC = () => {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [editingTier, setEditingTier] = useState<Tier | null>(null);
  const [deletingTierId, setDeletingTierId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { theme } = useThemeContext();
  const queryClient = useQueryClient();

  const tiersQuery = api.memetic.getAllTiers.useQuery();
  const createTierMutation = api.memetic.createTier.useMutation({
    onSuccess: (newTier) => {
      queryClient.invalidateQueries({ queryKey: ['memetic', 'getAllTiers'] });
      setTiers(prev => [...prev, newTier].sort((a, b) => a.order - b.order));
      showToast('Tier created successfully', 'success');
    },
    onError: (error) => {
      showToast(`Failed to create tier: ${error.message}`, 'error');
    },
  });

  const updateTierMutation = api.memetic.updateTier.useMutation({
    onSuccess: (updatedTier) => {
      queryClient.invalidateQueries({ queryKey: ['memetic', 'getAllTiers'] });
      setTiers(prev => prev.map(t => t.id === updatedTier.id ? updatedTier : t));
      showToast('Tier updated successfully', 'success');
    },
    onError: (error) => {
      showToast(`Failed to update tier: ${error.message}`, 'error');
    },
  });

  const deleteTierMutation = api.memetic.deleteTier.useMutation({
    onSuccess: (deletedTier) => {
      queryClient.invalidateQueries({ queryKey: ['memetic', 'getAllTiers'] });
      setTiers(prev => prev.filter(t => t.id !== deletedTier.id));
      showToast('Tier deleted successfully', 'success');
    },
    onError: (error) => {
      showToast(`Failed to delete tier: ${error.message}`, 'error');
    },
  });

  const updateTierOrderMutation = api.memetic.updateTierOrder.useMutation();

  useEffect(() => {
    if (tiersQuery.data) {
      // Exclude 'Unassigned' tier from the list
      const filteredTiers = tiersQuery.data.filter(tier => tier.tier !== 'Unassigned');
      setTiers(filteredTiers.sort((a, b) => a.order - b.order));
    }
  }, [tiersQuery.data]);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleCreateTier = useCallback(() => {
    const newOrder = tiers.length > 0 ? Math.max(...tiers.map(t => t.order)) + 1 : 1;
    setEditingTier({
      id: '',
      tier: '',
      color: '#ffffff',
      order: newOrder,
    } as Tier);
  }, [tiers]);

  const handleSaveTier = useCallback(async () => {
    if (editingTier) {
      try {
        if (editingTier.id) {
          await updateTierMutation.mutateAsync(editingTier);
        } else {
          await createTierMutation.mutateAsync(editingTier);
        }
        setEditingTier(null);
      } catch (error) {
        console.error("Error saving tier:", error);
      }
    }
  }, [editingTier, updateTierMutation, createTierMutation]);

  const handleEditTier = useCallback((tier: Tier) => {
    setEditingTier(tier);
  }, []);

  const handleDeleteTier = useCallback(async (id: string) => {
    try {
      await deleteTierMutation.mutateAsync(id);
      showToast('Tier deleted successfully', 'success');
    } catch (error) {
      if (error instanceof TRPCClientError) {
        showToast(error.message, 'error');
      } else {
        showToast('An unexpected error occurred', 'error');
      }
    }
  }, [deleteTierMutation, showToast]);

  const confirmDeleteTier = useCallback(async () => {
    if (deletingTierId) {
      try {
        await deleteTierMutation.mutateAsync(deletingTierId);
      } catch (error) {
        console.error("Error deleting tier:", error);
      } finally {
        setDeletingTierId(null);
      }
    }
  }, [deletingTierId, deleteTierMutation]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTiers((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update the order of all items
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          order: index + 1,
        }));

        // Call the mutation to update the order in the backend
        updateTierOrderMutation.mutate(
          updatedItems.map((item) => ({ id: item.id, order: item.order }))
        );

        return updatedItems;
      });
    }
  }, [updateTierOrderMutation]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <Box style={{ maxWidth: 'auto', margin: '0 auto' }}>
      <Flex direction="column" align="start" mb="4">
        <Heading size="6">Manage Tiers</Heading>
        <Button onClick={handleCreateTier} mt="2">Create New Tier</Button>
      </Flex>
      <Box>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={tiers.map(tier => tier.id)} strategy={verticalListSortingStrategy}>
            {tiers.map((tier) => (
              <SortableItem
                key={tier.id}
                id={tier.id}
                item={tier}
                onEdit={() => handleEditTier(tier)}
                onDelete={() => handleDeleteTier(tier.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </Box>
      <Dialog.Root open={!!editingTier} onOpenChange={(open) => !open && setEditingTier(null)}>
        <Dialog.Content style={{ maxWidth: 400 }}>
          <Dialog.Title>{editingTier?.id ? 'Edit Tier' : 'Create Tier'}</Dialog.Title>
          <Flex direction="column" gap="3">
            <TextField.Root
              value={editingTier?.tier || ''}
              onChange={(e) =>
                setEditingTier((prev) => prev && { ...prev, tier: e.target.value })
              }
              placeholder="Tier"
            />
            <Flex align="center" gap="2">
              <Box>Color:</Box>
              <input
                type="color"
                value={editingTier?.color || '#ffffff'}
                onChange={(e) =>
                  setEditingTier((prev) => prev && { ...prev, color: e.target.value })
                }
                style={{ width: '100%', height: '30px' }}
              />
            </Flex>
          </Flex>
          <Flex gap="3" mt="4" justify="end">
            <Button variant="soft" color="gray" onClick={() => setEditingTier(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTier}>
              {editingTier?.id ? 'Save Changes' : 'Create Tier'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
      <ConfirmationModal
        isOpen={!!deletingTierId}
        onClose={() => setDeletingTierId(null)}
        onConfirm={confirmDeleteTier}
        title="Delete Tier"
        message="Are you sure you want to delete this tier? This action cannot be undone."
        confirmText="Delete"
        confirmColor="red"
      />
      {toast && (
        <Box style={{ position: 'fixed', bottom: '20px', left: '20px' }}>
          <Toast message={toast.message} type={toast.type} />
        </Box>
      )}
    </Box>
  );
};

export default TierManagement;
