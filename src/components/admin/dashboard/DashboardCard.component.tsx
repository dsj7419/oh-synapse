import React from 'react';
import Link from 'next/link';
import { CardWrapper } from '@/components/admin/common/CardWrapper.component';

interface DashboardCardProps {
  title: string;
  href: string;
  description: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, href, description }) => {
  return (
    <CardWrapper>
      <Link href={href} className="block p-6 hover:bg-gray-50 rounded-lg transition">
        <h2 className="text-2xl font-semibold mb-2">{title}</h2>
        <p>{description}</p>
      </Link>
    </CardWrapper>
  );
};

export default DashboardCard;
