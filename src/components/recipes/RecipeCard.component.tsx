'use client';

import React, { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import type { Recipe, RecipeLocation, BonusStat } from '@prisma/client';
import RecipeLocationDialog from './RecipeLocationDialog';
import { Card, Flex, Text, Button, Box } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';

interface RecipeCardProps {
  recipe: Recipe & { location?: RecipeLocation | null; isFound: boolean };
  onToggleFound: () => void;
  bonusStats: BonusStat[];
  disableSwipe: (state: boolean) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onToggleFound,
  bonusStats,
  disableSwipe,
}) => {
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
    const selectedStat = bonusStats.find(
      (stat) => stat.name === selectedIngredient
    );
    return selectedStat ? selectedStat.effect : '';
  };

  const handleIngredientChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedIngredient(e.target.value);
      setIsDropdownOpen(false);
      disableSwipe(false);
    },
    [disableSwipe]
  );

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

  const rarityColor = getRarityColor(recipe.rarity);

  return (
    <Card
      size="3"
      style={{
        width: '100%',
        maxWidth: '400px',
        height: '600px',
        borderColor: rarityColor,
        backgroundColor: `color-mix(in srgb, ${rarityColor} 30%, var(--color-background))`,
        overflow: 'hidden',
      }}
    >
      <Flex direction="column" style={{ height: '100%' }}>
        <Box
          className="relative w-full"
          style={{
            height: '20%',
            borderRadius: `var(--radius-${theme.radius})`,
            overflow: 'hidden',
            padding: '0px',
            backgroundColor: `color-mix(in srgb, ${rarityColor} 10%, transparent)`,
          }}
        >
          <Box
            className="relative h-full w-full"
            style={{
              borderRadius: `calc(var(--radius-${theme.radius}) - 5px)`,
              overflow: 'hidden',
            }}
          >
            <Image
              src={recipe.image ?? '/placeholder-recipe.jpg'}
              alt={recipe.name}
              layout="fill"
              objectFit="contain"
              className="transition-transform duration-300 hover:scale-105"
              draggable={false}
            />
          </Box>
          <Box
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: `2px solid ${rarityColor}`,
              borderRadius: `var(--radius-${theme.radius})`,
              pointerEvents: 'none',
            }}
          />
          <Box
            style={{
              position: 'absolute',
              top: '35px',
              left: '5px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '8px',
              fontSize: '0.7rem',
            }}
          >
            {recipe.type}
          </Box>
        </Box>
        <Flex direction="column" p="3" style={{ flex: 1, overflowY: 'auto' }}>
          <Text size="5" weight="bold" align="center" mb="2">
            {recipe.name}
          </Text>
          <Text size="2" align="center" mb="2">
            {recipe.description}
          </Text>
          <Flex direction="column" gap="1">
            <Text size="2">
              <strong>Base Stats:</strong>{' '}
              {Object.entries(recipe.baseStats ?? {})
                .filter(([_, value]) => value !== '')
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ')}
            </Text>
            <Text size="2">
              <strong>Food Effect:</strong> {recipe.foodEffect || 'None'}
            </Text>
            <Text size="2">
              <strong>Ingredients:</strong>{' '}
              {[
                recipe.ingredient1,
                recipe.ingredient2,
                recipe.ingredient3,
                recipe.ingredient4,
              ]
                .filter(Boolean)
                .join(', ')}
            </Text>
            <Text size="2">
              <strong>Base Spoilage Rate:</strong> {recipe.baseSpoilageRate}
            </Text>
            <Text size="2">
              <strong>Crafting Station:</strong> {recipe.craftingStation}
            </Text>
            <Flex align="center" gap="2">
              <Text size="2">
                <strong>Recipe Location:</strong>
              </Text>
              {recipe.locationType === 'memetics' &&
              recipe.craftingStation === 'found ingredient' ? (
                <Text size="2">Not a recipe</Text>
              ) : recipe.locationType === 'memetics' ? (
                <Text size="2">Memetic Tree</Text>
              ) : recipe.location ? (
                <RecipeLocationDialog
                  location={recipe.location}
                  rarityColor={rarityColor}
                />
              ) : (
                <Text size="2">Location not set</Text>
              )}
            </Flex>
          </Flex>
          <Flex direction="column" mt="2">
            <Text size="2" weight="bold">
              Optional Ingredient:
            </Text>
            {recipe.optionalIngredient ? (
              <select
                ref={selectRef}
                value={selectedIngredient}
                onChange={handleIngredientChange}
                onFocus={handleDropdownOpen}
                onBlur={handleDropdownClose}
                style={{
                  width: '100%',
                  padding: '6px',
                  borderRadius: `var(--radius-${theme.radius})`,
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-foreground)',
                  border: '1px solid var(--gray-6)',
                  fontSize: '0.875rem',
                }}
              >
                <option value="">Select an ingredient</option>
                {bonusStats
                  .filter(
                    (stat) => stat.categoryId === recipe.optionalIngredient
                  )
                  .map((stat) => (
                    <option key={stat.id} value={stat.name}>
                      {stat.name}
                    </option>
                  ))}
              </select>
            ) : (
              <Text size="2">None</Text>
            )}
          </Flex>
          {selectedIngredient && (
            <Text size="2" mt="1">
              <strong>Bonus Effect:</strong> {getBonusEffect()}
            </Text>
          )}
        </Flex>
        <Flex justify="between" align="center" p="2">
          <Text
            size="2"
            style={{
              backgroundColor: rarityColor,
              color: 'var(--color-background)',
              padding: '2px 6px',
              borderRadius: '8px',
            }}
          >
            {recipe.rarity.charAt(0).toUpperCase() + recipe.rarity.slice(1)}
          </Text>
          <Button
            onClick={onToggleFound}
            variant={recipe.isFound ? 'solid' : 'soft'}
            color={recipe.isFound ? 'green' : 'gray'}
            size="1"
          >
            {recipe.isFound ? 'Found' : 'Mark as Found'}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};

export default React.memo(RecipeCard);
