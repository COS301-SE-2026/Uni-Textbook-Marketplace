import { Badge } from "../ui";

export interface AuditLogEntry {
    id: string;
    entity_type: string;
    entity_id: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'SOLD' | 'WITHDRAWN' | 'APPROVE_LISTING' | 'REJECT_LISTING';
    performedBy: { id: string; email: string; first_name: string; last_name:string} | null
    performed_at: string;
    notes: string;
    reason: string | null;
}

interface AuditLogTableProps {
    logs: AuditLogEntry[];
    loading?: boolean;
}

export default function AuditLogTable({logs, loading} : AuditLogTableProps){

    if (loading) {
        return <div className="text-grey-500 text-sm py-8 text-center">Loading logs ...</div>
    }

    if(logs.length === 0){

        return (
            <div className="text-grey-500 text-sm py-8 text-center"> 
                No audit logs found
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed min-w-200">
                <thead>
                    <tr className="text-left border-b">
                        <th className="py-2 w-32 whitespace-normal wrape-words">Date</th>
                        <th className="py-2 w-28 whitespace-normal wrape-words">Action</th>
                        <th className="py-2 w-24 whitespace-normal wrape-words">Entity</th>
                        <th className="py-2 w-40 whitespace-normal wrape-words">Performed by</th>
                        <th className="py-2 whitespace-normal wrape-words">Notes</th>
                        <th className="py-2 whitespace-normal wrape-words">Reason</th>
                    </tr>
                </thead>

                <tbody>
                    {logs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-gray-100 ">
                            <td className="p-2 mx-8">{new Date(log.performed_at).toLocaleString('en-ZA',{
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}</td>
                            <td className="p-2 mx-8">
                                {   
                                    log.action === 'APPROVE_LISTING' 
                                    ? <Badge variant="approved">{formatAction(log.action)}</Badge>
                                    
                                    : <Badge variant="rejected">{formatAction(log.action)}</Badge>
                                    
                                }
                            </td>
                            <td className="p-2 mx-8">{log.entity_type}</td>
                            <td className="p-2 mx-8">
                                <div className="font-medium">
                                    {log.performedBy?.first_name} {log.performedBy?.last_name}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {log.performedBy?.email}
                                </div>
                            </td>
                            <td className="p-2 mx-8 max-w-xs whitespace-normal wrape-words">{log.notes}</td>
                            <td className="p-2 mx-8 max-w-xs whitespace-normal wrape-words">{log.reason?? 'Meets all requirements '}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    function formatAction( action: string) {
        return action.replace(/_/g, ' ').toLocaleLowerCase();
    }
}