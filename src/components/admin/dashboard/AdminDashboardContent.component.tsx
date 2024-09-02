'use client';

import { useState } from 'react';
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";

export default function AdminDashboardContent() {
  const { data: session } = useSession();
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [message, setMessage] = useState('');

  /* const createAdminMutation = api.user.createAdmin.useMutation({
    onSuccess: (data) => {
      setMessage(`New admin created: ${data.email}`);
      setNewAdminEmail('');
    },
    onError: (error) => {
      setMessage(`Error: ${error.message}`);
    },
  }); 

  const createNewAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    createAdminMutation.mutate({ email: newAdminEmail });
  }; */

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {session?.user.name ?? session?.user.email}</p>
    </div>
  );
}