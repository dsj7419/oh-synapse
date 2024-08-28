'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { api } from "@/trpc/react";

const BonusStatManagement: React.FC = () => {
  const [newStat, setNewStat] = useState({ name: '', effect: '', type: 'meat' as const });
  const bonusStatsQuery = api.bonusStat.getAll.useQuery();
  const createBonusStatMutation = api.bonusStat.create.useMutation();
  const updateBonusStatMutation = api.bonusStat.update.useMutation();
  const deleteBonusStatMutation = api.bonusStat.delete.useMutation();
  const reorderBonusStatMutation = api.bonusStat.reorder.useMutation();

  const handleCreate = () => {
    createBonusStatMutation.mutate(newStat, {
      onSuccess: () => {
        setNewStat({ name: '', effect: '', type: 'meat' });
        bonusStatsQuery.refetch();
      }
    });
  };

  const handleUpdate = (id: string, data: Partial<typeof newStat>) => {
    updateBonusStatMutation.mutate({ id, ...data }, {
      onSuccess: () => bonusStatsQuery.refetch()
    });
  };

  const handleDelete = (id: string) => {
    deleteBonusStatMutation.mutate(id, {
      onSuccess: () => bonusStatsQuery.refetch()
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    const type = result.type;

    reorderBonusStatMutation.mutate({
      type,
      sourceIndex,
      destinationIndex
    }, {
      onSuccess: () => bonusStatsQuery.refetch()
    });
  };

  const renderBonusStats = (type: string) => (
    <Droppable droppableId={type}>
      {(provided) => (
        <ul {...provided.droppableProps} ref={provided.innerRef}>
          {bonusStatsQuery.data
            ?.filter(stat => stat.type === type)
            .map((stat, index) => (
              <Draggable key={stat.id} draggableId={stat.id} index={index}>
                {(provided) => (
                  <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {stat.name} - {stat.effect}
                    <button onClick={() => handleDelete(stat.id)}>Delete</button>
                  </li>
                )}
              </Draggable>
            ))}
          {provided.placeholder}
        </ul>
      )}
    </Droppable>
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div>
        <h1>Bonus Stat Management</h1>

        <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
          <input
            value={newStat.name}
            onChange={(e) => setNewStat(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Name"
          />
          <input
            value={newStat.effect}
            onChange={(e) => setNewStat(prev => ({ ...prev, effect: e.target.value }))}
            placeholder="Effect"
          />
          <select
            value={newStat.type}
            onChange={(e) => setNewStat(prev => ({ ...prev, type: e.target.value as 'meat' | 'fish' | 'plant' }))}
          >
            <option value="meat">Meat</option>
            <option value="fish">Fish</option>
            <option value="plant">Plant</option>
          </select>
          <button type="submit">Add Bonus Stat</button>
        </form>

        <h2>Meat Bonus Stats</h2>
        {renderBonusStats('meat')}
        <h2>Fish Bonus Stats</h2>
        {renderBonusStats('fish')}
        <h2>Plant Bonus Stats</h2>
        {renderBonusStats('plant')}
      </div>
    </DragDropContext>
  );
};

export default BonusStatManagement;