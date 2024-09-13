import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FlippingPages } from 'flipping-pages';
import 'flipping-pages/dist/style.css';
import RecipeCard from './RecipeCard.component';
import { api } from "@/trpc/react";
import { useDebounce } from '@/hooks/useDebounce';
import { flipbookConfig } from './flipbookConfig';
import RecipeSlider from './RecipeSlider.component'; 
import type { Filters } from '@/hooks/useRecipeSearchAndFilter';

interface GuestRecipeListProps {
  search: string;
  filters: Filters;
  onSearch: (value: string) => void;
  onFilterChange: (filters: Filters) => void;
}

const GuestRecipeList: React.FC<GuestRecipeListProps> = ({ search, filters }) => {
  const [selected, setSelected] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [disableSwipe, setDisableSwipe] = useState(false);
  const [isSliderInteracting, setIsSliderInteracting] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const recipesQuery = api.recipe.getAll.useInfiniteQuery(
    { limit: 10, search: debouncedSearch, ...filters },
    { 
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: Infinity,
    }
  );

  const bonusStatsQuery = api.bonusStat.getAllItems.useQuery(undefined, { staleTime: Infinity });

  const toggleFoundMutation = api.recipe.toggleFound.useMutation({
    onSuccess: () => {
      void recipesQuery.refetch();
    },
  });

  const filteredRecipes = useMemo(() => 
    recipesQuery.data?.pages.flatMap((page) =>
      page.recipes.filter((recipe) => {
        const matchesType = filters.type === "" || recipe.type === filters.type;
        const matchesRarity = filters.rarity === "" || recipe.rarity === filters.rarity;
        const matchesFoundStatus = filters.foundStatus === "" || 
          (filters.foundStatus === "found" && recipe.isFound) ||
          (filters.foundStatus === "not_found" && !recipe.isFound);
        
        // New filtering logic for locationType
        const matchesLocationType = filters.locationType === "" || recipe.locationType === filters.locationType;

        return matchesType && matchesRarity && matchesFoundStatus && matchesLocationType;
      })
    ) ?? [],
    [recipesQuery.data, filters]
  );


  useEffect(() => {
    if (selected >= filteredRecipes.length) {
      setSelected(0);
    }
  }, [filteredRecipes, selected]);

  const nextPage = useCallback(() => setSelected((prev) => Math.min(prev + 1, filteredRecipes.length - 1)), [filteredRecipes]);
  const prevPage = useCallback(() => setSelected((prev) => Math.max(prev - 1, 0)), []);

  const handleSliderChange = useCallback((index: number) => {
    setSelected(index);
  }, []);

  const handleSliderInteractionStart = useCallback(() => {
    setIsSliderInteracting(true);
  }, []);

  const handleSliderInteractionEnd = useCallback(() => {
    setIsSliderInteracting(false);
  }, []);

  // Adjust the flipbook configuration based on slider interaction
  const currentFlipbookConfig = {
    ...flipbookConfig,
    animationDuration: isSliderInteracting ? 0 : flipbookConfig.animationDuration,
  };

  // Add this effect to scroll to the bottom on initial render
  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, []);

  if (recipesQuery.isLoading || bonusStatsQuery.isLoading) return <div>Loading...</div>;
  if (recipesQuery.isError) return <div>Error: {recipesQuery.error.message}</div>;
  if (bonusStatsQuery.isError) return <div>Error loading bonus stats: {bonusStatsQuery.error.message}</div>;

  return (
    <div className="container mx-auto px-4 relative min-h-screen flex flex-col">
      <div className="flex-grow flex flex-col justify-center items-center">
        <div className="relative" style={{ width: '400px', height: '600px' }}>
          {filteredRecipes.length > 0 ? (
            <>
              <FlippingPages
                {...currentFlipbookConfig}
                selected={selected}
                disableSwipe={disableSwipe} 
                onSwipeEnd={setSelected}
                onAnimationStart={() => setIsAnimating(true)}
                onAnimationEnd={() => setIsAnimating(false)}
              >
                {filteredRecipes.map((recipe) => (
                  <div key={recipe.id} className="flex justify-center items-center h-full">
                    <RecipeCard
                      recipe={recipe}
                      onToggleFound={() => toggleFoundMutation.mutate(recipe.id)}
                      bonusStats={bonusStatsQuery.data ?? []}
                      disableSwipe={setDisableSwipe} 
                    />
                  </div>
                ))}
              </FlippingPages>

              <button 
                onClick={prevPage} 
                className={`absolute left-[-40px] top-1/2 transform -translate-y-1/2 rounded-full p-3 transition-colors duration-300
                  ${selected === 0 || isAnimating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                disabled={isAnimating || selected === 0}
              >
                ‹
              </button>
              <button 
                onClick={nextPage} 
                className={`absolute right-[-40px] top-1/2 transform -translate-y-1/2 rounded-full p-3 transition-colors duration-300
                  ${selected === filteredRecipes.length - 1 || isAnimating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                disabled={isAnimating || selected === filteredRecipes.length - 1}
              >
                ›
              </button>
            </>
          ) : (
            <div className="text-center text-lg">Nothing Found</div>
          )}
        </div>

        {/* RecipeSlider with adjusted styling */}
        <div className="w-full max-w-[400px] mt-8 mb-12">
          <RecipeSlider
            totalRecipes={filteredRecipes.length}
            currentIndex={selected}
            onIndexChange={handleSliderChange}
            onSliderInteractionStart={handleSliderInteractionStart}
            onSliderInteractionEnd={handleSliderInteractionEnd}
          />
        </div>
      </div>

      {/* Search and filter bar */}
      <div className="sticky bottom-0 bg-white py-4 shadow-lg">
        {/* Add your search and filter components here */}
      </div>
    </div>
  );
};

export default React.memo(GuestRecipeList);
