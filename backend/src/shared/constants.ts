export const NOTIFICATION_TYPES = {
  PRICE_CHANGE: 'PRICE_CHANGE',
  SOLD: 'SOLD',
  WITHDRAWN: 'WITHDRAWN',
  NEW_MATCH: 'NEW_MATCH',
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export const NOTIFICATION_TYPES_ARRAY = Object.values(NOTIFICATION_TYPES);

export const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  SOLD: 'SOLD',
  WITHDRAWN: 'WITHDRAWN',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export const AUDIT_ACTIONS_ARRAY = Object.values(AUDIT_ACTIONS);

export const ENTITY_TYPES = {
  LISTING: 'Listing',
  USER: 'User',
  REVIEW: 'Review',
  BOOKING: 'Booking',
} as const;

export type EntityType = (typeof ENTITY_TYPES)[keyof typeof ENTITY_TYPES];

export const ENTITY_TYPES_ARRAY = Object.values(ENTITY_TYPES);
