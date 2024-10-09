'use client';

import React, { useState, useEffect } from 'react';
import { api } from "@/trpc/react";
import { DndContext, closestCenter, type UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import SortableItem from '@/components/admin/common/SortableItem.component';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useThemeContext } from '@/context/ThemeContext';
import { Box, Flex, Heading, TextField, Select, Button, Tabs } from '@radix-ui/themes';

const BonusStatManagement: React.FC = () => {
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [newItem, setNewItem] = useState({ id: '', name: '', categoryId: '', effect: '' });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { theme } = useThemeContext();
  const [items, setItems] = useState<{ id: string, name: string, effect: string, order: number, categoryId?: string }[]>([]);

  const categoriesQuery = api.bonusStat.getCategories.useQuery();
  const itemsQuery = api.bonusStat.getAllItems.useQuery();
  const createItemMutation = api.bonusStat.createItem.useMutation();
  const updateItemMutation = api.bonusStat.updateItem.useMutation();
  const deleteItemMutation = api.bonusStat.deleteItem.useMutation();
  const reorderMutation = api.bonusStat.reorder.useMutation();

  const [parent] = useAutoAnimate();

  useEffect(() => {
    if (categoriesQuery.data) {
      setCategories(categoriesQuery.data);
      if (categoriesQuery.data.length > 0 && !activeCategory) {
        setActiveCategory(categoriesQuery.data[0]?.id ?? null);
      }
    }
  }, [categoriesQuery.data, activeCategory]);

  useEffect(() => {
    if (itemsQuery.data && activeCategory) {
      setItems(
        itemsQuery.data
          .filter(item => item.category.id === activeCategory)
          .map(item => ({
            id: item.id,
            name: item.name,
            effect: item.effect,
            order: item.order,
            categoryId: item.category?.id || undefined,
          }))
          .sort((a, b) => a.order - b.order)
      );
    }
  }, [itemsQuery.data, activeCategory]);

  const handleCreateOrUpdateItem = () => {
    if (newItem.name && newItem.categoryId && newItem.effect) {
      if (editingItemId) {
        updateItemMutation.mutate(newItem, {
          onSuccess: () => {
            setNewItem({ id: '', name: '', categoryId: '', effect: '' });
            setEditingItemId(null);
            void itemsQuery.refetch();
          }
        });
      } else {
        createItemMutation.mutate(newItem, {
          onSuccess: () => {
            setNewItem({ id: '', name: '', categoryId: '', effect: '' });
            void itemsQuery.refetch();
          }
        });
      }
    }
  };

  const handleEditItem = (item: { id: string, name: string, categoryId?: string, effect: string }) => {
    setNewItem({
      ...item,
      categoryId: item.categoryId ?? '',
    });
    setEditingItemId(item.id);
  };

  const handleDeleteItem = (itemId: string) => {
    deleteItemMutation.mutate(itemId, {
      onSuccess: () => void itemsQuery.refetch(),
    });
  };

  const handleCancelEdit = () => {
    setNewItem({ id: '', name: '', categoryId: '', effect: '' });
    setEditingItemId(null);
  };

  const handleDragEnd = ({ active, over }: { active: { id: UniqueIdentifier }, over: { id: UniqueIdentifier } | null }) => {
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(item => item.id === String(active.id));
      const newIndex = items.findIndex(item => item.id === String(over?.id));

      const reorderedItems = arrayMove(items, oldIndex, newIndex);
      setItems(reorderedItems);

      reorderMutation.mutate({
        categoryId: activeCategory ?? '',
        sourceIndex: oldIndex,
        destinationIndex: newIndex,
      });
    }
  };

  return (
    <Flex direction="column" gap="6">
      <Box className="p-6 rounded-lg shadow-md" style={{ backgroundColor: 'var(--color-surface)' }}>
        <Heading size="4" mb="4">
          {editingItemId ? 'Edit Item' : 'Add New Item'}
        </Heading>
        <Flex direction="column" gap="4">
          <TextField.Root
            size="3"
            variant="surface"
            radius={theme.radius}
            style={{ flex: 1 }}
            value={newItem.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Item Name"
          />
          
          <Select.Root 
            value={newItem.categoryId}
            onValueChange={(value) => setNewItem(prev => ({ ...prev, categoryId: value }))}
          >
            <Select.Trigger placeholder="Select Category" />
            <Select.Content>
              {categories.map((category) => (
                <Select.Item key={category.id} value={category.id}>{category.name}</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          
          <TextField.Root
            size="3"
            variant="surface"
            radius={theme.radius}
            style={{ flex: 1 }}
            value={newItem.effect}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem(prev => ({ ...prev, effect: e.target.value }))}
            placeholder="Effect"
          />
          
          <Flex gap="2">
            <Button
              onClick={handleCreateOrUpdateItem}
              style={{
                backgroundColor: `var(--${theme.accentColor}-9)`,
                color: 'var(--color-background)',
                borderRadius: `var(--radius-${theme.radius})`,
              }}
            >
              {editingItemId ? 'Save Edit' : 'Add Item'}
            </Button>
            {editingItemId && (
              <Button
                onClick={handleCancelEdit}
                style={{
                  backgroundColor: 'var(--gray-5)',
                  color: 'var(--gray-12)',
                  borderRadius: `var(--radius-${theme.radius})`,
                }}
              >
                Cancel
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>

      <Box className="p-6 rounded-lg shadow-md" style={{ backgroundColor: 'var(--color-surface)' }}>
        <Heading size="4" mb="4">Item List</Heading>
        <Tabs.Root value={activeCategory ?? ''} onValueChange={setActiveCategory}>
          <Tabs.List>
            {categories.map((category) => (
              <Tabs.Trigger key={category.id} value={category.id}>
                {category.name}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>
        <Box ref={parent} mt="4">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
              {items.map(item => (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  item={item}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </SortableContext>
          </DndContext>
        </Box>
      </Box>
    </Flex>
  );
};

export default BonusStatManagement;
