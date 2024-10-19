"use client";
import React, { useState, useEffect } from "react";
import { Box, Button, Flex, Heading, Tooltip } from "@radix-ui/themes";
import { api } from "@/trpc/react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import PlayerManagement from "./PlayerManagement";
import MemeticGrid from "./MemeticGrid";
import PlayerList from "./PlayerList";
import {
  type Table,
  type Tier,
  type Memetic,
  type TablePlayer,
} from "@/components/memetics/types";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { RefreshCw, Link } from "lucide-react";
import { useThemeContext } from "@/context/ThemeContext";
import Toast from "@/components/common/Toast";

interface MemeticTableViewProps {
  userId: string;
  tableId: string;
}

const MemeticTableView: React.FC<MemeticTableViewProps> = ({
  userId,
  tableId,
}) => {
  const [tableData, setTableData] = useState<Table | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const { theme } = useThemeContext();
  const tableQuery = api.tableMemetic.getTableById.useQuery({ tableId });
  const selectMemeticMutation = api.memetic.selectMemetic.useMutation({
    onSuccess: () => {
      tableQuery.refetch();
    },
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await tableQuery.refetch();
    setIsRefreshing(false);
  };

  const handleCopyLiveLink = () => {
    if (tableData?.publicLink) {
      const liveViewUrl = `${window.location.origin}/memetics/tables/live/${tableData.publicLink}`;
      navigator.clipboard.writeText(liveViewUrl).then(
        () => {
          setToast({
            message: "Live view link copied to clipboard!",
            type: "success",
          });
        },
        () => {
          setToast({
            message: "Failed to copy link. Please try again.",
            type: "error",
          });
        },
      );
    }
  };

  useEffect(() => {
    if (tableQuery.data) {
      setTableData(tableQuery.data);
    }
  }, [tableQuery.data]);

  if (tableQuery.isLoading || !tableData) {
    return <LoadingSpinner />;
  }

  const isOwner = tableData.ownerId === userId;

  // Determine if the current user can self-manage
  const currentPlayer = tableData.players.find(
    (p) => p.userId === userId || p.id === userId,
  );
  const canSelfManage = currentPlayer?.canSelfManage || isOwner;

  // Use currentPlayer.id if available, otherwise use userId
  const currentPlayerId = currentPlayer ? currentPlayer.id : userId;

  // Build tiers
  const tiersMap = new Map<string, Tier>();
  tableData.template.assignments.forEach((assignment) => {
    if (assignment.memetic.tier) {
      tiersMap.set(assignment.memetic.tier.id, assignment.memetic.tier);
    }
  });
  const tiers = Array.from(tiersMap.values()).sort((a, b) => a.order - b.order);

  // Build ranks
  const ranksSet = new Set<number>();
  tableData.template.assignments.forEach((assignment) => {
    ranksSet.add(assignment.memetic.defaultRank);
  });
  const ranks = Array.from(ranksSet).sort((a, b) => a - b);

  // Build gridData for MemeticGrid
  const gridData = ranks.map((rank) => {
    const row: Record<string, Memetic & { assignedPlayers: TablePlayer[] }> =
      {};
    tiers.forEach((tier) => {
      const assignment = tableData.template.assignments.find(
        (a) => a.memetic.tier?.id === tier.id && a.memetic.defaultRank === rank,
      );
      if (assignment) {
        // Find players who have selected this memetic
        const assignedPlayers = tableData.players.filter((player) =>
          player.selections.some(
            (selection) => selection.memeticId === assignment.memetic.id,
          ),
        );
        row[tier.id] = {
          ...assignment.memetic,
          assignedPlayers,
        };
      }
    });
    return { rank, memetics: row };
  });

  // Handle memetic selection drop action
  const handleMemeticDrop = async (memeticId: string, playerId: string) => {
    try {
      await selectMemeticMutation.mutateAsync({
        tableId,
        memeticId,
        playerId,
      });
    } catch (error) {
      console.error("Error selecting memetic:", error);
    }
  };

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active && over) {
      const playerId = active.data.current?.playerId;
      const memeticId = over.id;

      if (typeof playerId === "string" && typeof memeticId === "string") {
        handleMemeticDrop(memeticId, playerId);
      }
    }
  };

  return (
    <Box>
      <Flex justify="between" align="center" mb="4">
        <Heading size="6">{tableData.name}</Heading>
        <Flex gap="2">
          <Tooltip content="Copy the live view link to share with others">
            <Button
              onClick={handleCopyLiveLink}
              style={{
                backgroundColor: `var(--${theme.accentColor}-9)`,
                color: `var(--${theme.accentColor}-1)`,
              }}
            >
              <Link size={16} />
              Copy Live View Link
            </Button>
          </Tooltip>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={isRefreshing ? "animate-spin" : ""} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </Flex>
      </Flex>
      {isOwner && <PlayerManagement tableId={tableId} ownerId={userId} />}
      <DndContext onDragEnd={handleDragEnd}>
        <Flex>
          <PlayerList
            players={tableData.players}
            currentUserId={currentPlayerId}
            isOwner={isOwner}
          />
          <MemeticGrid
            tiers={tiers}
            ranks={ranks}
            gridData={gridData}
            isEditable={canSelfManage}
            tableId={tableId}
            currentUserId={currentPlayerId}
            isOwner={isOwner}
          />
        </Flex>
      </DndContext>
      {toast && (
        <Box style={{ position: "fixed", bottom: "20px", left: "20px" }}>
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </Box>
      )}
    </Box>
  );
};

export default MemeticTableView;
