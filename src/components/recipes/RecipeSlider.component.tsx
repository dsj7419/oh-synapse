import React from 'react';
import * as Slider from '@radix-ui/react-slider';

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
  const handleValueChange = (value: number[]) => {
    if (value[0] !== undefined) {
      onIndexChange(value[0]);
    }
  };

  return (
    <Slider.Root
      className="relative flex items-center select-none touch-none w-full h-5 cursor-pointer"
      value={[currentIndex]}
      max={totalRecipes - 1}
      step={1}
      onValueChange={handleValueChange}
      onPointerDown={onSliderInteractionStart}
      onPointerUp={onSliderInteractionEnd}
    >
      <Slider.Track className="bg-gray-200 relative grow rounded-full h-[3px]">
        <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
      </Slider.Track>
      <Slider.Thumb
        className="block w-5 h-5 bg-white border-2 border-blue-500 shadow-md rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-200 cursor-grab active:cursor-grabbing"
        aria-label="Recipe Navigator"
      />
    </Slider.Root>
  );
};

export default RecipeSlider;
