"use client";
import React, { useState } from "react";
import {
  Box,
  Flex,
  Button,
  TextField,
  Table,
  Text,
  Heading,
} from "@radix-ui/themes";
import { api } from "@/trpc/react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Toast from "@/components/common/Toast";
import ConfirmationModal from "@/components/common/ConfirmationModal.component";

interface PlayerManagementProps {
  tableId: string;
  ownerId: string;
}

const PlayerManagement: React.FC<PlayerManagementProps> = ({
  tableId,
  ownerId,
}) => {
  const [inviteInput, setInviteInput] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [playerToKick, setPlayerToKick] = useState<string | null>(null);

  const utils = api.useUtils();
  const playersQuery = api.tableMemetic.getTablePlayers.useQuery({ tableId });

  const invitePlayerMutation = api.tableMemetic.invitePlayer.useMutation({
    onSuccess: (newPlayer) => {
      utils.tableMemetic.getTableById.setData({ tableId }, (oldData) => {
        if (oldData) {
          return {
            ...oldData,
            players: [...oldData.players, { ...newPlayer, selections: [] }],
          };
        }
        return oldData;
      });
      playersQuery.refetch();
      setToast({ message: "Player invited successfully", type: "success" });
    },
    onError: (error) => {
      setToast({ message: error.message, type: "error" });
    },
  });

  const kickPlayerMutation = api.tableMemetic.kickPlayer.useMutation({
    onSuccess: () => {
      utils.tableMemetic.getTableById.setData({ tableId }, (oldData) => {
        if (oldData) {
          return {
            ...oldData,
            players: oldData.players.filter((p) => p.id !== playerToKick),
          };
        }
        return oldData;
      });
      playersQuery.refetch();
      setToast({ message: "Player kicked successfully", type: "success" });
    },
    onError: (error) => {
      setToast({ message: error.message, type: "error" });
    },
  });

  const handleInvite = async () => {
    await invitePlayerMutation.mutateAsync({ tableId, invitee: inviteInput });
    setInviteInput("");
  };

  const handleAddMe = async () => {
    await invitePlayerMutation.mutateAsync({ tableId, invitee: "me" });
  };

  const handleKickPlayer = async () => {
    if (playerToKick) {
      await kickPlayerMutation.mutateAsync({ tableId, playerId: playerToKick });
      setPlayerToKick(null);
    }
  };

  return (
    <Box>
      <Heading size="6">Player Management</Heading>
      <Flex direction="column" gap="2" mt="4">
        <TextField.Root
          value={inviteInput}
          onChange={(e) => setInviteInput(e.target.value)}
          placeholder="Email or Discord Username for existing members, or add a generic user to manage them yourself. Members you can invite to self manage."
        />
        <Flex gap="2">
          <Button onClick={handleInvite}>Invite Player</Button>
          <Button variant="soft" onClick={handleAddMe}>
            Add Me
          </Button>
        </Flex>
      </Flex>
      {playersQuery.isLoading ? (
        <LoadingSpinner />
      ) : (
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Player Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {playersQuery.data?.map((player: any) => (
              <Table.Row key={player.id}>
                <Table.Cell>
                  {player.user?.name || player.name || "Unknown"}
                </Table.Cell>
                <Table.Cell>
                  <Button
                    color="red"
                    variant="soft"
                    onClick={() => setPlayerToKick(player.id)}
                  >
                    Kick
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
      {toast && (
        <Box style={{ position: "fixed", bottom: "20px", left: "20px" }}>
          <Toast message={toast.message} type={toast.type} />
        </Box>
      )}
      <ConfirmationModal
        isOpen={!!playerToKick}
        onClose={() => setPlayerToKick(null)}
        onConfirm={handleKickPlayer}
        title="Kick Player"
        message="Are you sure you want to kick this player? This action cannot be undone."
        confirmText="Kick"
        confirmColor="red"
      />
    </Box>
  );
};

export default PlayerManagement;
