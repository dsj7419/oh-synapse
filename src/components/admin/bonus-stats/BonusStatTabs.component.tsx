'use client';
import React from 'react';
import BonusStatManagement from './BonusStatManagement.component';
import CategoryManagement from '../category/CategoryManagement.component';
import { Tabs, Box } from '@radix-ui/themes';

const BonusStatTabs: React.FC = () => {
  return (
    <Box className="container mx-auto p-4">
      <Tabs.Root defaultValue="items">
        <Tabs.List>
          <Tabs.Trigger value="items">Item Management</Tabs.Trigger>
          <Tabs.Trigger value="categories">Category Management</Tabs.Trigger>
        </Tabs.List>

        <Box pt="3">
          <Tabs.Content value="items">
            <BonusStatManagement />
          </Tabs.Content>

          <Tabs.Content value="categories">
            <CategoryManagement />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Box>
  );
};

export default BonusStatTabs;