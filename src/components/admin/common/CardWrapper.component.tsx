import React from 'react';

interface CardWrapperProps {
  children: React.ReactNode;
}

export const CardWrapper: React.FC<CardWrapperProps> = ({ children }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {children}
    </div>
  );
};
