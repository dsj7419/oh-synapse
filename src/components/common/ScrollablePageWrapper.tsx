import { ScrollArea } from '@radix-ui/themes';
import React from 'react';

interface ScrollablePageWrapperProps {
  children: React.ReactNode;
}

const ScrollablePageWrapper: React.FC<ScrollablePageWrapperProps> = ({ children }) => {
  return (
    <ScrollArea style={{ height: '100vh', width: '100%' }}>
      <div style={{ minHeight: '100%', padding: '1rem' }}>
        {children}
      </div>
    </ScrollArea>
  );
};

export default ScrollablePageWrapper;