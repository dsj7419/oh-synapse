// src/components/memetics/common/SortableTableItem.tsx
'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Flex, Text, Button } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';
import { api } from '@/trpc/react';
import Toast from '@/components/common/Toast';

interface TableListItem {
  id: string;
  name: string;
  template: {
    id: string;
    name: string;
  };
  updatedAt: Date;
  publicLink?: string | null;
  isArchived?: boolean;
}

interface SortableTableItemProps {
  id: string;
  table: TableListItem;
  isOwner: boolean;
  isArchived?: boolean;
  onView?: () => void;
  onCopyLink?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  onDelete?: () => void;
  onLeave?: () => void;
  theme: any;
}

const SortableTableItem: React.FC<SortableTableItemProps> = ({
  id,
  table,
  isOwner,
  isArchived = false,
  onView,
  onCopyLink,
  onArchive,
  onUnarchive,
  onDelete,
  onLeave,
  theme,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
    disabled: !isOwner || isArchived,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: `var(--${theme.accentColor}-2)`,
    borderRadius: `var(--radius-${theme.radius})`,
    marginBottom: '8px',
    padding: '12px',
  };

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const generatePublicLinkMutation = api.tableMemetic.generatePublicLink.useMutation({
    onSuccess: (data) => {
      table.publicLink = data.publicLink;
      setToast({ message: 'Public link generated successfully!', type: 'success' });
      setIsGeneratingLink(false);
    },
    onError: () => {
      setToast({ message: 'Failed to generate public link.', type: 'error' });
      setIsGeneratingLink(false);
    },
  });

  const handleGenerateLink = async () => {
    setIsGeneratingLink(true);
    await generatePublicLinkMutation.mutateAsync(table.id);
  };

  const handleCopyLink = () => {
    if (table.publicLink) {
      navigator.clipboard.writeText(
        `${window.location.origin}/memetics/tables/live/${table.publicLink}`
      );
      setToast({ message: 'Link copied to clipboard!', type: 'success' });
    }
  };

  return (
    <>
      <Box ref={setNodeRef} style={style}>
        <Flex justify="between" align="center">
          <Flex
            align="center"
            gap="4"
            {...(isOwner && !isArchived ? { ...attributes, ...listeners } : {})}
          >
            <Text weight="bold" size="4">
              {table.name}
            </Text>
            <Text size="2" color="gray">
              {table.template.name}
            </Text>
            <Text size="2" color="gray">
              Last Activity: {new Date(table.updatedAt).toLocaleString()}
            </Text>
          </Flex>
          <Flex gap="2">
            {onView && (
              <Button size="1" onClick={onView}>
                View
              </Button>
            )}
            {isOwner && (
              <>
                {table.publicLink ? (
                  <Button size="1" variant="soft" onClick={handleCopyLink}>
                    Copy Link
                  </Button>
                ) : (
                  <Button 
                    size="1" 
                    variant="soft" 
                    onClick={handleGenerateLink}
                    disabled={isGeneratingLink}
                  >
                    {isGeneratingLink ? 'Generating...' : 'Generate Link'}
                  </Button>
                )}
                {onArchive && (
                  <Button size="1" variant="soft" color="gray" onClick={onArchive}>
                    Archive
                  </Button>
                )}
                {onUnarchive && (
                  <Button size="1" variant="soft" color="green" onClick={onUnarchive}>
                    Unarchive
                  </Button>
                )}
                {onDelete && (
                  <Button size="1" variant="soft" color="red" onClick={onDelete}>
                    Delete
                  </Button>
                )}
              </>
            )}
            {!isOwner && onLeave && (
              <Button size="1" variant="soft" color="red" onClick={onLeave}>
                Leave
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default SortableTableItem;