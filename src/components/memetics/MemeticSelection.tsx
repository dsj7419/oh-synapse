"use client";
import React, { useState, useEffect } from "react";
import { Box, Flex, Button, Text, Heading } from "@radix-ui/themes";
import { api } from "@/trpc/react";
import { type Table, type TablePlayer } from "@/components/memetics/types";

interface MemeticSelectionProps {
  tableData: Table;
  userId: string;
  isOwner: boolean;
}

const MemeticSelection: React.FC<MemeticSelectionProps> = ({
  tableData,
  userId,
  isOwner,
}) => {
  const [selectedMemetics, setSelectedMemetics] = useState<string[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<TablePlayer | null>(null);

  const selectMemeticMutation = api.memetic.selectMemetic.useMutation();
  const tableQuery = api.tableMemetic.getTableById.useQuery({
    tableId: tableData.id,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      tableQuery.refetch();
    }, 5000); // Refetch every 5 seconds
    return () => clearInterval(interval);
  }, [tableQuery]);

  useEffect(() => {
    if (tableQuery.data) {
      const player = tableQuery.data.players.find(
        (p) => p.userId === userId || p.id === userId,
      );
      setCurrentPlayer(player || null);
      const userSelections = player?.selections.map((s) => s.memeticId) || [];
      setSelectedMemetics(userSelections);
    }
  }, [tableQuery.data, userId]);

  const handleSelectMemetic = async (memeticId: string) => {
    if (!currentPlayer) return;

    await selectMemeticMutation.mutateAsync({
      tableId: tableData.id,
      memeticId,
      playerId: currentPlayer.id, // Use the player's id, which exists for both real and dummy players
    });
    tableQuery.refetch();
  };

  const isAssignedToUser = (memeticId: string) => {
    return selectedMemetics.includes(memeticId);
  };

  if (!currentPlayer) {
    return <Box>Loading player data...</Box>;
  }

  return (
    <Box>
      <Heading size="6">Memetic Selection</Heading>
      <Flex direction="column" gap="2" mt="4">
        {tableData.template.assignments.map((assignment) => (
          <Flex key={assignment.memeticId} align="center" gap="2">
            <Text>{assignment.memetic.title}</Text>
            <Button
              onClick={() => handleSelectMemetic(assignment.memeticId)}
              disabled={!isOwner && !isAssignedToUser(assignment.memeticId)}
            >
              {isAssignedToUser(assignment.memeticId) ? "Deselect" : "Select"}
            </Button>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};

export default MemeticSelection;
