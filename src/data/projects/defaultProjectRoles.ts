export const ownerPermissions = {
  Members: {view: true, update: true, delete: true},
  Analytics: {view: true},
  Followers: {view: true},
  Invitations: {view: true, create: true, delete: true},
  Applications: {view: true, create: true, update: true, delete: true},
  "Open Positions": {view: true, create: true, update: true, delete: true},
  "Project Details": {view: true, update: true},
  "Roles & Permissions": {view: true, create: true, update: true, delete: true},
} as const;

export const coFounderPermissions = {
  Members: {view: true, update: true, delete: false},
  Analytics: {view: true},
  Followers: {view: true},
  Invitations: {view: true, create: true, delete: true},
  Applications: {view: true, create: true, update: true, delete: true},
  "Open Positions": {view: true, create: true, update: true, delete: true},
  "Project Details": {view: true, update: true},
  "Roles & Permissions": {view: true, create: false, update: false, delete: false},
} as const;

export const memberPermissions = {
  Members: {view: true, update: false, delete: false},
  Analytics: {view: false},
  Followers: {view: true},
  Invitations: {view: true, create: false, delete: false},
  Applications: {view: true, create: true, update: false, delete: false},
  "Open Positions": {view: true, create: false, update: false, delete: false},
  "Project Details": {view: true, update: false},
  "Roles & Permissions": {view: false, create: false, update: false, delete: false},
} as const;

export const createDefaultPermissions = (): Record<string, Record<string, boolean>> => {
  return {
    Members: {view: false, update: false, delete: false},
    Analytics: {view: false},
    Followers: {view: false},
    Invitations: {view: false, create: false, delete: false},
    Applications: {view: false, create: false, update: false, delete: false},
    "Open Positions": {view: false, create: false, update: false, delete: false},
    "Project Details": {view: false, update: false},
    "Roles & Permissions": {view: false, create: false, update: false, delete: false},
  };
};
