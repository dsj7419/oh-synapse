import React from 'react';
import { TextField, Select, Flex, Grid, Text } from '@radix-ui/themes';
import type { RecipeDetails } from '@/types/recipe';
import { useThemeContext } from '@/context/ThemeContext';

interface RecipeStatsProps {
  recipe: RecipeDetails;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleBaseStatsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RecipeStats: React.FC<RecipeStatsProps> = ({
  recipe,
  handleInputChange,
  handleBaseStatsChange
}) => {
  const { theme } = useThemeContext();

  return (
    <Flex direction="column" gap="3">
      <Grid columns="3" gap="3">
        {['energy', 'hydration', 'sanity'].map((stat) => (
          <TextField.Root
            key={stat}
            name={stat}
            value={recipe.baseStats[stat]}
            onChange={handleBaseStatsChange}
            placeholder={stat.charAt(0).toUpperCase() + stat.slice(1)}
          />
        ))}
      </Grid>

      <TextField.Root
        name="foodEffect"
        value={recipe.foodEffect}
        onChange={handleInputChange}
        placeholder="Food Effect"
      />

      <Flex direction="column" gap="2">
        <Text size="2" weight="bold">Base Spoilage Rate</Text>
        <Select.Root 
          name="baseSpoilageRate" 
          value={recipe.baseSpoilageRate} 
          onValueChange={(value) => handleInputChange({ target: { name: 'baseSpoilageRate', value } } as any)}
        >
          <Select.Trigger />
          <Select.Content>
            {['24', '8', '12', '48', 'unlimited'].map((rate) => (
              <Select.Item key={rate} value={rate}>{rate === 'unlimited' ? 'Unlimited' : `${rate} hours`}</Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Flex>

      <Flex direction="column" gap="2">
        <Text size="2" weight="bold">Crafting Station</Text>
        <Select.Root 
          name="craftingStation" 
          value={recipe.craftingStation} 
          onValueChange={(value) => handleInputChange({ target: { name: 'craftingStation', value } } as any)}
        >
          <Select.Trigger />
          <Select.Content>
            {['stove', 'electric stove', 'kitchen set', 'fridge', 'meat dryer'].map((station) => (
              <Select.Item key={station} value={station}>{station.charAt(0).toUpperCase() + station.slice(1)}</Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Flex>

      <Flex direction="column" gap="2">
        <Text size="2" weight="bold">Rarity</Text>
        <Select.Root 
          name="rarity" 
          value={recipe.rarity} 
          onValueChange={(value) => handleInputChange({ target: { name: 'rarity', value } } as any)}
        >
          <Select.Trigger />
          <Select.Content>
            {['common', 'uncommon', 'rare', 'unique'].map((rarity) => (
              <Select.Item key={rarity} value={rarity}>{rarity.charAt(0).toUpperCase() + rarity.slice(1)}</Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Flex>
    </Flex>
  );
};