import { Box, Text } from '@radix-ui/themes';

interface PreviewSectionProps {
  title: string;
  children: React.ReactNode;
}

export const PreviewSection = ({ title, children }: PreviewSectionProps) => {
  return (
    <Box mb="4">
      <Text size="5" weight="bold" mb="2">
        {title}
      </Text>
      <Box mb="2" height="1px" style={{ backgroundColor: 'var(--color-border)' }} />
      {children}
    </Box>
  );
};
