// src/components/admin/MemeticsManagement.tsx
'use client';

import React, { useState } from 'react';
import { Box, Heading, Tabs } from '@radix-ui/themes';
import TierManagement from './TierManagement';
import TagManagement from './TagManagement';
import MemeticManagement from './MemeticManagement';
import TemplateManagement from './TemplateManagement';

const MemeticsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tiers');

  return (
    <Box>
      <Heading size="8" mb="6">
        Memetics Management
      </Heading>
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value="tiers">Tiers</Tabs.Trigger>
          <Tabs.Trigger value="tags">Tags</Tabs.Trigger>
          <Tabs.Trigger value="memetics">Memetics</Tabs.Trigger>
          <Tabs.Trigger value="templates">Templates</Tabs.Trigger>
        </Tabs.List>
        <Box pt="4">
          <Tabs.Content value="tiers">
            <TierManagement />
          </Tabs.Content>
          <Tabs.Content value="tags">
            <TagManagement />
          </Tabs.Content>
          <Tabs.Content value="memetics">
            <MemeticManagement />
          </Tabs.Content>
          <Tabs.Content value="templates">
            <TemplateManagement />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Box>
  );
};

export default MemeticsManagement;
