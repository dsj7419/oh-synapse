import React from 'react';
import Link from 'next/link';
import { useThemeContext } from '@/context/ThemeContext';
import { Card, Heading, Text } from '@radix-ui/themes';
import { motion } from 'framer-motion';

interface DashboardCardProps {
  title: string;
  href: string;
  description: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, href, description }) => {
  const { theme } = useThemeContext();

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <Card
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: `var(--radius-${theme.radius})`,
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            boxShadow: 'var(--shadow-2)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '24px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Heading size="5" mb="2" style={{ color: 'var(--color-text)' }}>{title}</Heading>
            <Text size="2" style={{ color: 'var(--color-text-secondary)' }}>{description}</Text>
          </motion.div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default DashboardCard;