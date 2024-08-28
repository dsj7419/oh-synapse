'use client';

import { useState } from 'react';
import { useSession } from "next-auth/react";

export default function AdminDashboardContent() {
  const { data: session } = useSession();
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [message, setMessage] = useState('');

  const createNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newAdminEmail }),
      });
     
      if (response.ok) {
        const data = await response.json();
        setMessage(`New admin created: ${data.user.email}`);
        setNewAdminEmail('');
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      setMessage('An error occurred while creating the admin user.');
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {session?.user.name || session?.user.email}</p>
      <form onSubmit={createNewAdmin}>
        <input
          type="email"
          value={newAdminEmail}
          onChange={(e) => setNewAdminEmail(e.target.value)}
          placeholder="New admin email"
          required
        />
        <button type="submit">Create New Admin</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}