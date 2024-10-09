import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import type { Recipe, RecipeLocation, BonusStat } from '@prisma/client';
import RecipeLocationDialog from './RecipeLocationDialog';
import { Card, Flex, Text, Button } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';

interface RecipeCardProps {
  recipe: Recipe & { location?: RecipeLocation | null; isFound: boolean };
  onToggleFound: () => void;
  bonusStats: BonusStat[];
  disableSwipe: (state: boolean) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onToggleFound, bonusStats, disableSwipe }) => {
  const [selectedIngredient, setSelectedIngredient] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);
  const { theme } = useThemeContext();

  const getRarityColor = useCallback((rarity: string) => {
    const colors = {
      common: 'var(--green-9)',
      uncommon: 'var(--blue-9)',
      rare: 'var(--purple-9)',
      unique: 'var(--orange-9)',
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  }, []);

  const getBonusEffect = () => {
    const selectedStat = bonusStats.find(stat => stat.name === selectedIngredient);
    return selectedStat ? selectedStat.effect : '';
  };

  const handleIngredientChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedIngredient(e.target.value);
    setIsDropdownOpen(false);
    disableSwipe(false);
  }, [disableSwipe]);

  const handleDropdownOpen = useCallback(() => {
    setIsDropdownOpen(true);
    disableSwipe(true);
  }, [disableSwipe]);

  const handleDropdownClose = useCallback(() => {
    setIsDropdownOpen(false);
    disableSwipe(false);
    if (selectRef.current) {
      selectRef.current.blur();
    }
  }, [disableSwipe]);

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleDropdownClose);
      return () => {
        document.removeEventListener('mousedown', handleDropdownClose);
      };
    }
  }, [isDropdownOpen, handleDropdownClose]);

  const rarityColor = getRarityColor(recipe.rarity);

  return (
    <Card 
      size="3"
      style={{
        width: '400px',
        height: '600px',
        borderColor: rarityColor,
        backgroundColor: `color-mix(in srgb, ${rarityColor} 30%, var(--color-background))`,
        overflow: 'hidden',
      }}
    >
      <Flex direction="column" style={{ height: '100%' }}>
        <div className="relative w-full h-[40%]" style={{ borderRadius: `var(--radius-${theme.radius})`, overflow: 'hidden' }}>
          <Image 
            src={recipe.image ?? '/placeholder-recipe.jpg'} 
            alt={recipe.name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 hover:scale-105"
            draggable={false}
          />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: `2px solid ${rarityColor}`,
            borderRadius: `var(--radius-${theme.radius})`,
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute',
            top: '22px',
            left: '22px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '10px',
            fontSize: '0.875rem',
          }}>
            {recipe.type}
          </div>
        </div>
        <Flex direction="column" p="4" style={{ flex: 1 }}>
          <Text size="6" weight="bold" align="center" mb="2">{recipe.name}</Text>
          <Text size="2" align="center" mb="2">{recipe.description}</Text>
          <Flex direction="column" gap="2">
            <Text size="2"><strong>Base Stats:</strong> {Object.entries(recipe.baseStats ?? {})
              .filter(([_, value]) => value !== "")
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ')}
            </Text>
            <Text size="2"><strong>Food Effect:</strong> {recipe.foodEffect || 'None'}</Text>
            <Text size="2"><strong>Ingredients:</strong> {[recipe.ingredient1, recipe.ingredient2, recipe.ingredient3, recipe.ingredient4].filter(Boolean).join(', ')}</Text>
            <Text size="2"><strong>Base Spoilage Rate:</strong> {recipe.baseSpoilageRate}</Text>
            <Text size="2"><strong>Crafting Station:</strong> {recipe.craftingStation}</Text>
              <strong>Recipe Location:</strong> 
              {recipe.locationType === 'memetics' ? (
                'Memetic Tree'
              ) : recipe.location ? (
                <RecipeLocationDialog location={recipe.location} rarityColor={rarityColor} />
              ) : (
                'Location not set'
              )}
          </Flex>
          <Flex direction="column" mt="2">
            <Text size="2" weight="bold">Optional Ingredient:</Text>
            {recipe.optionalIngredient ? (
              <select
                ref={selectRef}
                value={selectedIngredient}
                onChange={handleIngredientChange}
                onFocus={handleDropdownOpen}
                onBlur={handleDropdownClose}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: `var(--radius-${theme.radius})`,
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-foreground)',
                  border: '1px solid var(--gray-6)',
                }}
              >
                <option value="">Select an ingredient</option>
                {bonusStats
                  .filter(stat => stat.categoryId === recipe.optionalIngredient)
                  .map(stat => (
                    <option key={stat.id} value={stat.name}>{stat.name}</option>
                  ))}
              </select>
            ) : (
              <Text size="2">None</Text>
            )}
          </Flex>
          {selectedIngredient && (
            <Text size="2" mt="2"><strong>Bonus Effect:</strong> {getBonusEffect()}</Text>
          )}
        </Flex>
        <Flex justify="between" align="center" p="4">
          <Text 
            size="2"
            style={{
              backgroundColor: rarityColor,
              color: 'var(--color-background)',
              padding: '4px 8px',
              borderRadius: '4px',
            }}
          >
            {recipe.rarity.charAt(0).toUpperCase() + recipe.rarity.slice(1)}
          </Text>
          <Button 
            onClick={onToggleFound}
            variant={recipe.isFound ? "solid" : "soft"}
            color={recipe.isFound ? "green" : "gray"}
          >
            {recipe.isFound ? 'Found' : 'Mark as Found'}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};

export default React.memo(RecipeCard);