'use client';

import React, { useState } from 'react';
import { api } from "@/trpc/react";
import { XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Box, Flex, Heading, TextField, Button, Card, IconButton, Dialog } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';

const CategoryManagement: React.FC = () => {
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ id: string, name: string } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string, name: string } | null>(null);

  const { theme } = useThemeContext();

  const categoriesQuery = api.bonusStat.getCategories.useQuery();
  const createCategoryMutation = api.bonusStat.createCategory.useMutation();
  const updateCategoryMutation = api.bonusStat.updateCategory.useMutation();
  const deleteCategoryMutation = api.bonusStat.deleteCategory.useMutation();

  const handleCreateCategory = async () => {
    if (newCategory.trim()) {
      try {
        await createCategoryMutation.mutateAsync(newCategory);
        setNewCategory('');
        await categoriesQuery.refetch();
      } catch (error) {
        console.error('Error creating category:', error);
      }
    }
  };

  const handleUpdateCategory = async () => {
    if (editingCategory) {
      await updateCategoryMutation.mutateAsync(editingCategory);
      setEditingCategory(null);
      await categoriesQuery.refetch();
    }
  };

  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete.id, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
          void categoriesQuery.refetch();
        },
        onError: (error) => {
          console.error('Error deleting category:', error);
          alert(`Error deleting category: ${error.message}`);
        }
      });
    }
  };

  return (
    <Card size="3">
      <Heading size="5" mb="4">Category Management</Heading>
      <Flex mb="4">
        <TextField.Root 
          size="2" 
          variant="surface" 
          radius={theme.radius}
          style={{ flex: 1 }}
          value={newCategory}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategory(e.target.value)}
          placeholder="New Category"
        />
        <Button
          onClick={handleCreateCategory}
          style={{
            backgroundColor: `var(--${theme.accentColor}-9)`,
            color: 'var(--color-background)',
            borderRadius: `var(--radius-${theme.radius})`,
          }}
          ml="2"
        >
          Add
        </Button>
      </Flex>
      <Box>
        {categoriesQuery.data?.map((category) => (
          <Card key={category.id} mb="2">
            <Flex justify="between" align="center">
              {editingCategory?.id === category.id ? (
                <TextField.Root 
                  size="2" 
                  variant="surface"
                  radius={theme.radius} 
                  style={{ flex: 1 }}
                  value={editingCategory.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                />
              ) : (
                <Box style={{ padding: '8px', borderRadius: `var(--radius-${theme.radius})`, backgroundColor: `var(--${theme.accentColor}-2)`, color: `var(--${theme.accentColor}-12)` }}>
                  {category.name}
                </Box>
              )}
              <Flex>
                {editingCategory?.id === category.id ? (
                  <>
                    <Button
                      onClick={handleUpdateCategory}
                      style={{
                        backgroundColor: `var(--${theme.accentColor}-9)`,
                        color: 'var(--color-background)',
                        borderRadius: `var(--radius-${theme.radius})`,
                      }}
                      mr="2"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => setEditingCategory(null)}
                      style={{
                        backgroundColor: 'var(--gray-5)',
                        color: 'var(--gray-12)',
                        borderRadius: `var(--radius-${theme.radius})`,
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <IconButton
                      onClick={() => setEditingCategory(category)}
                      style={{
                        backgroundColor: 'transparent',
                        color: `var(--${theme.accentColor}-9)`,
                        borderRadius: `var(--radius-${theme.radius})`,
                        transition: 'color 0.2s ease',
                      }}
                      mr="2"
                    >
                      <PencilIcon className="h-4 w-4 hover:scale-110 transform transition-all" />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setCategoryToDelete(category);
                        setIsDeleteModalOpen(true);
                      }}
                      style={{
                        backgroundColor: 'transparent',
                        color: 'var(--red-9)',
                        borderRadius: `var(--radius-${theme.radius})`,
                        transition: 'color 0.2s ease',
                      }}
                    >
                      <XMarkIcon className="h-4 w-4 hover:scale-110 transform transition-all" />
                    </IconButton>
                  </>
                )}
              </Flex>
            </Flex>
          </Card>
        ))}
      </Box>

      <Dialog.Root open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <Dialog.Content>
          <Dialog.Title>Delete Category</Dialog.Title>
          <Dialog.Description>
            Are you sure you want to delete the category "{categoryToDelete?.name}"? This will also delete all items in this category.
          </Dialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button
                style={{
                  backgroundColor: 'var(--gray-5)',
                  color: 'var(--gray-12)',
                  borderRadius: `var(--radius-${theme.radius})`,
                }}
              >
                Cancel
              </Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button
                onClick={handleDeleteCategory}
                style={{
                  backgroundColor: 'var(--red-9)',
                  color: 'var(--color-background)',
                  borderRadius: `var(--radius-${theme.radius})`,
                }}
              >
                Delete
              </Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Card>
  );
};

export default CategoryManagement;
