import React from 'react';
import { Box, Flex, Text, Card, Tooltip, ScrollArea } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';
import { type Memetic, type Tier, type Tag } from '@prisma/client';
import { type TemplateWithAssignments } from './types';
import MemeticTableCell from './common/MemeticTableCell';

interface TemplateGridProps {
  template: TemplateWithAssignments;
}

const TemplateGrid: React.FC<TemplateGridProps> = ({ template }) => {
  const { theme } = useThemeContext();

  // Collect tiers
  const tiersMap = new Map<string, Tier>();
  template.assignments.forEach((assignment) => {
    if (assignment.memetic.tier) {
      tiersMap.set(assignment.memetic.tier.id, assignment.memetic.tier);
    }
  });
  const tiers = Array.from(tiersMap.values()).sort((a, b) => a.order - b.order);

  // Collect ranks
  const ranksSet = new Set<number>();
  template.assignments.forEach((assignment) => {
    ranksSet.add(assignment.memetic.defaultRank);
  });
  const ranks = Array.from(ranksSet).sort((a, b) => a - b);

  // Build gridData
  const gridData = ranks.map((rank) => {
    const row: Record<string, Memetic & { tier: Tier | null; tag: Tag | null }> = {};
    tiers.forEach((tier) => {
      const assignment = template.assignments.find(
        (a) => a.memetic.tier?.id === tier.id && a.memetic.defaultRank === rank
      );
      if (assignment) {
        row[tier.id] = assignment.memetic;
      }
    });
    return { rank, memetics: row };
  });

  return (
    <ScrollArea type="always" scrollbars="horizontal" style={{ width: '100%' }}>
      <Box style={{ minWidth: `${(tiers.length * 250) + 150}px` }}>
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
                  padding: '12px',
                  marginRight: '8px',
                  border: `1px solid var(--${theme.accentColor}-6)`,
                  borderRadius: `var(--radius-${theme.radius})`,
                  textAlign: 'center',
                }}
              >
                <Text size="3" weight="bold" style={{ color: `var(--${theme.accentColor}-1)` }}>
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
                  backgroundColor: `var(--${theme.accentColor}-4)`,
                  padding: '12px',
                  textAlign: 'center',
                  border: `2px solid var(--${theme.accentColor}-11)`,
                  borderRadius: `var(--radius-5)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text size="3" weight="bold" style={{ color: `var(--${theme.accentColor}-11)` }}>Rank {row.rank}</Text>
              </Box>
              {/* Cells */}
              {tiers.map((tier) => {
                const memetic = row.memetics[tier.id];
                return (
                  <Tooltip key={tier.id} content={
                    memetic ? (
                      <Card style={{ maxWidth: '300px', padding: '6px', backgroundColor: `var(--${theme.accentColor}-3)` }}>
                        <Flex direction="column" gap="2">
                          <Text weight="bold" align="center" style={{ color: `var(--${theme.accentColor}-11)` }}><MemeticTableCell memetic={memetic} /></Text>
                          <Text style={{ color: `var(--${theme.accentColor}-11)` }}>{memetic.description}</Text>
                          <Text style={{ color: `var(--${theme.accentColor}-11)` }}>Levels: {memetic.levelAssignments.join(', ')}</Text>
                          <Text style={{ color: `var(--${theme.accentColor}-11)` }}>Type: {memetic.tag?.name || 'N/A'}</Text>
                        </Flex>
                      </Card>
                    ) : null
                  }>
                    <Card
                      style={{
                        width: '250px',
                        height: '120px',
                        marginRight: '8px',
                        backgroundColor: memetic ? tier.color : `var(--${theme.accentColor}-3)`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        border: `1px solid var(--${theme.accentColor}-6)`,
                        borderRadius: `var(--radius-3)`,
                        padding: '2px',
                        overflow: 'hidden',
                      }}
                    >
                      {memetic ? (
                        <Text size="2" weight="bold" style={{ color: `var(--${theme.accentColor}-11)` }}>
                          <MemeticTableCell memetic={memetic} />
                        </Text>
                      ) : (
                        <Box style={{ width: '100%', height: '100%' }} />
                      )}
                    </Card>
                  </Tooltip>
                );
              })}
            </Flex>
          ))}
        </Flex>
      </Box>
    </ScrollArea>
  );
};

export default TemplateGrid;