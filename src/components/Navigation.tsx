'use client';
import Link from 'next/link';
import { useSession, signOut } from "next-auth/react";

export function Navigation() {
  const { data: session } = useSession();

  // Check if user has any of the roles that should see the admin link
  const showAdminLink = session?.user.roles?.some(role =>
    ['admin', 'moderator', 'editor', 'content_creator'].includes(role)
  );

  // Capitalize the first letter of the user's name if needed
  const displayName = session?.user.name
    ? session.user.name.charAt(0).toUpperCase() + session.user.name.slice(1)
    : '';

  return (
    <nav className="bg-gray-800 fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-white text-lg font-bold">OH Synapse</span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                <Link href="/recipes" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Recipes</Link>
                {showAdminLink && (
                  <Link href="/admin" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Admin</Link>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {session ? (
                <div className="relative ml-3 flex items-center">
                  {session.user.image && (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={session.user.image}
                      alt={`${displayName}'s avatar`}
                    />
                  )}
                  <span className="text-gray-300 ml-3">{displayName}</span>
                  <button
                    onClick={() => signOut()}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium ml-4"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/api/auth/signin"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
