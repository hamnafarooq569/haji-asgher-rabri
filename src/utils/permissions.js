export function hasPermission(permissions = [], requiredPermission) {
  if (!requiredPermission) return true;
  return permissions.includes(requiredPermission);
}

export function hasAnyPermission(permissions = [], requiredPermissions = []) {
  if (!requiredPermissions.length) return true;
  return requiredPermissions.some((permission) => permissions.includes(permission));
}