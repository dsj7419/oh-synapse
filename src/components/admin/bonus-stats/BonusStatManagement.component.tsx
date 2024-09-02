'use client';
import React, { useState, useEffect } from 'react';
import { api } from "@/trpc/react";
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

const BonusStatManagement: React.FC = () => {
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [newItem, setNewItem] = useState({ id: '', name: '', categoryId: '', effect: '' });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categoriesQuery = api.bonusStat.getCategories.useQuery();
  const itemsQuery = api.bonusStat.getAllItems.useQuery();
  const createItemMutation = api.bonusStat.createItem.useMutation();
  const updateItemMutation = api.bonusStat.updateItem.useMutation();
  const deleteItemMutation = api.bonusStat.deleteItem.useMutation();

  useEffect(() => {
    if (categoriesQuery.data) {
      setCategories(categoriesQuery.data);
      if (categoriesQuery.data.length > 0 && !activeCategory) {
        setActiveCategory(categoriesQuery.data[0]?.id ?? null);
      }
    }
  }, [categoriesQuery.data, activeCategory]);

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

  const handleEditItem = (item: typeof newItem) => {
    setNewItem(item);
    setEditingItemId(item.id);
  };

  const handleDeleteItem = (itemId: string) => {
    deleteItemMutation.mutate(itemId, {
      onSuccess: () => void itemsQuery.refetch()
    });
  };

  const handleCancelEdit = () => {
    setNewItem({ id: '', name: '', categoryId: '', effect: '' });
    setEditingItemId(null);
  };

  return (
    <div className="space-y-8">
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
        <div className="space-y-2">
          {itemsQuery.data
            ?.filter(item => item.category.id === activeCategory)
            .map((item) => (
              <div key={item.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <div>
                  <strong>{item.name}</strong>: {item.effect}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default BonusStatManagement;