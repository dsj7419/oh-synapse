"use client";

import React, { useState } from 'react';
import { api } from "@/trpc/react";
import { PencilIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface AdminLocationsListProps {
  onEdit: (recipeId: string) => void;
}

const AdminLocationsList: React.FC<AdminLocationsListProps> = ({ onEdit }) => {
  const [search, setSearch] = useState("");
  const [hasLocationFilter, setHasLocationFilter] = useState<boolean | undefined>(undefined);

  const recipesQuery = api.location.getAllRecipesWithLocations.useInfiniteQuery(
    { limit: 10, search, hasLocation: hasLocationFilter },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchInterval: 5000,
    }
  );

  const toggleHasLocationFilter = () => {
    setHasLocationFilter((prev) => {
      if (prev === undefined) return true;
      if (prev === true) return false;
      return undefined;
    });
  };

  const filteredRecipes = recipesQuery.data?.pages.flatMap((page) =>
    page.recipes.filter((recipe) => recipe.locationType !== 'memetics')
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Locations Management</h2>
      <div className="flex mb-4 space-x-2">
        <input
          type="text"
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-grow p-2 border rounded"
        />
        <button onClick={toggleHasLocationFilter} className="px-4 py-2 bg-gray-200 rounded">
          {hasLocationFilter === undefined
            ? 'All'
            : hasLocationFilter
            ? 'Has Location'
            : 'No Location'}
        </button>
      </div>
      {recipesQuery.isLoading ? (
        <p>Loading...</p>
      ) : recipesQuery.isError ? (
        <p>Error: {recipesQuery.error.message}</p>
      ) : (
        <>
          <ul className="space-y-2">
            {filteredRecipes?.map((recipe) => (
              <li
                key={recipe.id}
                className="bg-gray-100 p-2 rounded flex justify-between items-center"
              >
                <div className="flex items-center">
                  {recipe.location && recipe.isComplete && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  )}
                  <span>
                    {recipe.name} - {recipe.type} -{' '}
                    {recipe.location ? 'Location Assigned' : 'No Location'}
                  </span>
                </div>
                <div>
                  <button
                    onClick={() => onEdit(recipe.id)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
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
  );
};

export default AdminLocationsList;
