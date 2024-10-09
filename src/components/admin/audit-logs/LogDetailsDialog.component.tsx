import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Heading, Text, Box, Flex, ScrollArea, Separator, Card, Dialog } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';

interface AuditLog {
  id: string;
  timestamp: Date;
  username: string;
  action: string;
  severity: string;
  ipAddress: string | null;
  details: Record<string, unknown> | null;  
}

interface LogDetailsDialogProps {
  log: AuditLog;
}

const formatDetails = (details: Record<string, unknown> | null, depth = 0): JSX.Element[] => {
  if (!details) return [];
  const elements: JSX.Element[] = [];
  Object.entries(details).forEach(([key, value]) => {
    const isHighlighted = depth === 0 && (key === "name" || key === "id");
    const displayKey = key === "id" ? "Resource ID" : key;
    if (typeof value === "object" && value !== null) {
      elements.push(
        <Box key={key} style={{ marginLeft: `${depth * 8}px` }} mb="1">
          <Text weight="bold">{displayKey}:</Text>
          {formatDetails(value as Record<string, unknown>, depth + 1)}
        </Box>
      );
    } else {
      elements.push(
        <Box key={key} style={{ marginLeft: `${depth * 8}px` }} mb="1">
          <Text weight="bold" color={isHighlighted ? "blue" : undefined}>
            {displayKey}:
          </Text>{" "}
          <Text>{String(value)}</Text>
        </Box>
      );
    }
  });
  return elements;
};

const LogDetailsDialog: React.FC<LogDetailsDialogProps> = ({ log }) => {
  const { theme } = useThemeContext();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger>
        <Button 
          size="2"
          variant="soft"
          color={theme.accentColor}
          radius={theme.radius}
        >
          View Details
        </Button>
      </Dialog.Trigger>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Content 
            forceMount
            style={{
              backgroundColor: 'var(--color-panel-solid)',
              boxShadow: 'var(--shadow-5)',
              border: '2px solid var(--gray-6)',
              maxWidth: '450px',
              width: '100%',
              padding: 0,
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.90 }}
              animate={{ opacity: 1, scale: 1 }}
            //  exit={{ opacity: 0, scale: 0.95}}
              transition={{ duration: 0.7 }}
            >
              <Card size="4" style={{ width: '100%' }}>
                <Heading size="4" mb="4">Log Details</Heading>
                <Flex direction="column" gap="2">
                  {[
                    { label: 'Log ID', value: log.id },
                    { label: 'Timestamp', value: log.timestamp.toLocaleString() },
                    { label: 'Username', value: log.username },
                    { label: 'Action', value: log.action },
                    { label: 'Severity', value: log.severity },
                    { label: 'IP Address', value: log.ipAddress ?? "Not available" },
                  ].map((item, index) => (
                    <Flex key={index} justify="between" align="center">
                      <Text weight="bold">{item.label}:</Text>
                      <Text>{item.value}</Text>
                    </Flex>
                  ))}
                </Flex>
                <Separator my="3" size="4" />
                <Box mt="2">
                  <Heading size="3" mb="2" color={theme.accentColor}>Action Details</Heading>
                  <Card variant="classic" style={{ 
                    height: '200px', 
                    overflow: 'hidden',
                    backgroundColor: 'var(--color-surface)',
                  }}>
                    <ScrollArea>
                      <Box p="3">
                        {log.details ? formatDetails(log.details) : <Text>No details available</Text>}
                      </Box>
                    </ScrollArea>
                  </Card>
                </Box>
              </Card>
            </motion.div>
            <Dialog.Close>
              <Button size="1" variant="soft" color={theme.accentColor} style={{ position: 'absolute', top: '8px', right: '8px' }}>
                Close
              </Button>
            </Dialog.Close>
          </Dialog.Content>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};

export default LogDetailsDialog;