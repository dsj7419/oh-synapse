"use client";

import React from 'react';
import { Dialog, Button, Text, Box, Flex, Card, Heading } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  confirmColor?: 'red' | 'blue' | 'green';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmColor = 'red',
}) => {
  const { theme } = useThemeContext();

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Content
            forceMount
            style={{
              backgroundColor: 'var(--color-panel-solid)',
              boxShadow: 'var(--shadow-5)',
              border: '2px solid var(--gray-6)',
              maxWidth: '450px',
              width: '100%',
              padding: 0,
              overflow: 'hidden',
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card size="4" style={{ width: '100%' }}>
                <Flex direction="column" gap="3">
                  <Heading size="4" mb="2">{title}</Heading>
                  <Text size="2" color="gray">
                    {message}
                  </Text>
                  <Flex justify="end" gap="3" mt="4">
                    <Button variant="soft" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button variant="solid" color={confirmColor} onClick={onConfirm}>
                      {confirmText}
                    </Button>
                  </Flex>
                </Flex>
              </Card>
            </motion.div>
            <Dialog.Close>
              <Button 
                size="1"
                variant="ghost" 
                color={theme.accentColor}
                style={{ 
                  position: 'absolute', 
                  top: '8px', 
                  right: '8px',
                }}
              >
                Close
              </Button>
            </Dialog.Close>
          </Dialog.Content>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};

export default ConfirmationModal;