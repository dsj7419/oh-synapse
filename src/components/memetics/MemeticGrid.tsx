"use client";
import React from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import MemeticCell from "./MemeticCell";
import {
  type Tier,
  type Memetic,
  type TablePlayer,
} from "@/components/memetics/types";

interface GridRow {
  rank: number;
  memetics: Record<string, Memetic & { assignedPlayers?: TablePlayer[] }>;
}

interface MemeticGridProps {
  tiers: Tier[];
  ranks: number[];
  gridData: GridRow[];
  isEditable: boolean;
  tableId: string;
  currentUserId: string;
  isOwner: boolean;
}

const MemeticGrid: React.FC<MemeticGridProps> = ({
  tiers,
  ranks,
  gridData,
  isEditable,
  tableId,
  currentUserId,
  isOwner,
}) => {
  return (
    <Flex direction="column">
      {/* Header Row */}
      <Flex>
        {/* Empty corner cell */}
        <Box width="150px" mr="2" />
        {/* Tier headers */}
        {tiers.map((tier) => (
          <Box
            key={tier.id}
            width="250px"
            style={{
              backgroundColor: tier.color,
              padding: "12px",
              marginRight: "8px",
              border: `1px solid var(--gray-6)`,
              borderRadius: `4px`,
              textAlign: "center",
            }}
          >
            <Text size="3" weight="bold">
              {tier.tier}
            </Text>
          </Box>
        ))}
      </Flex>
      {/* Grid Rows */}
      {gridData.map((row) => (
        <Flex key={row.rank} my="2">
          {/* Rank label */}
          <Box
            width="150px"
            mr="2"
            style={{
              backgroundColor: `var(--gray-4)`,
              padding: "12px",
              textAlign: "center",
              border: `1px solid var(--gray-6)`,
              borderRadius: `4px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text size="3" weight="bold">
              Rank {row.rank}
            </Text>
          </Box>
          {/* Cells */}
          {tiers.map((tier) => {
            const memetic = row.memetics[tier.id];
            return (
              <MemeticCell
                key={tier.id}
                memetic={memetic || null}
                isEditable={isEditable}
                tableId={tableId}
                currentUserId={currentUserId}
                isOwner={isOwner}
              />
            );
          })}
        </Flex>
      ))}
    </Flex>
  );
};

export default MemeticGrid;
