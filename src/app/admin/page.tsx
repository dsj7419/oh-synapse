import React from 'react';
import DashboardGrid from '@/components/admin/dashboard/DashboardGrid.component';

const AdminPage: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <DashboardGrid />
    </div>
  );
};

export default AdminPage;
