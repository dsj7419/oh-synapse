import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Flex, Button } from '@radix-ui/themes';

interface SortableMemeticItemProps {
  id: string;
  memetic: {
    id: string;
    title: string;
    tier: { tier: string; color: string } | null;
  };
  onRemove: (id: string) => void;
}

const SortableMemeticItem: React.FC<SortableMemeticItemProps> = ({ id, memetic, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '8px',
    marginBottom: '8px',
    backgroundColor: 'var(--gray-3)',
    borderRadius: '4px',
  };

  return (
    <Flex
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      justify="between"
      align="center"
    >
      <Flex align="center" gap="2">
        {memetic.tier && (
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: memetic.tier.color,
            }}
          />
        )}
        <span>{memetic.title}</span>
      </Flex>
      <Button size="1" variant="soft" color="red" onClick={() => onRemove(memetic.id)}>
        Remove
      </Button>
    </Flex>
  );
};

export default SortableMemeticItem;