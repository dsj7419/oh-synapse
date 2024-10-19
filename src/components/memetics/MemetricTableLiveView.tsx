"use client";
import React, { useState, useEffect } from "react";
import { Box, Heading, Text, Button, Flex } from "@radix-ui/themes";
import { api } from "@/trpc/react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import MemeticGrid from "./MemeticGrid";
import { type Table, type Tier, type Memetic, type TablePlayer } from "./types";
import { RefreshCw } from "lucide-react";

interface MemeticTableLiveViewProps {
  publicLink: string;
}

const MemeticTableLiveView: React.FC<MemeticTableLiveViewProps> = ({
  publicLink,
}) => {
  const [tableData, setTableData] = useState<Table | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const tableQuery = api.tableMemetic.getTableByPublicLink.useQuery(
    publicLink,
    {
      retry: false,
      enabled: !!publicLink,
    },
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await tableQuery.refetch();
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (tableQuery.data) {
      setTableData(tableQuery.data);
      setError(null);
    }
    if (tableQuery.error) {
      setError(
        "Failed to load table data. Please check the link and try again.",
      );
    }
  }, [tableQuery.data, tableQuery.error]);

  if (tableQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (error || tableQuery.isError) {
    return (
      <Box style={{ padding: "16px" }}>
        <Heading size="5" mb="2">
          Error
        </Heading>
        <Text>
          {error ||
            "Invalid or expired link. Please check the URL and try again."}
        </Text>
      </Box>
    );
  }

  if (!tableData) {
    return (
      <Box style={{ padding: "16px" }}>
        <Heading size="5" mb="2">
          Error
        </Heading>
        <Text>No data available. Please check the link and try again.</Text>
      </Box>
    );
  }

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

  // Build gridData
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

  return (
    <Box>
      <Flex justify="between" align="center" mb="4">
        <Heading size="6">{tableData.name || "Untitled"} - Live View</Heading>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </Flex>
      <MemeticGrid
        tiers={tiers}
        ranks={ranks}
        gridData={gridData}
        isEditable={false}
        tableId={tableData.id}
        currentUserId=""
        isOwner={false}
      />
    </Box>
  );
};

export default MemeticTableLiveView;
