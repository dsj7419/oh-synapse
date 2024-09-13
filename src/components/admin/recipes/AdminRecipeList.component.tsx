"use client";

import React, { useState, Fragment } from 'react';
import { api } from "@/trpc/react";
import { PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import RecipeForm from './RecipeForm.component';
import { logAction } from "@/utils/auditLogger";
import { useSession } from 'next-auth/react';
import Image from 'next/image';

const RecipeList: React.FC = () => {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [rarity, setRarity] = useState("");
  const [locationType, setLocationType] = useState("");
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<{ id: string; name: string } | null>(null);

  const { data: session } = useSession();
  const userId = session?.user?.id ?? 'unknown';
  const username = session?.user?.name ?? 'unknown';
  const userRole = session?.user?.roles?.join(', ') ?? 'admin';

  const recipesQuery = api.recipe.getAll.useInfiniteQuery(
    { limit: 10, search, type, rarity, locationType },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchInterval: 5000,
    }
  );

  const deleteMutation = api.recipe.delete.useMutation({
    onSuccess: async () => {
      setIsDeleteModalOpen(false);
      setRecipeToDelete(null);
      await logAction({
        userId,
        username,
        userRole,
        action: 'Delete Recipe',
        resourceType: 'Recipe',
        resourceId: recipeToDelete?.id ?? '',
        severity: 'high',
        details: { name: recipeToDelete?.name },
      });
      void recipesQuery.refetch();
    },
    onError: async (error) => {
      console.error('Error deleting recipe:', error);
      await logAction({
        userId,
        username,
        userRole,
        action: 'Delete Recipe Failed',
        resourceType: 'Recipe',
        resourceId: recipeToDelete?.id ?? '',
        severity: 'high',
        details: { error: error.message, name: recipeToDelete?.name },
      });
      alert(`Error deleting recipe: ${error.message}`);
      setIsDeleteModalOpen(false);
      setRecipeToDelete(null);
    },
  });

  const handleDelete = () => {
    if (recipeToDelete) {
      deleteMutation.mutate(recipeToDelete.id);
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
        <RecipeForm onSave={handleEditComplete} onCancel={handleCancelEdit} />
      )}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Recipe List</h3>

        {/* Table of Contents */}
      <div className="mb-4 text-sm text-gray-700">
        <p>
          Table:&nbsp;&nbsp;&nbsp;| &nbsp;&nbsp;&nbsp;
          <Image
            src="https://utfs.io/f/c7b91760-6703-4c01-a4f1-85ae5c4ec5da-n81lur.256x256.png"
            alt="Memetic Icon"
            width={16}
            height={16}
            className="inline mr-1"
          /> 
          &nbsp; &nbsp;Memetic&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;
          <CheckCircleIcon className="inline h-5 w-5 text-green-500 mx-1" />  &nbsp;Completed Location World Recipe &nbsp;&nbsp;&nbsp;| &nbsp;&nbsp;&nbsp; 
          <XCircleIcon className="inline h-5 w-5 text-red-500 mx-1" /> &nbsp; Incomplete Location World Recipe &nbsp;&nbsp;&nbsp; |
        </p>
      </div>

        {/* Filters */}
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
          <select
            value={rarity}
            onChange={(e) => setRarity(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All Rarities</option>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="unique">Unique</option>
          </select>
          <select
            value={locationType}
            onChange={(e) => setLocationType(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All Locations</option>
            <option value="memetics">Memetic</option>
            <option value="worldMap">World Location</option>
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
                  <li
                    key={recipe.id}
                    className="bg-gray-100 p-2 rounded flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      {/* Display the Memetic Icon, Check or X based on conditions */}
                      {recipe.locationType === 'memetics' ? (
                        <Image
                          src="https://utfs.io/f/c7b91760-6703-4c01-a4f1-85ae5c4ec5da-n81lur.256x256.png"
                          alt="Memetic Icon"
                          width={16}
                          height={16}
                          className="mr-2"
                        />
                      ) : recipe.isComplete ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <span>{recipe.name} - {recipe.type}</span>
                    </div>
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
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
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
                      className="inline-flex justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
                      onClick={() => setIsDeleteModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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
