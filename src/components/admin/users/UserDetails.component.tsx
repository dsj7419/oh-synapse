import React, { useState } from 'react';
import type { Role, User } from '@prisma/client';
import { useRoleManagement } from '@/hooks/useRoleManagement';
import ConfirmationModal from '@/components/common/ConfirmationModal.component';

interface UserWithRoles extends User {
  roles: string[];
}

interface UserDetailsProps {
  user: UserWithRoles;
  roles: Role[];
  currentUser: UserWithRoles;
  onRoleChange: (userId: string, roleId: string, checked: boolean) => void;
  onBanUser: (userId: string) => void;
  onUnbanUser: (userId: string) => void;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user, roles, currentUser, onRoleChange, onBanUser, onUnbanUser }) => {
  const { isRoleDisabled, canBanUser, userHasRole } = useRoleManagement(currentUser); // Removed canManageRole as it's not needed
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  // Handle ban/unban action
  const handleBanUnbanClick = () => {
    setIsConfirmationOpen(true);
  };

  const handleConfirm = () => {
    if (user.banned) {
      onUnbanUser(user.id);
    } else {
      onBanUser(user.id);
    }
    setIsConfirmationOpen(false);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">User Details</h2>
      <p><strong>Name:</strong> {user.name ?? 'Unnamed User'}</p>
      <p><strong>Email:</strong> {user.email}</p>
      {user.banned && <p className="text-red-500 font-bold">BANNED</p>}

      {/* Displaying the roles */}
      <h3 className="text-lg font-semibold mt-4 mb-2">Roles</h3>
      <div className="grid grid-cols-2 gap-2">
        {roles.map((role) => {
          const isChecked = userHasRole(user, role.name); 
          const isDisabled = isRoleDisabled(role, user); 

          return (
            <div key={role.id} className="flex items-center">
              <input
                type="checkbox"
                id={`role-${role.id}`}
                checked={isChecked}
                onChange={(e) => onRoleChange(user.id, role.id, e.target.checked)}
                disabled={isDisabled}
                className="mr-2"
              />
              <label htmlFor={`role-${role.id}`} className={isDisabled ? 'text-gray-400' : ''}>
                {role.name}
              </label>
            </div>
          );
        })}
      </div>

      {/* Ban/Unban User Button */}
      {canBanUser(user) && (
        <button
          className={`mt-4 ${user.banned ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white px-4 py-2 rounded transition-colors`}
          onClick={handleBanUnbanClick}
        >
          {user.banned ? 'Unban User' : 'Ban User'}
        </button>
      )}

      {/* Confirmation Modal for Ban/Unban */}
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleConfirm}
        title={user.banned ? 'Unban User' : 'Ban User'}
        message={`Are you sure you want to ${user.banned ? 'unban' : 'ban'} this user?`}
        confirmText={user.banned ? 'Unban' : 'Ban'}
        confirmColor={user.banned ? 'green' : 'red'}
      />
    </div>
  );
};

export default UserDetails;
