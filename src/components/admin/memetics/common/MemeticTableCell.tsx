import Image from 'next/image';
import { Table, Flex, Text } from '@radix-ui/themes';

interface MemeticTableCellProps {
  memetic: {
    image: string | null | undefined;
    title: string;
  };
}

const MemeticTableCell: React.FC<MemeticTableCellProps> = ({ memetic }) => (
  <Table.Cell>
    <Flex align="center" gap="1">
      {memetic.image && (
        <Image
          src={memetic.image}
          alt={memetic.title}
          width={24}
          height={24}
          style={{
            objectFit: 'cover',
            borderRadius: 'var(--radius-1)',
          }}
        />
      )}
      <Text size="2" style={{ textDecoration: 'none' }}>{memetic.title}</Text>
    </Flex>
  </Table.Cell>
);

export default MemeticTableCell;