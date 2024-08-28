'use client';
import React, { useState } from 'react';
import BonusStatManagement from './BonusStatManagement';
import CategoryManagement from './CategoryManagement';

const BonusStatTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('items');

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <nav className="flex border-b border-gray-200">
          <button
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'items'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('items')}
          >
            Item Management
          </button>
          <button
            className={`ml-8 py-2 px-4 text-sm font-medium ${
              activeTab === 'categories'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('categories')}
          >
            Category Management
          </button>
        </nav>
      </div>
      {activeTab === 'items' ? <BonusStatManagement /> : <CategoryManagement />}
    </div>
  );
};

export default BonusStatTabs;