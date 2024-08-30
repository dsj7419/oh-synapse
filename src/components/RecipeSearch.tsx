import React from 'react';

interface RecipeSearchProps {
  search: string;
  onSearch: (value: string) => void;
}

const RecipeSearch: React.FC<RecipeSearchProps> = ({ search, onSearch }) => {
  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full p-2 border rounded"
      />
      {search && (
        <button
          onClick={() => onSearch('')}
          className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 rounded"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default RecipeSearch;