import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Table, Button, Flex } from '@radix-ui/themes';

interface SortableTableRowProps {
  id: string;
  table: {
    id: string;
    name: string;
    owner: { name: string | null } | null;
    createdAt: Date;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const SortableTableRow: React.FC<SortableTableRowProps> = ({ id, table, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Table.Row ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Table.Cell>{table.name}</Table.Cell>
      <Table.Cell>{table.owner?.name ?? 'Unknown'}</Table.Cell>
      <Table.Cell>{new Date(table.createdAt).toLocaleString()}</Table.Cell>
      <Table.Cell>
        <Flex gap="2">
          <Button size="1" variant="soft" onClick={() => onEdit(table.id)}>
            Edit
          </Button>
          <Button size="1" variant="soft" color="red" onClick={() => onDelete(table.id)}>
            Delete
          </Button>
        </Flex>
      </Table.Cell>
    </Table.Row>
  );
};

export default SortableTableRow;