"use client";

import React, { useState } from 'react';
import AdminLocationsList from './AdminLocationsList.component';
import AdminLocationForm from './AdminLocationForm.component';

const AdminLocationsPage: React.FC = () => {
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);

  const handleFormSubmit = () => {
    setEditingRecipeId(null);
  };

  const handleCancelEdit = () => {
    setEditingRecipeId(null);
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Location Management</h1>

      {!editingRecipeId ? (
        <AdminLocationsList onEdit={setEditingRecipeId} />
      ) : (
        <AdminLocationForm
          recipeId={editingRecipeId}
          onSave={handleFormSubmit}
          onCancel={handleCancelEdit}
        />
      )}
    </>
  );
};

export default AdminLocationsPage;
