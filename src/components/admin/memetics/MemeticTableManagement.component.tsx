// src/components/admin/MemeticTableManagement.tsx

import React, { useState, useEffect } from 'react';
import { api } from "@/trpc/react";
import { useThemeContext } from '@/context/ThemeContext';
import { Box, Flex, Heading, TextField, Button, Table, Select } from '@radix-ui/themes';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useQueryClient } from '@tanstack/react-query';
import ConfirmationModal from '@/components/common/ConfirmationModal.component';
import SortableTableRow from './common/SortableTableRow.component';

const MemeticTableManagement: React.FC = () => {
  const { theme } = useThemeContext();
  const [newTableName, setNewTableName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('none'); 
  const [deletingTableId, setDeletingTableId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const tablesQuery = api.tableMemetic.getAllTables.useQuery({
    page: 1,
    perPage: 100,
    search: undefined,
  });
  const templatesQuery = api.templateMemetic.getAllTemplates.useQuery();
  const createTableMutation = api.tableMemetic.createTable.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memetic', 'getAllTables'] });
    },
  });
  const updateTableOrderMutation = api.tableMemetic.updateTableOrder.useMutation();
  const deleteTableMutation = api.tableMemetic.deleteTable.useMutation({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['memetic', 'getAllTables'] }),
  });

  useEffect(() => {
    if (templatesQuery.data && templatesQuery.data.length > 0) {
      setSelectedTemplateId(templatesQuery.data[0]?.id ?? 'none');
    }
  }, [templatesQuery.data]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
  
    if (active.id !== over?.id && tablesQuery.data) {
      const oldIndex = tablesQuery.data.tables.findIndex((table) => table.id === active.id);
      const newIndex = tablesQuery.data.tables.findIndex((table) => table.id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(tablesQuery.data.tables, oldIndex, newIndex);
        updateTableOrderMutation.mutate({ tableIds: newOrder.map((table) => table.id) });
        queryClient.setQueryData(['memetic', 'getAllTables'], (oldData: any) => ({
          ...oldData,
          tables: newOrder,
        }));
      }
    }
  };

  const handleCreateTable = () => {
    if (newTableName.trim() && selectedTemplateId !== 'none') {
      createTableMutation.mutate(
        { name: newTableName.trim(), templateId: selectedTemplateId },
        {
          onSuccess: () => {
            setNewTableName('');
            queryClient.invalidateQueries({ queryKey: ['memetic', 'getAllTables'] });
          },
        }
      );
    }
  };

  const handleDeleteTable = (id: string) => {
    setDeletingTableId(id);
  };

  const confirmDeleteTable = async () => {
    if (deletingTableId) {
      try {
        await deleteTableMutation.mutateAsync(deletingTableId);
      } catch (error) {
        console.error("Error deleting table:", error);
      } finally {
        setDeletingTableId(null);
      }
    }
  };

  return (
    <Box>
      <Flex direction="column" gap="4">
        <Heading size="6">Create New Memetic Table</Heading>
        <Flex gap="2">
          <TextField.Root 
            style={{ flex: 1 }}
            value={newTableName} 
            onChange={(e) => setNewTableName(e.target.value)}
            placeholder="Table Name"
          />
          <Select.Root 
            value={selectedTemplateId} 
            onValueChange={(value) => setSelectedTemplateId(value)}
          >
            <Select.Trigger placeholder="Select Template" />
            <Select.Content>
              <Select.Item value="none" disabled>Select a template</Select.Item> {/* Default fallback */}
              {templatesQuery.data?.map((template) => (
                <Select.Item key={template.id} value={template.id}>
                  {template.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <Button onClick={handleCreateTable}>Create</Button>
        </Flex>
      </Flex>

      <Box mt="6">
        <Heading size="6" mb="4">
          Memetic Tables
        </Heading>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Owner</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Created At</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
            <SortableContext items={tablesQuery.data?.tables.map(table => table.id) ?? []} strategy={verticalListSortingStrategy}>
              {tablesQuery.data?.tables.map((table) => (
                <SortableTableRow
                  key={table.id}
                  id={table.id}
                  table={{
                    id: table.id,
                    name: table.name,
                    owner: table.owner,
                    createdAt: table.createdAt,
                  }}
                  onEdit={() => {/* Handle edit */}}
                  onDelete={() => handleDeleteTable(table.id)}
                />
              ))}
            </SortableContext>
            </Table.Body>
          </Table.Root>
        </DndContext>
      </Box>

      <ConfirmationModal
        isOpen={!!deletingTableId}
        onClose={() => setDeletingTableId(null)}
        onConfirm={confirmDeleteTable}
        title="Delete Memetic Table"
        message="Are you sure you want to delete this memetic table? This action cannot be undone."
        confirmText="Delete"
        confirmColor="red"
      />
    </Box>
  );
};

export default MemeticTableManagement;
