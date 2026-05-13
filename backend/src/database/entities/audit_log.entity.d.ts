import { User } from './users.entity';
export declare class AuditLog {
    id: string;
    entity_type: string;
    entity_id: string;
    action: string;
    performedBy: User;
    performed_at: Date;
    notes: string;
}
