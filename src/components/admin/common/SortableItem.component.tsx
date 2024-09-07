import React, { useState } from 'react';
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ConfirmationModal from '@/components/common/ConfirmationModal.component'; // Import ConfirmationModal

const SortableItem = ({ id, item, onEdit, onDelete }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent drag event propagation
    onEdit(item);
  };

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent drag event propagation
    setIsModalOpen(true); // Open confirmation modal
  };

  const handleConfirmDelete = () => {
    onDelete(item.id);
    setIsModalOpen(false); // Close the modal after confirmation
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="bg-gray-100 p-2 rounded flex justify-between items-center"
      >
        <div {...attributes} {...listeners} className="flex-grow">
          <span>{item.name} - {item.effect}</span>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleEditClick}
            className="text-blue-500 hover:text-blue-700 relative z-10"
          >
            <PencilIcon className="h-5 w-5" />
          </button>

          <button
            onClick={handleDeleteClick}
            className="text-red-500 hover:text-red-700 relative z-10"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Deleting */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Item"
        message={`Are you sure you want to delete the item "${item.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="red"
      />
    </>
  );
};

export default SortableItem;
