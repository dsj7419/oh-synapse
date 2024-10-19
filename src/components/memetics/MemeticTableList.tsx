// src/components/memetics/MemeticTableList.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Button,
  Flex,
  Text,
  Separator,
} from '@radix-ui/themes';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ConfirmationModal from '@/components/common/ConfirmationModal.component';
import SortableTableItem from './common/SortableTableItem';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useThemeContext } from '@/context/ThemeContext';

interface MemeticTableListProps {
  userId: string;
}

interface TableListItem {
  id: string;
  name: string;
  template: {
    id: string;
    name: string;
  };
  updatedAt: Date;
  publicLink?: string | null;
  isArchived?: boolean;
}

const MemeticTableList: React.FC<MemeticTableListProps> = ({ userId }) => {
  const router = useRouter();
  const [ownedTables, setOwnedTables] = useState<TableListItem[]>([]);
  const [invitedTables, setInvitedTables] = useState<TableListItem[]>([]);
  const [archivedTables, setArchivedTables] = useState<TableListItem[]>([]);
  const [deletingTableId, setDeletingTableId] = useState<string | null>(null);
  const [unarchivingTableId, setUnarchivingTableId] = useState<string | null>(
    null
  );
  const [leavingTableId, setLeavingTableId] = useState<string | null>(null);
  const generatePublicLinkMutation = api.tableMemetic.generatePublicLink.useMutation();
  const { theme } = useThemeContext();

  const tablesQuery = api.tableMemetic.getUserTables.useQuery();
  const invitedTablesQuery = api.tableMemetic.getPlayerTables.useQuery();
  const deleteTableMutation = api.tableMemetic.deleteUserTable.useMutation({
    onSuccess: () => {
      tablesQuery.refetch();
    },
  });
  const archiveTableMutation = api.tableMemetic.archiveTable.useMutation({
    onSuccess: () => {
      tablesQuery.refetch();
    },
  });
  const unarchiveTableMutation = api.tableMemetic.unarchiveTable.useMutation({
    onSuccess: () => {
      tablesQuery.refetch();
    },
  });
  const leaveTableMutation = api.tableMemetic.leaveTable.useMutation({
    onSuccess: () => {
      invitedTablesQuery.refetch();
    },
  });
  const updateTableOrderMutation =
    api.tableMemetic.updateTableOrder.useMutation();

  useEffect(() => {
    if (tablesQuery.data) {
      const activeTables = tablesQuery.data
        .filter((table) => !table.isArchived)
        .map((table) => ({
          id: table.id,
          name: table.name,
          template: {
            id: table.template.id,
            name: table.template.name,
          },
          updatedAt: table.updatedAt,
          publicLink: table.publicLink,
          isArchived: table.isArchived,
        }));
      const archived = tablesQuery.data
        .filter((table) => table.isArchived)
        .map((table) => ({
          id: table.id,
          name: table.name,
          template: {
            id: table.template.id,
            name: table.template.name,
          },
          updatedAt: table.updatedAt,
          publicLink: table.publicLink,
          isArchived: table.isArchived,
        }));
      setOwnedTables(activeTables);
      setArchivedTables(archived);
    }
  }, [tablesQuery.data]);

  useEffect(() => {
    if (invitedTablesQuery.data) {
      const tables = invitedTablesQuery.data.map((table) => ({
        id: table.id,
        name: table.name,
        template: {
          id: table.template.id,
          name: table.template.name,
        },
        updatedAt: table.updatedAt,
        publicLink: table.publicLink,
        isArchived: table.isArchived,
      }));
      setInvitedTables(tables);
    }
  }, [invitedTablesQuery.data]);

  const handleCreateTable = () => {
    router.push('/memetics/tables/create');
  };

  const handleDeleteTable = (id: string) => {
    setDeletingTableId(id);
  };

  const confirmDeleteTable = async () => {
    if (deletingTableId) {
      await deleteTableMutation.mutateAsync(deletingTableId);
      setDeletingTableId(null);
    }
  };

  const handleArchiveTable = async (id: string) => {
    await archiveTableMutation.mutateAsync(id);
  };

  const handleUnarchiveTable = (id: string) => {
    setUnarchivingTableId(id);
  };

  const confirmUnarchiveTable = async () => {
    if (unarchivingTableId) {
      await unarchiveTableMutation.mutateAsync(unarchivingTableId);
      setUnarchivingTableId(null);
    }
  };

  const handleLeaveTable = (id: string) => {
    setLeavingTableId(id);
  };

  const confirmLeaveTable = async () => {
    if (leavingTableId) {
      await leaveTableMutation.mutateAsync(leavingTableId);
      setLeavingTableId(null);
    }
  };

  const handleDragEnd = ({ active, over }: any) => {
    if (active.id !== over?.id) {
      const oldIndex = ownedTables.findIndex((item) => item.id === active.id);
      const newIndex = ownedTables.findIndex((item) => item.id === over?.id);

      const newItems = arrayMove(ownedTables, oldIndex, newIndex);
      setOwnedTables(newItems);

      updateTableOrderMutation.mutate({
        tableIds: newItems.map((table) => table.id),
      });
    }
  };

  const [parent] = useAutoAnimate();

  return (
    <Box>
      <Flex justify="between" align="center" mb="4">
        <Heading size="6">Memetic Tables</Heading>
        <Button onClick={handleCreateTable}>Create New Table</Button>
      </Flex>
      {tablesQuery.isLoading || invitedTablesQuery.isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Owned Tables */}
          <Heading size="4" mb="2">
            My Tables
          </Heading>
          <Separator />
          <Box ref={parent} mt="4">
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={ownedTables.map((table) => table.id)}
                strategy={verticalListSortingStrategy}
              >
                {ownedTables.map((table) => (
                  <SortableTableItem
                    key={table.id}
                    id={table.id}
                    table={table}
                    isOwner={true}
                    onView={() => router.push(`/memetics/tables/${table.id}`)}
                    onCopyLink={() =>
                      navigator.clipboard.writeText(
                        `${window.location.origin}/memetics/tables/live/${table.publicLink}`
                      )
                    }
                    onArchive={() => handleArchiveTable(table.id)}
                    onDelete={() => handleDeleteTable(table.id)}
                    theme={theme}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </Box>

          {/* Invited Tables */}
          <Heading size="4" mt="8" mb="2">
            Invited Tables
          </Heading>
          <Separator />
          <Box mt="4">
            {invitedTables.map((table) => (
              <SortableTableItem
                key={table.id}
                id={table.id}
                table={table}
                isOwner={false}
                onView={() => router.push(`/memetics/tables/${table.id}`)}
                onCopyLink={() =>
                  navigator.clipboard.writeText(
                    `${window.location.origin}/memetics/tables/live/${table.publicLink}`
                  )
                }
                onLeave={() => handleLeaveTable(table.id)}
                theme={theme}
              />
            ))}
          </Box>

          {/* Archived Tables */}
          {archivedTables.length > 0 && (
            <>
              <Heading size="4" mt="8" mb="2">
                Archived Tables
              </Heading>
              <Separator />
              <Box mt="4">
                {archivedTables.map((table) => (
                  <SortableTableItem
                    key={table.id}
                    id={table.id}
                    table={table}
                    isOwner={true}
                    isArchived={true}
                    onUnarchive={() => handleUnarchiveTable(table.id)}
                    onDelete={() => handleDeleteTable(table.id)}
                    theme={theme}
                  />
                ))}
              </Box>
            </>
          )}
        </>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={!!deletingTableId}
        onClose={() => setDeletingTableId(null)}
        onConfirm={confirmDeleteTable}
        title="Delete Memetic Table"
        message="Are you sure you want to delete this memetic table? This action cannot be undone."
        confirmText="Delete"
        confirmColor="red"
      />
      <ConfirmationModal
        isOpen={!!unarchivingTableId}
        onClose={() => setUnarchivingTableId(null)}
        onConfirm={confirmUnarchiveTable}
        title="Unarchive Memetic Table"
        message="Are you sure you want to unarchive this memetic table?"
        confirmText="Unarchive"
        confirmColor="green"
      />
      <ConfirmationModal
        isOpen={!!leavingTableId}
        onClose={() => setLeavingTableId(null)}
        onConfirm={confirmLeaveTable}
        title="Leave Memetic Table"
        message="Are you sure you want to leave this memetic table?"
        confirmText="Leave"
        confirmColor="red"
      />
    </Box>
  );
};

export default MemeticTableList;
