"use client";
import React from "react";
import { Box, Text, Tooltip, Card, Flex, Button } from "@radix-ui/themes";
import {
  type Memetic,
  type TablePlayer,
  type RemoveMemeticInput,
} from "@/components/memetics/types";
import { useDroppable } from "@dnd-kit/core";
import { useThemeContext } from "@/context/ThemeContext";
import { api } from "@/trpc/react";

interface MemeticCellProps {
  memetic: (Memetic & { assignedPlayers?: TablePlayer[] }) | null;
  isEditable: boolean;
  tableId: string;
  currentUserId: string;
  isOwner: boolean;
}

const MemeticCell: React.FC<MemeticCellProps> = ({
  memetic,
  isEditable,
  tableId,
  currentUserId,
  isOwner,
}) => {
  const { theme } = useThemeContext();
  const { isOver, setNodeRef } = useDroppable({
    id: memetic?.id || "empty-cell",
  });

  const utils = api.useUtils();
  const removeMemeticMutation = api.memetic.removeMemetic.useMutation({
    onSuccess: () => {
      // Invalidate and refetch
      utils.tableMemetic.getTableById.invalidate({ tableId });
    },
  });

  const handleRemovePlayer = async (playerId: string) => {
    if (memetic) {
      const input: RemoveMemeticInput = {
        tableId,
        memeticId: memetic.id,
        playerId,
      };
      await removeMemeticMutation.mutateAsync(input);
    }
  };

  const style = {
    width: "250px",
    height: "120px",
    marginRight: "8px",
    backgroundColor: isOver ? "var(--gray-5)" : "var(--gray-2)",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    border: `1px solid var(--gray-6)`,
    borderRadius: `4px`,
    padding: "4px",
    overflow: "hidden",
  };

  return (
    <Tooltip
      content={
        memetic ? (
          <Card
            style={{
              padding: "6px",
              maxWidth: "300px",
              backgroundColor: `var(--${theme.accentColor}-3)`,
              color: `var(--${theme.accentColor}-11)`,
            }}
          >
            <Flex direction="column" gap="2">
              <Text
                weight="bold"
                style={{ color: `var(--${theme.accentColor}-12)` }}
              >
                {memetic.title}
              </Text>
              <Text style={{ color: `var(--${theme.accentColor}-11)` }}>
                {memetic.description}
              </Text>
              <Text>Levels: {memetic.levelAssignments.join(", ")}</Text>
              <Text>Type: {memetic.tag?.name || "N/A"}</Text>
            </Flex>
          </Card>
        ) : null
      }
    >
      <Box ref={setNodeRef} style={style}>
        {memetic ? (
          <Box>
            <Text size="2" weight="bold" style={{ marginBottom: "4px" }}>
              {memetic.title}
            </Text>
            {memetic.assignedPlayers && memetic.assignedPlayers.length > 0 && (
              <Box>
                {memetic.assignedPlayers.map((player) => (
                  <Flex key={player.id} align="center" justify="between">
                    <Text
                      size="1"
                      style={{
                        color: `var(--${theme.accentColor}-11)`,
                        fontWeight: "bold",
                        backgroundColor: `var(--${theme.accentColor}-3)`,
                        padding: "2px 4px",
                        borderRadius: "2px",
                      }}
                    >
                      {player.user?.name || player.name || "Unknown"}
                    </Text>
                    {isEditable && (isOwner || player.id === currentUserId) && (
                      <Button
                        size="1"
                        variant="ghost"
                        onClick={() => handleRemovePlayer(player.id)}
                      >
                        X
                      </Button>
                    )}
                  </Flex>
                ))}
              </Box>
            )}
          </Box>
        ) : (
          <Box />
        )}
      </Box>
    </Tooltip>
  );
};

export default MemeticCell;
