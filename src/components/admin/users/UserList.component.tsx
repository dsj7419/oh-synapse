import React from 'react';
import type { User } from '@prisma/client';

interface UserWithRoles extends User {
  roles: string[];
}

interface UserListProps {
  users: UserWithRoles[];
  searchTerm: string;
  selectedUser: UserWithRoles | null;
  onUserSelect: (user: UserWithRoles) => void;
}

const UserList: React.FC<UserListProps> = ({ users, searchTerm, selectedUser, onUserSelect }) => {
  const filteredUsers = users.filter(user => 
    (user.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (user.email ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ul className="max-h-96 overflow-y-auto">
      {filteredUsers.map(user => (
        <li
          key={user.id}
          className={`cursor-pointer p-2 hover:bg-gray-100 ${selectedUser?.id === user.id ? 'bg-blue-100' : ''}`}
          onClick={() => onUserSelect(user)}
        >
          <div className="flex justify-between items-center">
            <div>
              <div>{user.name ?? 'Unnamed User'}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
            {user.banned && (
              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">Banned</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default UserList;