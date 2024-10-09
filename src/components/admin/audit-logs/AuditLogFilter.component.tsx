import React from "react";
import { Select, TextField, Flex } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';

interface AuditLogFilterProps {
  onFilterChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
}

const AuditLogFilter: React.FC<AuditLogFilterProps> = ({ onFilterChange, onSeverityChange }) => {
  const { theme } = useThemeContext();

  return (
    <Flex gap="4" mb="4">
      <Select.Root onValueChange={onSeverityChange} defaultValue="all" size="3">
        <Select.Trigger placeholder="Select severity" />
        <Select.Content>
          <Select.Item value="all">All Severities</Select.Item>
          <Select.Item value="normal">Normal</Select.Item>
          <Select.Item value="medium">Medium</Select.Item>
          <Select.Item value="high">High</Select.Item>
          <Select.Item value="severe">Severe</Select.Item>
        </Select.Content>
      </Select.Root>
      
      <TextField.Root
        size="3"
        variant="surface"
        radius={theme.radius}
        style={{ flex: 1 }}
        placeholder="Search logs..."
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFilterChange(e.target.value)}
      />
    </Flex>
  );
};

export default AuditLogFilter;