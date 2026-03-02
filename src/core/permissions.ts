import { loadRoles } from "@snipet/permission";

export enum Permission {
  CREATE_TENANT = 1 << 0,
  READ_TENANT = 1 << 1,
  UPDATE_TENANT = 1 << 2,
  DELETE_TENANT = 1 << 3,

  CREATE_MEMBER = 1 << 4,
  READ_MEMBER = 1 << 5,
  UPDATE_MEMBER = 1 << 6,
  DELETE_MEMBER = 1 << 7,
  
  CREATE_INVITE = 1 << 8,
  READ_INVITE = 1 << 9,
  UPDATE_INVITE = 1 << 10,
  DELETE_INVITE = 1 << 11,

  CREATE_ROLE = 1 << 12,
  READ_ROLE = 1 << 13,
  UPDATE_ROLE = 1 << 14,
  DELETE_ROLE = 1 << 15,
}

export const allPermissions = Object.values(Permission) as Permission[];

const { can, mergePermissions, numberToPermissions, permissionsToNumber, roles } = loadRoles([
  {
    key: "tenant_admin",
    name: "Tenant Admin",
    scope: "tenant",
    permissions: allPermissions,
  },
  {
    key: "tenant_member",
    name: "Tenant Member",
    scope: "tenant",
    permissions: [
      Permission.READ_TENANT,
      Permission.READ_MEMBER,
      Permission.READ_INVITE,
    ],
  },
  {
    key: "tenant_viewer",
    name: "Tenant Viewer",
    scope: "tenant",
    permissions: [
      Permission.READ_TENANT,
    ],
  },
  {
    key: "global_admin",
    name: "Global Admin",
    scope: "global",
    permissions: allPermissions,
  },
]);

export {
  can,
  mergePermissions,
  numberToPermissions,
  permissionsToNumber,
  roles
};

