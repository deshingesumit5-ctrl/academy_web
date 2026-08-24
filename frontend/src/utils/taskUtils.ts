import type { User } from '../auth/AuthContext';

export const isUserAdmin = (user: User | null, isSuperAdminFn?: () => boolean): boolean => {
  if (!user) return false;
  if (isSuperAdminFn && isSuperAdminFn()) return true;
  const roleUpper = (user.role || '').toUpperCase().trim();
  return (
    roleUpper === 'SUPER ADMIN' ||
    roleUpper === 'SUPER_ADMIN' ||
    roleUpper === 'ADMIN' ||
    roleUpper === 'SYSTEM ADMIN' ||
    roleUpper === 'SYSTEM_ADMIN'
  );
};

export const isTaskAssignedToUser = (task: any, user: User | null): boolean => {
  if (!user || !task || !task.assignedTo) return false;
  const assigned = task.assignedTo.trim().toLowerCase();
  if (!assigned) return false;

  const fullName = (user.fullName || '').trim().toLowerCase();
  const username = (user.username || '').trim().toLowerCase();
  const userRole = (user.role || '').trim().toLowerCase();

  const assignees = assigned.split(',').map((s: string) => s.trim());

  return assignees.some((a: string) => {
    if (!a) return false;
    if (fullName && (a === fullName || a.includes(fullName) || fullName.includes(a))) return true;
    if (username && (a === username || a.includes(username))) return true;
    if (userRole && a === userRole) return true;
    return false;
  });
};
