import React from 'react';
import { Table, Button, Switch } from '@radix-ui/themes';
import { type Template } from '@prisma/client';
import { api } from "@/trpc/react";
import { useQueryClient } from '@tanstack/react-query';

interface TemplateListProps {
  templates: Template[];
  onEdit: (template: Template) => void;
  onViewGrid: (template: Template) => void;
}

const TemplateList: React.FC<TemplateListProps> = ({ templates, onEdit, onViewGrid }) => {
  const queryClient = useQueryClient();
  const deleteTemplateMutation = api.templateMemetic.deleteTemplate.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memetic', 'getAllTemplates'] });
    },
  });
  const updateTemplatePublishStatusMutation = api.templateMemetic.updateTemplatePublishStatus.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memetic', 'getAllTemplates'] });
    },
  });

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      await deleteTemplateMutation.mutateAsync(id);
    }
  };

  const handlePublishStatusChange = async (id: string, isPublished: boolean) => {
    await updateTemplatePublishStatusMutation.mutateAsync({ id, isPublished });
  };

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Published</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {templates.map((template) => (
          <Table.Row key={template.id}>
            <Table.Cell>{template.name}</Table.Cell>
            <Table.Cell>{template.description}</Table.Cell>
            <Table.Cell>
              <Switch
                checked={template.isPublished}
                onCheckedChange={(checked) => handlePublishStatusChange(template.id, checked)}
              />
            </Table.Cell>
            <Table.Cell>
              <Button size="1" variant="soft" onClick={() => onEdit(template)}>
                Edit
              </Button>
              <Button size="1" variant="soft" onClick={() => onViewGrid(template)}>
                View Grid
              </Button>
              <Button
                size="1"
                variant="soft"
                color="red"
                onClick={() => handleDeleteTemplate(template.id)}
              >
                Delete
              </Button>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};

export default TemplateList;