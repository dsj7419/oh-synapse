import { getAuthSession } from "@/server/auth";
import { redirect } from 'next/navigation';
import UserManagement from '@/components/admin/users/UserManagement.component';
import { createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import type { User } from "@prisma/client";

interface UserWithRoles extends User {
  roles: string[];
}

export default async function AdminUsers() {
  const session = await getAuthSession();

  // Redirect to sign-in if session is not available
  if (!session) {
    redirect('/api/auth/signin');
  }

  // Check if the user has one of the required roles
  if (!session.user.roles || !session.user.roles.some(role => ['admin', 'moderator', 'editor', 'content_creator'].includes(role))) {
    redirect('/');
  }

  try {
    // Create TRPC context and caller to fetch users and roles
    const context = await createTRPCContext({ headers: new Headers() });
    const caller = createCaller(context);

    // Fetch users and roles in parallel
    const [users, roles] = await Promise.all([
      caller.user.getAll(),
      caller.role.getAll(),
    ]);

    // Render User Management component with fetched users and roles
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        <UserManagement
          initialUsers={users as UserWithRoles[]}
          roles={roles}
          currentUser={session.user as UserWithRoles}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching users or roles:", error);

    // Display an error message if fetching fails
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> Unable to load user management. Please try again later.</span>
          <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
            {error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    );
  }
}
