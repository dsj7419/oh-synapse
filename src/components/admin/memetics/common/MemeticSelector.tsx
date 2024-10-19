// src/components/admin/common/MemeticSelector.tsx

import React from 'react';
import { Box, Flex, TextField, Text, Checkbox } from '@radix-ui/themes';
import { type Memetic, type Tag } from '@prisma/client';

interface MemeticSelectorProps {
  assignedMemeticIds: string[];
  onChange: (newMemeticIds: string[]) => void;
  memetics: (Memetic & { tag: Tag | null })[];
}

const MemeticSelector: React.FC<MemeticSelectorProps> = ({
  assignedMemeticIds,
  onChange,
  memetics,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredMemetics = memetics.filter(
    (m) => m.title.toLowerCase().includes(searchTerm.toLowerCase())
  ); 

  const handleToggleMemetic = (memeticId: string) => {
    if (assignedMemeticIds.includes(memeticId)) {
      onChange(assignedMemeticIds.filter((id) => id !== memeticId));
    } else {
      onChange([...assignedMemeticIds, memeticId]);
    }
  };

  return (
    <Box>
      <TextField.Root
        value={searchTerm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        placeholder="Search Memetics..."
      />
      <Box
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          border: '1px solid var(--gray-6)',
          borderRadius: 'var(--radius-3)',
          padding: '8px',
          marginTop: '8px',
        }}
      >
        {filteredMemetics.map((memetic) => (
          <Flex key={memetic.id} align="center" gap="2" mb="2">
            <Checkbox
              checked={assignedMemeticIds.includes(memetic.id)}
              onCheckedChange={() => handleToggleMemetic(memetic.id)}
            />
            <Text>{memetic.title}</Text>
          </Flex>
        ))}
      </Box>
    </Box>
  );
};

export default MemeticSelector;
