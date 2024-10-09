"use client";

import React from 'react';
import Image from 'next/image';
import type { RecipeLocation } from '@prisma/client';
import { Dialog, Button, Heading, Text, Box, Flex, Card } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';

interface RecipeLocationDialogProps {
  location: RecipeLocation;
  rarityColor: string;
}

const RecipeLocationDialog: React.FC<RecipeLocationDialogProps> = ({ location, rarityColor }) => {
  const { theme } = useThemeContext();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger>
        <Button 
          size="2"
          variant="soft"
          color={theme.accentColor}
          radius={theme.radius}
        >
          See Location
        </Button>
      </Dialog.Trigger>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Content 
            forceMount
            style={{
              backgroundColor: 'var(--color-panel-solid)',
              boxShadow: 'var(--shadow-5)',
              border: '2px solid var(--gray-6)',
              maxWidth: '500px',
              width: '100%',
              padding: 0,
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.90 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
            >
              <Card size="2" style={{ width: '100%' }}>
                <Heading size="3" mb="2" style={{ color: rarityColor }}>{location.region ?? 'Unknown Region'} Region</Heading>
                <Flex gap="2" mb="3">
                  {location.image1 && (
                    <Box style={{ width: '50%', height: '200px', position: 'relative' }}>
                      <Image src={location.image1} alt="Location" layout="fill" objectFit="cover" />
                    </Box>
                  )}
                  {location.image2 && (
                    <Box style={{ width: '50%', height: '200px', position: 'relative' }}>
                      <Image src={location.image2} alt="Map" layout="fill" objectFit="cover" />
                    </Box>
                  )}
                </Flex>
                <Card variant="classic" style={{ 
                  backgroundColor: 'var(--color-surface)',
                }}>
                  <Box p="3">
                    <Text as="div" size="2" mb="1">
                      <strong>Location:</strong> {location.locationName ?? 'Unknown Location'}
                    </Text>
                    <Text as="div" size="2" mb="1">
                      <strong>Coordinates:</strong> {location.coordinates ?? 'N/A'}
                    </Text>
                    <Text as="div" size="2">
                      <strong>Description:</strong> {location.description ?? 'No description available'}
                    </Text>
                  </Box>
                </Card>
              </Card>
            </motion.div>
            <Dialog.Close>
              <Button size="1" variant="soft" color={theme.accentColor} style={{ position: 'absolute', top: '8px', right: '8px' }}>
                Close
              </Button>
            </Dialog.Close>
          </Dialog.Content>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};

export default RecipeLocationDialog;