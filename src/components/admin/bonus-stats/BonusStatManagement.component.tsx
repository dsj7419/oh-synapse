'use client';

import React, { useState, useEffect } from 'react';
import { api } from "@/trpc/react";
import { DndContext, closestCenter, type UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import SortableItem from '@/components/admin/common/SortableItem.component';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

const BonusStatManagement: React.FC = () => {
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [newItem, setNewItem] = useState({ id: '', name: '', categoryId: '', effect: '' });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
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
    <div className="space-y-8">
      {/* Form for Adding/Editing Bonus Stat */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">
          {editingItemId ? 'Edit Item' : 'Add New Item'}
        </h2>
        <div className="space-y-4 mb-4">
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Item Name"
            className="w-full p-2 border rounded"
          />
          <select
            value={newItem.categoryId}
            onChange={(e) => setNewItem(prev => ({ ...prev, categoryId: e.target.value }))}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={newItem.effect}
            onChange={(e) => setNewItem(prev => ({ ...prev, effect: e.target.value }))}
            placeholder="Effect"
            className="w-full p-2 border rounded"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleCreateOrUpdateItem}
              className={`flex-1 ${editingItemId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white px-4 py-2 rounded`}
            >
              {editingItemId ? 'Save Edit' : 'Add Item'}
            </button>
            {editingItemId && (
              <button
                onClick={handleCancelEdit}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bonus Stat List with Drag and Drop */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Item List</h2>
        <div className="mb-4">
          <nav className="flex space-x-4 border-b border-gray-200">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`py-2 px-4 text-sm font-medium ${
                  activeCategory === category.id
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </nav>
        </div>
        <div ref={parent} className="space-y-2">
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
        </div>
      </div>
    </div>
  );
};

export default BonusStatManagement;
