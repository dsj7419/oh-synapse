"use client";
import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Box, Text, Flex, Tooltip } from "@radix-ui/themes";
import { type TablePlayer } from "@/components/memetics/types";
import { Info, User, UserCheck } from "lucide-react";

interface PlayerListProps {
  players: TablePlayer[];
  currentUserId: string;
  isOwner: boolean;
}

const PlayerList: React.FC<PlayerListProps> = ({
  players,
  currentUserId,
  isOwner,
}) => {
  return (
    <Box style={{ marginRight: "20px", width: "180px" }}>
      <Flex direction="column" gap="2" mb="2">
        <Text weight="bold" size="4">
          Players
        </Text>
        <Flex
          align="center"
          gap="1"
          style={{
            backgroundColor: "var(--accent-9)",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        >
          <Info size={12} />
          <Text
            size="1"
            style={{ color: "var(--accent-1)", lineHeight: "1.2" }}
          >
            Drag names to
            <br />
            assign memetics
          </Text>
        </Flex>
      </Flex>
      {players.map((player) => (
        <DraggablePlayer
          key={player.id}
          player={player}
          isDraggable={isOwner || player.userId === currentUserId}
        />
      ))}
      <Flex gap="2" mt="2" style={{ fontSize: "12px" }}>
        <Flex align="center" gap="1">
          <UserCheck size={12} />
          <Text size="1">Invited</Text>
        </Flex>
        <Flex align="center" gap="1">
          <User size={12} />
          <Text size="1">Manual</Text>
        </Flex>
      </Flex>
    </Box>
  );
};

interface DraggablePlayerProps {
  player: TablePlayer;
  isDraggable: boolean;
}

const DraggablePlayer: React.FC<DraggablePlayerProps> = ({
  player,
  isDraggable,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: player.id,
    data: {
      playerId: player.id,
      playerName: player.user?.name || player.name || "Unknown",
      userId: player.userId,
    },
    disabled: !isDraggable,
  });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    padding: "8px",
    margin: "4px 0",
    backgroundColor: "var(--gray-3)",
    borderRadius: "4px",
    cursor: isDraggable ? "grab" : "default",
    opacity: isDraggable ? 1 : 0.5,
    display: "flex",
    alignItems: "center",
    gap: "4px",
  };

  const playerName = player.user?.name || player.name || "Unknown";
  const isInvited = !!player.userId;

  return (
    <Tooltip content={isInvited ? "Invited player" : "Manually added player"}>
      <Box
        ref={setNodeRef}
        {...(isDraggable ? { ...listeners, ...attributes } : {})}
        style={style}
      >
        {isInvited ? <UserCheck size={12} /> : <User size={12} />}
        <Text
          style={{
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {playerName}
        </Text>
      </Box>
    </Tooltip>
  );
};

export default PlayerList;
