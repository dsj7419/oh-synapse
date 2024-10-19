// src/components/memetics/MemeticTableCreate.tsx
'use client';

import React, { useState } from 'react';
import { Box, Flex, TextField, Button, Select, Heading } from '@radix-ui/themes';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Toast from '@/components/common/Toast';

interface MemeticTableCreateProps {
  userId: string;
}

const MemeticTableCreate: React.FC<MemeticTableCreateProps> = ({ userId }) => {
  const router = useRouter();
  const [tableName, setTableName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const templatesQuery = api.templateMemetic.getPublishedTemplates.useQuery();
  const createTableMutation = api.tableMemetic.createUserTable.useMutation({
    onSuccess: () => {
      router.push('/memetics/tables');
    },
    onError: (error) => {
      setToast({ message: error.message, type: 'error' });
    },
  });

  const handleCreateTable = async () => {
    if (tableName && selectedTemplateId) {
      await createTableMutation.mutateAsync({
        name: tableName,
        templateId: selectedTemplateId,
      });
    }
  };

  return (
    <Box>
      <Heading size="6">Create New Memetic Table</Heading>
      <Flex direction="column" gap="4" mt="4">
        <TextField.Root
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          placeholder="Table Name"
        />
        <Select.Root value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
          <Select.Trigger placeholder="Select Template" />
          <Select.Content>
            {templatesQuery.isLoading ? (
              <LoadingSpinner />
            ) : (
              templatesQuery.data?.map((template) => (
                <Select.Item key={template.id} value={template.id}>
                  {template.name}
                </Select.Item>
              ))
            )}
          </Select.Content>
        </Select.Root>
        <Button onClick={handleCreateTable} disabled={!tableName || !selectedTemplateId}>
          Create Table
        </Button>
      </Flex>

      {toast && (
        <Box style={{ position: 'fixed', bottom: '20px', left: '20px' }}>
          <Toast message={toast.message} type={toast.type} />
        </Box>
      )}
    </Box>
  );
};

export default MemeticTableCreate;
