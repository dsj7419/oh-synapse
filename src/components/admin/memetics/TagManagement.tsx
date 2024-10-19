// src/components/admin/TagManagement.tsx

import React, { useState, useEffect } from 'react';
import { Box, Flex, Heading, TextField, Button, Dialog, Text } from '@radix-ui/themes';
import { type Tag } from '@prisma/client';
import { api } from "@/trpc/react";
import { useThemeContext } from '@/context/ThemeContext';
import ConfirmationModal from '@/components/common/ConfirmationModal.component';
import Toast from '@/components/common/Toast';

type NewTagType = {
  name: string;
  description?: string;
  color?: string;
};

type ExistingTagType = {
  id: string;
  name: string;
  description?: string;
  color?: string;
};

const TagManagement: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [editingTag, setEditingTag] = useState<NewTagType | ExistingTagType | null>(null);
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { theme } = useThemeContext();

  const tagsQuery = api.memetic.getAllTags.useQuery();
  const createTagMutation = api.memetic.createTag.useMutation();
  const updateTagMutation = api.memetic.updateTag.useMutation();
  const deleteTagMutation = api.memetic.deleteTag.useMutation();

  useEffect(() => {
    if (tagsQuery.data) {
      setTags(tagsQuery.data);
    }
  }, [tagsQuery.data]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateTag = () => {
    setEditingTag({
      name: '',
      color: '#ffffff',
    });
  };

  const handleSaveTag = async () => {
    if (editingTag) {
      try {
        if ('id' in editingTag) {
          await updateTagMutation.mutateAsync(editingTag);
          showToast('Tag updated successfully', 'success');
        } else {
          await createTagMutation.mutateAsync(editingTag);
          showToast('Tag created successfully', 'success');
        }
        setEditingTag(null);
        tagsQuery.refetch();
      } catch (error) {
        console.error("Error saving tag:", error);
        showToast('Failed to save tag', 'error');
      }
    }
  };

  const handleEditTag = (tag: Tag) => {
    if (tag.name === 'Normal') {
      showToast('The "Normal" tag cannot be edited.', 'error');
      return;
    }
    setEditingTag({
      id: tag.id,
      name: tag.name,
      description: tag.description || undefined,
      color: tag.color || undefined,
    });
  };

  const handleDeleteTag = async (id: string) => {
    const tag = tags.find((t) => t.id === id);
    if (tag?.name === 'Normal') {
      showToast('The "Normal" tag cannot be deleted.', 'error');
      return;
    }
    setDeletingTagId(id);
  };

  const confirmDeleteTag = async () => {
    if (deletingTagId) {
      try {
        await deleteTagMutation.mutateAsync(deletingTagId);
        showToast('Tag deleted successfully', 'success');
        setDeletingTagId(null);
        tagsQuery.refetch();
      } catch (error) {
        console.error("Error deleting tag:", error);
        showToast('Failed to delete tag', 'error');
      }
    }
  };

  return (
    <Box>
      <Flex direction="column" align="start" mb="4">
        <Heading size="6">Manage Tags</Heading>
        <Button onClick={handleCreateTag} mt="2">Create New Tag</Button>
      </Flex>
      <Box>
        {tags.map((tag) => (
          <Flex key={tag.id} justify="between" align="center" mb="2" style={{ padding: '8px', backgroundColor: `var(--${theme.accentColor}-2)`, borderRadius: 'var(--radius-3)' }}>
            <Flex align="center" gap="2">
              <Box
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: tag.color || '#ffffff',
                  borderRadius: '50%',
                }}
              />
              <Text>{tag.name}</Text>
            </Flex>
            <Flex gap="2">
              <Button size="1" variant="soft" onClick={() => handleEditTag(tag)}>
                Edit
              </Button>
              <Button size="1" variant="soft" color="red" onClick={() => handleDeleteTag(tag.id)}>
                Delete
              </Button>
            </Flex>
          </Flex>
        ))}
      </Box>

      {/* Tag Edit/Create Dialog */}
      {editingTag && (
        <Dialog.Root open={!!editingTag} onOpenChange={(open) => !open && setEditingTag(null)}>
          <Dialog.Content style={{ maxWidth: 400 }}>
            <Dialog.Title>{('id' in editingTag) ? 'Edit Tag' : 'Create Tag'}</Dialog.Title>
            <Flex direction="column" gap="3">
              <TextField.Root
                value={editingTag.name || ''}
                onChange={(e) =>
                  setEditingTag((prev) => prev && { ...prev, name: e.target.value })
                }
                placeholder="Tag Name"
              />
              <TextField.Root
                value={editingTag.description || ''}
                onChange={(e) =>
                  setEditingTag((prev) => prev && { ...prev, description: e.target.value })
                }
                placeholder="Description"
              />
              <Flex align="center" gap="2">
                <Box>Color:</Box>
                <input
                  type="color"
                  value={editingTag.color || '#ffffff'}
                  onChange={(e) =>
                    setEditingTag((prev) => prev && { ...prev, color: e.target.value })
                  }
                  style={{ width: '100%', height: '30px' }}
                />
              </Flex>
            </Flex>
            <Flex gap="3" mt="4" justify="end">
              <Button variant="soft" color="gray" onClick={() => setEditingTag(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTag}>
                {'id' in editingTag ? 'Save Changes' : 'Create Tag'}
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      )}

      <ConfirmationModal
        isOpen={!!deletingTagId}
        onClose={() => setDeletingTagId(null)}
        onConfirm={confirmDeleteTag}
        title="Delete Tag"
        message="Are you sure you want to delete this tag? This action cannot be undone."
        confirmText="Delete"
        confirmColor="red"
      />

      {toast && (
        <Box style={{ position: 'fixed', bottom: '20px', left: '20px' }}>
          <Toast message={toast.message} type={toast.type} />
        </Box>
      )}
    </Box>
  );
};

export default TagManagement;
