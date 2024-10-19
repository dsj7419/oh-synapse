"use client";

import React, { useState } from 'react';
import { api } from "@/trpc/react";
import { PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import RecipeForm from './RecipeForm.component';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Box, Card, Flex, Text, Button, Dialog, TextField, DropdownMenu, IconButton, Heading } from '@radix-ui/themes';

const AdminRecipeList: React.FC = () => {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [rarity, setRarity] = useState("");
  const [locationType, setLocationType] = useState("");
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<{ id: string; name: string } | null>(null);
  const logActionMutation = api.auditLogs.logAction.useMutation();

  const { data: session } = useSession();
  const userId = session?.user?.id ?? 'unknown';
  const username = session?.user?.name ?? 'unknown';
  const userRole = session?.user?.roles?.join(', ') ?? 'admin';

  const recipesQuery = api.recipe.getAll.useInfiniteQuery(
    { limit: 10, search, type, rarity, locationType },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchInterval: 5000,
    }
  );

  const deleteMutation = api.recipe.delete.useMutation({
    onSuccess: async () => {
      setIsDeleteModalOpen(false);
      setRecipeToDelete(null);
      await logActionMutation.mutateAsync({
        action: 'Delete Recipe',
        resourceType: 'Recipe',
        resourceId: recipeToDelete?.id ?? '',
        severity: 'high',
        details: { name: recipeToDelete?.name },
      });
      void recipesQuery.refetch();
    },
    onError: async (error) => {
      await logActionMutation.mutateAsync({
        action: 'Delete Recipe Failed',
        resourceType: 'Recipe',
        resourceId: recipeToDelete?.id ?? '',
        severity: 'high',
        details: { error: error.message, name: recipeToDelete?.name },
      });
      alert(`Error deleting recipe: ${error.message}`);
      setIsDeleteModalOpen(false);
      setRecipeToDelete(null);
    },
  });

  const handleDelete = () => {
    if (recipeToDelete) {
      deleteMutation.mutate(recipeToDelete.id);
    }
  };

  const handleEditComplete = () => {
    setEditingRecipeId(null);
    void recipesQuery.refetch();
  };

  return (
    <Card size="3">
      <Heading size="6" mb="4">Recipe Management</Heading>
      {editingRecipeId ? (
        <RecipeForm
          key={editingRecipeId}
          recipeId={editingRecipeId}
          onSave={handleEditComplete}
          onCancel={() => setEditingRecipeId(null)}
        />
      ) : (
        <RecipeForm onSave={handleEditComplete} onCancel={() => setEditingRecipeId(null)} />
      )}

      <Box mt="8">
        <Heading size="5" mb="4">Recipe List</Heading>

        {/* Table of Contents */}
        <Text as="p" size="2" color="gray" mb="4">
          Table:&nbsp;&nbsp;&nbsp;| &nbsp;&nbsp;&nbsp;
          <Image
            src="https://utfs.io/f/c7b91760-6703-4c01-a4f1-85ae5c4ec5da-n81lur.256x256.png"
            alt="Memetic Icon"
            width={16}
            height={16}
            className="inline mr-1"
          /> 
          &nbsp; &nbsp;Memetic&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;
          <CheckCircleIcon className="inline h-5 w-5 text-green-500 mx-1" />  &nbsp;Completed Location World Recipe &nbsp;&nbsp;&nbsp;| &nbsp;&nbsp;&nbsp; 
          <XCircleIcon className="inline h-5 w-5 text-red-500 mx-1" /> &nbsp; Incomplete Location World Recipe &nbsp;&nbsp;&nbsp; |
        </Text>

        {/* Filters */}
        <Flex gap="2" mb="4">
        <TextField.Root
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-grow p-2 border rounded"
          size="2"
          variant="surface" 
          radius="medium"
        >
          <TextField.Slot>
            <MagnifyingGlassIcon height="16" width="16" />
          </TextField.Slot>
        </TextField.Root>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft">
                {type || "All Types"}
                <DropdownMenu.TriggerIcon />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item onSelect={() => setType("")}>All Types</DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => setType("Food")}>Food</DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => setType("Drink")}>Drink</DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => setType("Crafted Ingredient")}>Crafted Ingredient</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft">
                {rarity || "All Rarities"}
                <DropdownMenu.TriggerIcon />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item onSelect={() => setRarity("")}>All Rarities</DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => setRarity("common")}>Common</DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => setRarity("uncommon")}>Uncommon</DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => setRarity("rare")}>Rare</DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => setRarity("unique")}>Unique</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft">
                {locationType || "All Locations"}
                <DropdownMenu.TriggerIcon />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item onSelect={() => setLocationType("")}>All Locations</DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => setLocationType("memetics")}>Memetic</DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => setLocationType("worldMap")}>World Location</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>

        {recipesQuery.isLoading ? (
          <Text>Loading...</Text>
        ) : recipesQuery.isError ? (
          <Text color="red">{recipesQuery.error.message}</Text>
        ) : (
          <>
            <Box>
              {recipesQuery.data?.pages.map((page) =>
                page.recipes.map((recipe) => (
                  <Card key={recipe.id} mb="2">
                    <Flex justify="between" align="center">
                      <Flex align="center" gap="2">
                        {recipe.locationType === 'memetics' ? (
                          <Image
                            src="https://utfs.io/f/c7b91760-6703-4c01-a4f1-85ae5c4ec5da-n81lur.256x256.png"
                            alt="Memetic Icon"
                            width={16}
                            height={16}
                          />
                        ) : recipe.isComplete ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-500" />
                        )}
                        <Text>{recipe.name} - {recipe.type}</Text>
                      </Flex>
                      <Flex>
                        <IconButton 
                          onClick={() => setEditingRecipeId(recipe.id)}
                          variant="ghost"
                          mr="2"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton 
                          onClick={() => {
                            setRecipeToDelete({ id: recipe.id, name: recipe.name });
                            setIsDeleteModalOpen(true);
                          }}
                          variant="ghost"
                          color="red"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </Flex>
                    </Flex>
                  </Card>
                ))
              )}
            </Box>
            {recipesQuery.hasNextPage && (
              <Button 
                onClick={() => recipesQuery.fetchNextPage()}
                disabled={recipesQuery.isFetchingNextPage}
                mt="4"
              >
                {recipesQuery.isFetchingNextPage ? 'Loading more...' : 'Load More'}
              </Button>
            )}
          </>
        )}
      </Box>

      {/* Delete Confirmation Modal */}
      <Dialog.Root open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Delete Recipe</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Are you sure you want to delete the recipe &apos;{recipeToDelete?.name}&apos;? This action cannot be undone.
          </Dialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button variant="solid" color="red" onClick={handleDelete}>
                Delete
              </Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Card>
  );
};

export default AdminRecipeList;