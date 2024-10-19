// src/components/admin/MemeticManagement.tsx

import React, { useState, useEffect } from 'react';
import { Box, Flex, Heading, Button, Select } from '@radix-ui/themes';
import MemeticList from './MemeticList';
import MemeticForm from './MemeticForm';
import { type Memetic, type Tier, type Tag } from '@prisma/client';
import { api } from "@/trpc/react";
import { useThemeContext } from '@/context/ThemeContext';
import SearchInput from '@/components/common/SearchInput';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const MemeticManagement: React.FC = () => {
  const [memetics, setMemetics] = useState<(Memetic & { tier: Tier | null; tag: Tag | null })[]>([]);
  const [editingMemetic, setEditingMemetic] = useState<Partial<Memetic> | null>(null);
  const [filterTier, setFilterTier] = useState<string | undefined>(undefined);
  const [filterTag, setFilterTag] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'tierRank' | 'alphabetical'>('tierRank');
  const [search, setSearch] = useState('');

  const { theme } = useThemeContext();
  const memeticsQuery = api.memetic.getAllMemetics.useQuery({
    search,
    tierFilter: filterTier,
    tagFilter: filterTag,
  });

  const tiersQuery = api.memetic.getAllTiers.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const tagsQuery = api.memetic.getAllTags.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (memeticsQuery.data) {
      setMemetics(memeticsQuery.data);
    }
  }, [memeticsQuery.data]);

  const createMemeticMutation = api.memetic.createMemetic.useMutation({
    onSuccess: (newMemetic) => {
      setMemetics(prev => [...prev, newMemetic]);
      setEditingMemetic(null);
    },
  });

  const updateMemeticMutation = api.memetic.updateMemetic.useMutation({
    onSuccess: (updatedMemetic) => {
      setMemetics(prev => prev.map(m => m.id === updatedMemetic.id ? updatedMemetic : m));
      setEditingMemetic(null);
    },
  });

  const deleteMemeticMutation = api.memetic.deleteMemetic.useMutation({
    onSuccess: (deletedMemetic) => {
      setMemetics(prev => prev.filter(m => m.id !== deletedMemetic.id));
    },
  });

  const handleCreateMemetic = () => {
    setEditingMemetic({
      title: '',
      description: '',
      tierId: '',
      defaultRank: 1,
      levelAssignments: [],
      tagId: '',
    });
  };

  const handleSaveMemetic = async (memeticData: Partial<Memetic>) => {
    if (memeticData.id) {
      await updateMemeticMutation.mutateAsync(memeticData as Memetic);
    } else {
      await createMemeticMutation.mutateAsync(memeticData as Memetic);
    }
  };

  const handleDeleteMemetic = async (id: string) => {
    await deleteMemeticMutation.mutateAsync(id);
  };

  const sortedMemetics = memetics
    ? [...memetics].sort((a, b) => {
        if (sortOrder === 'tierRank') {
          if (a.tier?.order !== b.tier?.order) {
            return (a.tier?.order || 0) - (b.tier?.order || 0);
          }
          return a.defaultRank - b.defaultRank;
        } else {
          return a.title.localeCompare(b.title);
        }
      })
    : [];

  return (
    <Box>
      <Flex justify="between" align="center" mb="4">
        <Heading size="6">Manage Memetics</Heading>
        <Button onClick={handleCreateMemetic}>Create New Memetic</Button>
      </Flex>

      <Flex gap="2" mb="4" align="center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search memetics..." />

        <Select.Root
          value={filterTier || 'all'}
          onValueChange={(value) => setFilterTier(value === 'all' ? undefined : value)}
        >
          <Select.Trigger placeholder="Filter Tier" />
          <Select.Content>
            <Select.Item value="all">All Tiers</Select.Item>
            {tiersQuery.data?.map((tier: Tier) => (
              <Select.Item key={tier.id} value={tier.id}>
                {tier.tier}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <Select.Root
          value={filterTag || 'all'}
          onValueChange={(value) => setFilterTag(value === 'all' ? undefined : value)}
        >
          <Select.Trigger placeholder="Filter Tag" />
          <Select.Content>
            <Select.Item value="all">All Tags</Select.Item>
            {tagsQuery.data?.map((tag: Tag) => (
              <Select.Item key={tag.id} value={tag.id}>
                {tag.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <Select.Root
          value={sortOrder}
          onValueChange={(value) => setSortOrder(value as 'tierRank' | 'alphabetical')}
        >
          <Select.Trigger placeholder="Sort Order" />
          <Select.Content>
            <Select.Item value="tierRank">By Tier & Rank</Select.Item>
            <Select.Item value="alphabetical">Alphabetically</Select.Item>
          </Select.Content>
        </Select.Root>
      </Flex>

      {memeticsQuery.isLoading ? (
        <LoadingSpinner />
      ) : (
        <Box style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <MemeticList
            memetics={sortedMemetics}
            onEdit={(memetic) => setEditingMemetic(memetic)}
            onDelete={handleDeleteMemetic}
          />
        </Box>
      )}

      {editingMemetic && (
        <MemeticForm
          memetic={{
            id: editingMemetic.id ?? '',
            title: editingMemetic.title ?? '',
            description: editingMemetic.description ?? '',
            tierId: editingMemetic.tierId ?? '',
            defaultRank: editingMemetic.defaultRank ?? 0,
            levelAssignments: editingMemetic.levelAssignments ?? [],
            tagId: editingMemetic.tagId ?? '',
            image: editingMemetic.image ?? '',
            createdAt: editingMemetic.createdAt ?? new Date(),
            updatedAt: editingMemetic.updatedAt ?? new Date(),
          }}
          onClose={() => setEditingMemetic(null)}
          onSave={handleSaveMemetic}
          tiers={tiersQuery.data || []}
          memetics={memetics}
        />
      )}
    </Box>
  );
};

export default MemeticManagement;
