"use client";
import React, { useState } from 'react';
import AdminLocationsList from './AdminLocationsList.component';
import AdminLocationForm from './AdminLocationForm.component';
import { Box, Heading, Flex, Card } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';

const AdminLocationsPage: React.FC = () => {
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const { theme } = useThemeContext();

  const handleFormSubmit = () => {
    setEditingRecipeId(null);
  };

  const handleCancelEdit = () => {
    setEditingRecipeId(null);
  };

  return (
    <Card size="3" style={{ backgroundColor: 'var(--color-surface)' }}>
      <Heading size="6" mb="6" style={{ color: `var(--${theme.accentColor}-12)` }}>
        Location Management
      </Heading>
      <Flex direction="column" gap="4" px="4">
        {!editingRecipeId ? (
          <AdminLocationsList onEdit={setEditingRecipeId} />
        ) : (
          <AdminLocationForm
            recipeId={editingRecipeId}
            onSave={handleFormSubmit}
            onCancel={handleCancelEdit}
          />
        )}
      </Flex>
    </Card>
  );
};

export default AdminLocationsPage;