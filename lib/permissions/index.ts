import { RoleType } from '@/types';

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',
  POS_VIEW: 'pos.view',
  POS_DISCOUNT: 'pos.discount',
  POS_REFUND: 'pos.refund',
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_EDIT: 'products.edit',
  PRODUCTS_DELETE: 'products.delete',
  PRODUCTS_COST_VIEW: 'products.cost_view',
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_ADJUST: 'inventory.adjust',
  INVENTORY_TRANSFER: 'inventory.transfer',
  INVENTORY_OPNAME: 'inventory.opname',
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_MANAGE: 'customers.manage',
  SUPPLIERS_VIEW: 'suppliers.view',
  SUPPLIERS_MANAGE: 'suppliers.manage',
  PURCHASES_VIEW: 'purchases.view',
  PURCHASES_MANAGE: 'purchases.manage',
  SHIFTS_OPEN: 'shifts.open',
  SHIFTS_CLOSE: 'shifts.close',
  SHIFTS_EXPENSES: 'shifts.expenses',
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  EMPLOYEES_VIEW: 'employees.view',
  EMPLOYEES_MANAGE: 'employees.manage',
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_MANAGE: 'settings.manage',
  AUDIT_VIEW: 'audit.view',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_DEFAULT_PERMISSIONS: Record<RoleType, PermissionKey[]> = {
  OWNER: Object.values(PERMISSIONS),
  ADMIN: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.POS_VIEW,
    PERMISSIONS.POS_DISCOUNT,
    PERMISSIONS.POS_REFUND,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_EDIT,
    PERMISSIONS.PRODUCTS_COST_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.INVENTORY_TRANSFER,
    PERMISSIONS.INVENTORY_OPNAME,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_MANAGE,
    PERMISSIONS.SUPPLIERS_VIEW,
    PERMISSIONS.SUPPLIERS_MANAGE,
    PERMISSIONS.PURCHASES_VIEW,
    PERMISSIONS.PURCHASES_MANAGE,
    PERMISSIONS.SHIFTS_OPEN,
    PERMISSIONS.SHIFTS_CLOSE,
    PERMISSIONS.SHIFTS_EXPENSES,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.EMPLOYEES_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.AUDIT_VIEW,
  ],
  CASHIER: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.POS_VIEW,
    PERMISSIONS.POS_DISCOUNT,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_MANAGE,
    PERMISSIONS.SHIFTS_OPEN,
    PERMISSIONS.SHIFTS_CLOSE,
    PERMISSIONS.SHIFTS_EXPENSES,
  ],
  STAFF: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.INVENTORY_OPNAME,
    PERMISSIONS.SUPPLIERS_VIEW,
    PERMISSIONS.PURCHASES_VIEW,
  ],
};

export function hasPermission(
  userRole: RoleType,
  requiredPermission: string,
  userCustomPermissions?: string[]
): boolean {
  if (userRole === 'OWNER') return true;

  if (userCustomPermissions && userCustomPermissions.includes(requiredPermission)) {
    return true;
  }

  const rolePerms = ROLE_DEFAULT_PERMISSIONS[userRole] || [];
  return rolePerms.includes(requiredPermission as PermissionKey);
}
