import { Badge } from "../ui";
import { FileText } from 'lucide-react';

export interface AuditLogEntry {
    id: string;
    entity_type: string;
    entity_id: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'SOLD' | 'WITHDRAWN' | 'APPROVE_LISTING' | 'REJECT_LISTING';
    performedBy: { id: string; email: string; first_name: string; last_name: string } | null
    performed_at: string;
    notes: string;
    reason: string | null;
}

interface AuditLogTableProps {
    logs: AuditLogEntry[];
    loading?: boolean;
}
 
export default function AuditLogTable({ logs, loading }: AuditLogTableProps) {

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-[#00B4D8] rounded-full animate-spin mr-3" />
                <span className="text-sm">Loading logs...</span>
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
                <FileText size={40} className="mb-3 opacity-30" />
                <p className="text-sm font-medium">No audit logs found</p>
                <p className="text-xs mt-1">Try adjusting your filters</p>
            </div>
        );
    }

    const getActionBadge = (action: string) => {
        if (action === 'APPROVE_LISTING') {
            return <Badge variant="approved">Approved</Badge>;
        } else if (action === 'REJECT_LISTING') {
            return <Badge variant="rejected">Rejected</Badge>;
        } else if (action === 'CREATE') {
            return <Badge variant="approved">Created</Badge>;
        } else if (action === 'UPDATE') {
            return <Badge variant="pending">Updated</Badge>;
        } else if (action === 'DELETE' || action === 'WITHDRAWN') {
            return <Badge variant="rejected">Deleted</Badge>;
        } else if (action === 'SOLD') {
            return <Badge variant="sold">Sold</Badge>;
        } else {
            return <Badge variant="pending">{formatAction(action)}</Badge>;
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed min-w-[800px]">
                <thead>
                    <tr className="text-left border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50">
                        <th className="py-3 px-4 w-32 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
                        <th className="py-3 px-4 w-28 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Action</th>
                        <th className="py-3 px-4 w-24 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Entity</th>
                        <th className="py-3 px-4 w-40 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Performed by</th>
                        <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Notes</th>
                        <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Reason</th>
                    </tr>
                </thead>

                <tbody>
                    {logs.map((log) => (
                        <tr key={log.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors duration-150">
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300 text-xs">
                                {new Date(log.performed_at).toLocaleString('en-ZA', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </td>
                            <td className="py-3 px-4">
                                {getActionBadge(log.action)}
                            </td>
                            <td className="py-3 px-4">
                                <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                                    {log.entity_type.replace(/_/g, ' ').toLowerCase()}
                                </span>
                            </td>
                            <td className="py-3 px-4">
                                <div className="font-medium text-sm text-[#000f2b] dark:text-white">
                                    {log.performedBy?.first_name} {log.performedBy?.last_name}
                                </div>
                                <div className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[150px]">
                                    {log.performedBy?.email}
                                </div>
                            </td>
                            <td className="py-3 px-4 max-w-xs break-words text-gray-600 dark:text-gray-300 text-sm">{log.notes}</td>
                            <td className="py-3 px-4 max-w-xs break-words text-gray-500 dark:text-gray-400 text-sm">{log.reason ?? 'Meets all requirements'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    function formatAction(action: string) {
        return action.replace(/_/g, ' ').toLowerCase();
    }
}