// src/app/admin/layout.tsx

import AdminSidebar from '@/components/admin/AdminSideBar.component';
import { ThemeProvider } from '@/context/ThemeContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
