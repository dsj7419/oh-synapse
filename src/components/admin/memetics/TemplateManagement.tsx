// src/components/admin/memetics/TemplateManagement.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Flex,
  Heading,
  TextField,
  Button,
  Dialog,
} from '@radix-ui/themes';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableTemplateItem from './common/SortableTemplateItem';
import { Memetic, Tier } from '@prisma/client';
import { api } from '@/trpc/react';
import { useQueryClient } from '@tanstack/react-query';
import ConfirmationModal from '@/components/common/ConfirmationModal.component';
import MemeticSelector from './common/MemeticSelector';
import { useThemeContext } from '@/context/ThemeContext';
import Toast from '@/components/common/Toast';
import TemplateGrid from './TemplateGrid';
import { type TemplateWithAssignments } from './types';

const TemplateManagement: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateWithAssignments[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<TemplateWithAssignments | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { theme } = useThemeContext();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const templatesQuery = api.templateMemetic.getAllTemplates.useQuery();

  const memeticsQuery = api.memetic.getAllMemetics.useQuery({}, {
    select: (data) => data.map((memetic) => ({
      ...memetic,
      tag: memetic.tag || null,
    })),
  });
  

  const createTemplateMutation = api.templateMemetic.createTemplate.useMutation({
    onSuccess: (newTemplate) => {
      queryClient.invalidateQueries({ queryKey: ['memetic', 'getAllTemplates'] });
      setTemplates((prev) => [...prev, newTemplate as TemplateWithAssignments].sort((a, b) => a.order - b.order));
      showToast('Template created successfully', 'success');
    },
    onError: (error) => {
      showToast(`Failed to create template: ${error.message}`, 'error');
    },
  });

  const updateTemplateMutation = api.templateMemetic.updateTemplate.useMutation({
    onSuccess: (updatedTemplate) => {
      queryClient.invalidateQueries({ queryKey: ['memetic', 'getAllTemplates'] });
      setTemplates((prev) =>
        prev.map((t) => (t.id === updatedTemplate.id ? (updatedTemplate as TemplateWithAssignments) : t))
      );
      showToast('Template updated successfully', 'success');
    },
    onError: (error) => {
      showToast(`Failed to update template: ${error.message}`, 'error');
    },
  });

  const deleteTemplateMutation = api.templateMemetic.deleteTemplate.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memetic', 'getAllTemplates'] });
      setTemplates((prev) => prev.filter((t) => t.id !== deletingTemplateId));
      showToast('Template deleted successfully', 'success');
    },
    onError: (error) => {
      showToast(`Failed to delete template: ${error.message}`, 'error');
    },
  });

  const updateTemplateOrderMutation = api.templateMemetic.updateTemplateOrder.useMutation();

  const updateTemplatePublishStatusMutation = api.templateMemetic.updateTemplatePublishStatus.useMutation({
    onSuccess: (updatedTemplate) => {
      setTemplates((prev) =>
        prev.map((t) => (t.id === updatedTemplate.id ? (updatedTemplate as TemplateWithAssignments) : t))
      );
      showToast('Template publish status updated', 'success');
    },
    onError: (error) => {
      showToast(`Failed to update publish status: ${error.message}`, 'error');
    },
  });

  useEffect(() => {
    if (templatesQuery.data) {
      setTemplates(templatesQuery.data.sort((a, b) => a.order - b.order));
    }
  }, [templatesQuery.data]);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleCreateTemplate = () => {
    setEditingTemplate({
      id: '',
      name: '',
      description: '',
      memeticIds: [],
      isPublished: false,
    });
  };

  const handleSaveTemplate = async () => {
    if (editingTemplate) {
      try {
        if (editingTemplate.id) {
          await updateTemplateMutation.mutateAsync(editingTemplate);
        } else {
          await createTemplateMutation.mutateAsync(editingTemplate);
        }
        setEditingTemplate(null);
      } catch (error) {
        console.error('Error saving template:', error);
      }
    }
  };

  const handleEditTemplate = (template: TemplateWithAssignments) => {
    setEditingTemplate({
      id: template.id,
      name: template.name,
      description: template.description,
      isPublished: template.isPublished,
      memeticIds: template.assignments?.map((a) => a.memetic.id) || [],
    });
  };

  const handleDeleteTemplate = (id: string) => {
    setDeletingTemplateId(id);
  };

  const confirmDeleteTemplate = async () => {
    if (deletingTemplateId) {
      try {
        await deleteTemplateMutation.mutateAsync(deletingTemplateId);
      } catch (error) {
        console.error('Error deleting template:', error);
      } finally {
        setDeletingTemplateId(null);
      }
    }
  };

  const handlePublishStatusChange = async (id: string, isPublished: boolean) => {
    try {
      await updateTemplatePublishStatusMutation.mutateAsync({ id, isPublished });
    } catch (error) {
      console.error('Error updating template publish status:', error);
    }
  };

  const handleDragEnd = (event: DragEndEvent, isPublished: boolean) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTemplates((items) => {
        const filteredItems = items.filter((item) => item.isPublished === isPublished);
        const otherItems = items.filter((item) => item.isPublished !== isPublished);

        const oldIndex = filteredItems.findIndex((item) => item.id === active.id);
        const newIndex = filteredItems.findIndex((item) => item.id === over?.id);

        const newItems = arrayMove(filteredItems, oldIndex, newIndex);

        // Update the order of all items
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          order: index + 1,
        }));

        // Call the mutation to update the order in the backend
        updateTemplateOrderMutation.mutate(
          updatedItems.map((item) => ({ id: item.id, order: item.order }))
        );

        return [...updatedItems, ...otherItems].sort((a, b) => a.order - b.order);
      });
    }
  };

  const handleAddAllNormal = () => {
    const normalMemetics =
      memeticsQuery.data
        ?.filter((m) => m.tag?.name === 'Normal')
        .map((m) => m.id) || [];
    setEditingTemplate((prev: any) => ({
      ...prev,
      memeticIds: Array.from(new Set([...prev.memeticIds, ...normalMemetics])),
    }));
  };

  const handleViewGrid = (template: TemplateWithAssignments) => {
    setViewingTemplate(template);
  };
  

  return (
    <Box style={{ margin: '0 auto' }}>
      <Flex direction="column" align="start" mb="4">
        <Heading size="6">Manage Templates</Heading>
        <Button onClick={handleCreateTemplate} mt="2">
          Create New Template
        </Button>
      </Flex>

      <Box mb="4">
        <Heading
          size="5"
          mb="2"
          style={{ borderBottom: '1px solid var(--gray-6)', paddingBottom: '8px' }}
        >
          Published Templates
        </Heading>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => handleDragEnd(event, true)}
        >
          <SortableContext
            items={templates.filter((t) => t.isPublished).map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {templates
              .filter((t) => t.isPublished)
              .map((template) => (
                <SortableTemplateItem
                  key={template.id}
                  id={template.id}
                  template={template}
                  onEdit={handleEditTemplate}
                  onDelete={handleDeleteTemplate}
                  onPublishToggle={handlePublishStatusChange}
                  onViewGrid={handleViewGrid}
                />
              ))}
          </SortableContext>
        </DndContext>
      </Box>

      <Box>
        <Heading
          size="5"
          mb="2"
          style={{ borderBottom: '1px solid var(--gray-6)', paddingBottom: '8px' }}
        >
          Unpublished Templates
        </Heading>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => handleDragEnd(event, false)}
        >
          <SortableContext
            items={templates.filter((t) => !t.isPublished).map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {templates
              .filter((t) => !t.isPublished)
              .map((template) => (
                <SortableTemplateItem
                  key={template.id}
                  id={template.id}
                  template={template}
                  onEdit={handleEditTemplate}
                  onDelete={handleDeleteTemplate}
                  onPublishToggle={handlePublishStatusChange}
                  onViewGrid={handleViewGrid}
                />
              ))}
          </SortableContext>
        </DndContext>
      </Box>

      {/* Template Grid Dialog */}
      <Dialog.Root open={!!viewingTemplate} onOpenChange={(open) => !open && setViewingTemplate(null)}>
        <Dialog.Content style={{ maxWidth: 1500 }}>
          <Dialog.Title>{viewingTemplate?.name} Grid</Dialog.Title>
          {viewingTemplate && <TemplateGrid template={viewingTemplate} />}
          <Flex justify="end" mt="4">
            <Button onClick={() => setViewingTemplate(null)}>Close</Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Template Edit/Create Dialog */}
      <Dialog.Root open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <Dialog.Content style={{ maxWidth: 800 }}>
          <Dialog.Title>{editingTemplate?.id ? 'Edit Template' : 'Create Template'}</Dialog.Title>
          <Flex direction="column" gap="3">
            <TextField.Root
              size="3"
              variant="surface"
              value={editingTemplate?.name || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditingTemplate((prev: any) => prev && { ...prev, name: e.target.value })
              }
              placeholder="Name"
            />
            <TextField.Root
              size="3"
              variant="surface"
              value={editingTemplate?.description || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEditingTemplate((prev: any) => prev && { ...prev, description: e.target.value })
              }
              placeholder="Description"
            />
            <Button onClick={handleAddAllNormal}>Add All Normal Memetics</Button>
            <MemeticSelector
              assignedMemeticIds={editingTemplate?.memeticIds || []}
              onChange={(newMemeticIds) => {
                setEditingTemplate((prev: any) => ({ ...prev, memeticIds: newMemeticIds }));
              }}
              memetics={memeticsQuery.data || []}
            />
          </Flex>
          <Flex gap="3" mt="4" justify="end">
            <Button variant="soft" color="gray" onClick={() => setEditingTemplate(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              {editingTemplate?.id ? 'Save Changes' : 'Create Template'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <ConfirmationModal
        isOpen={!!deletingTemplateId}
        onClose={() => setDeletingTemplateId(null)}
        onConfirm={confirmDeleteTemplate}
        title="Delete Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
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

export default TemplateManagement;
