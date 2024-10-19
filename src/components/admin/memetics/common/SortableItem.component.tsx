// src/components/admin/common/SortableItem.component.tsx

import React, { useState } from 'react';
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ConfirmationModal from '@/components/common/ConfirmationModal.component';
import { useThemeContext } from '@/context/ThemeContext';

interface SortableItemProps {
  id: string;
  item: {
    id: string;
    tier: string;
    color: string;
  };
  onEdit: (item: { id: string; tier: string; color: string }) => void;
  onDelete: (id: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, item, onEdit, onDelete }) => {
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
  };

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onEdit(item);
  };

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(item.id);
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="p-2 flex justify-between items-center"
      >
        <div {...attributes} {...listeners} className="flex-grow flex items-center">
          <div 
            style={{
              backgroundColor: item.color,
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              marginRight: '8px'
            }}
          />
          <div style={{ padding: '2px', borderRadius: `var(--radius-${theme.radius})`, backgroundColor: `var(--${theme.accentColor}-2)`, color: `var(--${theme.accentColor}-12)` }}>
            {item.tier}
          </div>
        </div>
        <div className="flex space-x-2">
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
            <XMarkIcon className="h-5 w-5 hover:scale-110 transform transition-all" />
          </button>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Tier"
        message={`Are you sure you want to delete the tier "${item.tier}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="red"
      />
    </>
  );
};

export default SortableItem;
