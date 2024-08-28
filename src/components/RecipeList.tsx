'use client';

import React from 'react';
import { api } from "@/trpc/react";
import Link from 'next/link';

const RecipeList: React.FC = () => {
  const [search, setSearch] = React.useState("");
  const [type, setType] = React.useState("");

  const recipesQuery = api.recipe.getAll.useInfiniteQuery(
    { limit: 10, search, type },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  return (
    <div>
      <h1>Recipes</h1>
      <input
        type="text"
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="">All Types</option>
        <option value="Food">Food</option>
        <option value="Drink">Drink</option>
      </select>
      {recipesQuery.isLoading ? (
        <p>Loading...</p>
      ) : recipesQuery.isError ? (
        <p>Error: {recipesQuery.error.message}</p>
      ) : (
        <>
          <ul>
            {recipesQuery.data?.pages.map((page) =>
              page.recipes.map((recipe) => (
                <li key={recipe.id}>
                  <Link href={`/recipes/${recipe.id}`}>
                    {recipe.name} - {recipe.type}
                  </Link>
                </li>
              ))
            )}
          </ul>
          {recipesQuery.hasNextPage && (
            <button
              onClick={() => recipesQuery.fetchNextPage()}
              disabled={recipesQuery.isFetchingNextPage}
            >
              {recipesQuery.isFetchingNextPage ? 'Loading more...' : 'Load More'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default RecipeList;