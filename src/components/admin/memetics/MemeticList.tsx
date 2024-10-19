// src/components/admin/MemeticList.tsx

import React from 'react';
import { Table, Button, Flex, Text } from '@radix-ui/themes';
import { type Memetic, type Tier, type Tag } from '@prisma/client';
import ConfirmationModal from '@/components/common/ConfirmationModal.component';
import { useThemeContext } from '@/context/ThemeContext';

interface MemeticListProps {
  memetics: (Memetic & { tier: Tier | null; tag: Tag | null })[];
  onEdit: (memetic: Memetic) => void;
  onDelete: (id: string) => void;
}

const MemeticList: React.FC<MemeticListProps> = ({ memetics, onEdit, onDelete }) => {
  const [deletingMemeticId, setDeletingMemeticId] = React.useState<string | null>(null);
  const { theme } = useThemeContext();

  const handleDeleteMemetic = (id: string) => {
    setDeletingMemeticId(id);
  };

  const confirmDeleteMemetic = () => {
    if (deletingMemeticId) {
      onDelete(deletingMemeticId);
      setDeletingMemeticId(null);
    }
  };

  return (
    <>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Tier</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Rank</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Tag</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Levels</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {memetics.map((memetic) => (
            <Table.Row key={memetic.id}>
              <Table.Cell>
                {memetic.tier ? (
                  <Flex
                    align="center"
                    justify="center"
                    style={{
                      backgroundColor: memetic.tier.color,
                      color: 'white',
                      padding: 'var(--space-1)',
                      borderRadius: `var(--radius-${theme.radius})`,
                      width: '50px',
                      height: '20px',
                    }}
                  >
                    <Text size="2" weight="bold">
                      {memetic.tier.tier}
                    </Text>
                  </Flex>
                ) : (
                  <Text color="red" weight="bold">
                    Unassigned
                  </Text>
                )}
              </Table.Cell>
              <Table.Cell>{memetic.defaultRank}</Table.Cell>
              <Table.Cell>{memetic.title}</Table.Cell>
              <Table.Cell>{memetic.tag?.name || 'N/A'}</Table.Cell>
              <Table.Cell>{memetic.levelAssignments.join(', ')}</Table.Cell>
              <Table.Cell>
                <Flex gap="2">
                  <Button size="1" variant="soft" onClick={() => onEdit(memetic)}>
                    Edit
                  </Button>
                  <Button
                    size="1"
                    variant="soft"
                    color="red"
                    onClick={() => handleDeleteMemetic(memetic.id)}
                  >
                    Delete
                  </Button>
                </Flex>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <ConfirmationModal
        isOpen={!!deletingMemeticId}
        onClose={() => setDeletingMemeticId(null)}
        onConfirm={confirmDeleteMemetic}
        title="Delete Memetic"
        message="Are you sure you want to delete this memetic? This action cannot be undone."
        confirmText="Delete"
        confirmColor="red"
      />
    </>
  );
};

export default MemeticList;
