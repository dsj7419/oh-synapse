// src/components/admin/memetics/common/SortableTemplateItem.tsx

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '@/components/common/ConfirmationModal.component';
import { useThemeContext } from '@/context/ThemeContext';
import { Switch } from '@radix-ui/themes';
import { type TemplateWithAssignments } from '../types';

type SortableTemplateItemProps = {
  id: string;
  template: TemplateWithAssignments;
  onEdit: (template: TemplateWithAssignments) => void;
  onDelete: (id: string) => void;
  onPublishToggle: (id: string, isPublished: boolean) => void;
  onViewGrid: (template: TemplateWithAssignments) => void;
};

const SortableTemplateItem: React.FC<SortableTemplateItemProps> = ({
  id,
  template,
  onEdit,
  onDelete,
  onPublishToggle,
  onViewGrid,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme } = useThemeContext();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: `var(--${theme.accentColor}-2)`,
    color: `var(--${theme.accentColor}-12)`,
    borderRadius: `var(--radius-${theme.radius})`,
    marginBottom: '8px',
    padding: '8px',
  };

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onEdit(template);
  };

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(template.id);
    setIsModalOpen(false);
  };

  const handlePublishToggle = (checked: boolean) => {
    onPublishToggle(template.id, checked);
  };

  const handleViewGridClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onViewGrid(template);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="flex justify-between items-center"
      >
        <div {...attributes} {...listeners} className="flex-grow flex items-center">
          <div style={{ padding: '2px' }}>{template.name}</div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={template.isPublished}
            onCheckedChange={handlePublishToggle}
            style={{ marginRight: '8px' }}
          />
          <button
            onClick={handleViewGridClick}
            className="relative z-10"
            style={{
              color: `var(--${theme.accentColor}-9)`,
              transition: 'color 0.2s ease',
            }}
          >
            <EyeIcon className="h-5 w-5 hover:scale-110 transform transition-all" />
          </button>
          <button
            onClick={handleEditClick}
            className="relative z-10"
            style={{
              color: `var(--${theme.accentColor}-9)`,
              transition: 'color 0.2s ease',
            }}
          >
            <PencilIcon className="h-5 w-5 hover:scale-110 transform transition-all" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="relative z-10"
            style={{
              color: 'var(--red-9)',
              transition: 'color 0.2s ease',
            }}
          >
            <TrashIcon className="h-5 w-5 hover:scale-110 transform transition-all" />
          </button>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Template"
        message={`Are you sure you want to delete the template "${template.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="red"
      />
    </>
  );
};

export default SortableTemplateItem;
