import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import Image from 'next/image';
import type { RecipeLocation } from '@prisma/client';

interface RecipeLocationPopoverProps {
  location: RecipeLocation;
  rarityColor: string; 
}

const RecipeLocationPopover: React.FC<RecipeLocationPopoverProps> = ({ location, rarityColor }) => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="text-blue-500 underline hover:text-blue-700">
          See Location
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={`p-4 w-[500px] border-2 rounded-lg ${rarityColor} bg-opacity-95`}
          sideOffset={5}
        >
          <h3 className="text-xl font-bold text-center mb-4">
            {location.region ?? 'Unknown Region'} Region
          </h3>
          <div className="flex gap-4">
            {/* Side-by-side images */}
            <div className="w-1/2">
              {location.image1 && (
                <Image 
                  src={location.image1}
                  alt="Location Image 1"
                  width={250}
                  height={150}
                  className="rounded"
                />
              )}
            </div>
            <div className="w-1/2">
              {location.image2 && (
                <Image 
                  src={location.image2}
                  alt="Location Image 2"
                  width={250}
                  height={150}
                  className="rounded"
                />
              )}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-bold">{location.locationName ?? 'Unknown Location'}</h3>
            <p>Coordinates: {location.coordinates ?? 'N/A'}</p>
            <p>Description: {location.description ?? 'No description available'}</p>
          </div>
          <Popover.Arrow className={`fill-current ${rarityColor}`} /> {/* Arrow matching the color */}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default RecipeLocationPopover;
