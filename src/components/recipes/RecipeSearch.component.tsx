import React, { useCallback } from 'react';

interface RecipeSearchProps {
  search: string;
  onSearch: (value: string) => void;
}

const RecipeSearch: React.FC<RecipeSearchProps> = ({ search, onSearch }) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    onSearch('');
  }, [onSearch]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={search}
        onChange={handleChange}
        placeholder="Search recipes..."
        className="w-full p-2 border rounded text-black"
      />
      {search && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default React.memo(RecipeSearch);
