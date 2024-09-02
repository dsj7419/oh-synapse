'use client';
import React, { useState } from 'react';
import { api } from "@/trpc/react";
import { XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '@/components/common/ConfirmationModal.component';

const CategoryManagement: React.FC = () => {
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ id: string, name: string } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string, name: string } | null>(null);

  const categoriesQuery = api.bonusStat.getCategories.useQuery();
  const createCategoryMutation = api.bonusStat.createCategory.useMutation();
  const updateCategoryMutation = api.bonusStat.updateCategory.useMutation();
  const deleteCategoryMutation = api.bonusStat.deleteCategory.useMutation();

  const handleCreateCategory = async () => {
    if (newCategory.trim()) {
      try {
        await createCategoryMutation.mutateAsync(newCategory);
        setNewCategory('');
        await categoriesQuery.refetch();
      } catch (error) {
        console.error('Error creating category:', error);
      }
    }
  };

  const handleUpdateCategory = async () => {
    if (editingCategory) {
      await updateCategoryMutation.mutateAsync(editingCategory);
      setEditingCategory(null);
      await categoriesQuery.refetch();
    }
  };

  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete.id, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
          void categoriesQuery.refetch();
        },
        onError: (error) => {
          console.error('Error deleting category:', error);
          alert(`Error deleting category: ${error.message}`);
        }
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Category Management</h2>
      <div className="flex mb-4">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New Category"
          className="flex-grow p-2 border rounded-l"
        />
        <button
          onClick={handleCreateCategory}
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
        >
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {categoriesQuery.data?.map((category) => (
          <li key={category.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
            {editingCategory?.id === category.id ? (
              <input
                type="text"
                value={editingCategory.name}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                className="flex-grow p-1 border rounded mr-2"
              />
            ) : (
              category.name
            )}
            <div>
              {editingCategory?.id === category.id ? (
                <>
                  <button
                    onClick={handleUpdateCategory}
                    className="text-green-500 hover:text-green-700 mr-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setCategoryToDelete(category);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${categoryToDelete?.name}"? This will also delete all items in this category.`}
        confirmText="Delete"
        confirmColor="red"
      />
    </div>
  );
};

export default CategoryManagement;