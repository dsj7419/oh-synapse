import React from 'react';
import { Slider, Flex } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';

interface RecipeSliderProps {
  totalRecipes: number;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onSliderInteractionStart: () => void;
  onSliderInteractionEnd: () => void;
}

const RecipeSlider: React.FC<RecipeSliderProps> = ({
  totalRecipes,
  currentIndex,
  onIndexChange,
  onSliderInteractionStart,
  onSliderInteractionEnd,
}) => {
  const { theme } = useThemeContext();

  const handleValueChange = (value: number[]) => {
    if (value[0] !== undefined) {
      onIndexChange(value[0]);
    }
  };

  return (
    <Flex align="center" width="100%">
      <Slider
        size="2"
        variant="surface"
        color={theme.accentColor}
        radius={theme.radius}
        value={[currentIndex]}
        max={totalRecipes - 1}
        step={1}
        onValueChange={handleValueChange}
        onPointerDown={onSliderInteractionStart}
        onPointerUp={onSliderInteractionEnd}
        aria-label="Recipe Navigator"
      />
    </Flex>
  );
};

export default RecipeSlider;