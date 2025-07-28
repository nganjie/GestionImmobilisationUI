export enum UserRole {
  SUPER_ADMIN = 'SuperAdmin',
  ADMIN = 'Admin',
  VISITOR = 'Visitor'
}

export interface UserPermissions {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  [UserRole.SUPER_ADMIN]: {
    canRead: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canManageUsers: true
  },
  [UserRole.ADMIN]: {
    canRead: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canManageUsers: false
  },
  [UserRole.VISITOR]: {
    canRead: true,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canManageUsers: false
  }
};
