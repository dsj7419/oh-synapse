'use client';

import React, { useState, Fragment } from 'react';
import { api } from "@/trpc/react";
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import RecipeForm from './RecipeForm.component';

const RecipeList: React.FC = () => {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<{ id: string, name: string } | null>(null);

  const recipesQuery = api.recipe.getAll.useInfiniteQuery(
    { limit: 10, search, type },
    { 
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchInterval: 5000 // Refetch every 5 seconds to keep the list updated
    }
  );

  const deleteMutation = api.recipe.delete.useMutation({
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      setRecipeToDelete(null);
      void recipesQuery.refetch();
    },
    onError: (error) => {
      console.error('Error deleting recipe:', error);
      alert(`Error deleting recipe: ${error.message}`);
      setIsDeleteModalOpen(false);
      setRecipeToDelete(null);
    }
  });

  const handleDelete = () => {
    if (recipeToDelete) {
      deleteMutation.mutate(recipeToDelete.id, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setRecipeToDelete(null);
          void recipesQuery.refetch();
        },
        onError: (error) => {
          console.error('Error deleting recipe:', error);
          alert(`Error deleting recipe: ${error.message}`);
          setIsDeleteModalOpen(false);
          setRecipeToDelete(null);
        }
      });
    }
  };

  const handleEditComplete = () => {
    setEditingRecipeId(null);
    void recipesQuery.refetch();
  };

  const handleCancelEdit = () => {
    setEditingRecipeId(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Recipe Management</h2>
      {editingRecipeId ? (
        <RecipeForm
          key={editingRecipeId} 
          recipeId={editingRecipeId}
          onSave={handleEditComplete}
          onCancel={handleCancelEdit}
        />
      ) : (
        <RecipeForm
          onSave={handleEditComplete}
          onCancel={handleCancelEdit}
        />
      )}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Recipe List</h3>
        <div className="flex mb-4 space-x-2">
          <input
            type="text"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow p-2 border rounded"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All Types</option>
            <option value="Food">Food</option>
            <option value="Drink">Drink</option>
            <option value="Crafted Ingredient">Crafted Ingredient</option>
          </select>
        </div>
        {recipesQuery.isLoading ? (
          <p>Loading...</p>
        ) : recipesQuery.isError ? (
          <p>Error: {recipesQuery.error.message}</p>
        ) : (
          <>
            <ul className="space-y-2">
              {recipesQuery.data?.pages.map((page) =>
                page.recipes.map((recipe) => (
                  <li key={recipe.id} className="bg-gray-100 p-2 rounded flex justify-between items-center">
                    <span>{recipe.name} - {recipe.type}</span>
                    <div>
                      <button
                        onClick={() => setEditingRecipeId(recipe.id)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setRecipeToDelete({ id: recipe.id, name: recipe.name });
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
            {recipesQuery.hasNextPage && (
              <button
                onClick={() => recipesQuery.fetchNextPage()}
                disabled={recipesQuery.isFetchingNextPage}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {recipesQuery.isFetchingNextPage ? 'Loading more...' : 'Load More'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsDeleteModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Delete Recipe
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete the recipe &apos;{recipeToDelete?.name}&apos;? This action cannot be undone.
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={() => setIsDeleteModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default RecipeList;