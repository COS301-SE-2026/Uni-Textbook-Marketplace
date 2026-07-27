// import { SetMetadata } from '@nestjs/common';

// export const AUDIT_ENTITY_TYPE = 'entityType';
// export const AUDIT_ACTION = 'action';

// export const AuditLog = (entityType: string, action: string) => {
//   return (target: object, key: string, descriptor: PropertyDescriptor) => {
//     SetMetadata(AUDIT_ENTITY_TYPE, entityType)(target, key, descriptor);
//     SetMetadata(AUDIT_ACTION, action)(target, key, descriptor);
//     return descriptor;
//   };
// };
