import React from 'react';
import { Flex, Button, Text } from '@radix-ui/themes';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <Flex align="center" justify="center" gap="2">
      <Button
        size="1"
        variant="soft"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <Text>
        Page {currentPage} of {totalPages}
      </Text>
      <Button
        size="1"
        variant="soft"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </Flex>
  );
};

export default Pagination;