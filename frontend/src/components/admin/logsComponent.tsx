"use client";

import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import { getAuditLog, LogFilter, getadmin, AdminsEmail } from '@/lib/admin.api';
import { useState, useEffect } from 'react'
import AuditLogTable, { AuditLogEntry } from './auditlogTable';
import { ErrorText } from '../ui';

export default function LogsComponent() {

    const [filters, setFilters] = useState<LogFilter>({ page: 1, limit: 20 });
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);/* AuditLog */
    const [emails, setEmails] = useState<AdminsEmail[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        async function fetchLogs() {
            setLoading(true);
            setError(null);

            try {

                const results = await getAuditLog(filters);
                setLogs(results.logs);
                setTotal(results.total);
            } catch (error) {
                setError('Failed to fetch logs');
            } finally {
                setLoading(false);
            }
        }
        fetchLogs();
    }, [filters])

    useEffect(() => {
        async function fetchEmails() {
            try {
                const results = await getadmin();
                setEmails(results);
            } catch (error) {
                console.error(error)
            }
        }
        fetchEmails()
    }, [])

    return (
        <div className='container-content py-8'>
            <div>
                <h1>Audit logs</h1>
                <p className='text-grey-500 text-sm'>Logs of all Admins</p>
            </div>

            <Card variant='default'
                className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 p-6'
            >
                <div>
                    <Select
                        label='Action'
                        name='action'
                        value={filters.action ?? ''}
                        onChange={(e) => setFilters(prev => ({
                            ...prev,
                            action: e.target.value || undefined,
                            page: 1,
                        }))}
                    >
                        <option value=''>All</option>
                        <option value='APPROVE_LISTING'>Approved</option>
                        <option value='REJECT_LISTING'>Rejected</option>
                    </Select>
                </div>
                <div className='flex flex-row gap-4'>
                    <Input
                        label='Start Date'
                        type='date'
                        name='startDate'
                        value={filters.startDate ?? ''}
                        onChange={(e) => setFilters(prev => ({
                            ...prev,
                            startDate: e.target.value || undefined,
                            page: 1,
                        }))}
                    />

                    <Input
                        label='End Date'
                        type='date'
                        name='endDate'
                        value={filters.endDate ?? ''}
                        onChange={(e) => setFilters(prev => ({
                            ...prev,
                            endDate: e.target.value || undefined,
                            page: 1,
                        }))}
                    />

                </div>
                <div>
                    <Select
                        label='Performed by'
                        name='performedBy'
                        value={filters.performedBy ?? ''}
                        onChange={(e) => setFilters(prev => ({
                            ...prev,
                            performedBy: e.target.value || undefined,
                            page: 1,
                        }))}
                    >
                        <option value=''>All</option>
                        {emails.map(email => (

                            <option key={email.id} value={email.id}>{email.email}</option>

                        ))}
                    </Select>
                </div>

            </Card>
            {error && (
                <div className='mt-2'><ErrorText>{error}</ErrorText></div>
            )}

            <div className='flex flex-row justify-between mt-4 gap-5'>

                <Button variant='secondary' disabled= {true} className='flex-1'>
                    Total Logs: {total}
                </Button>
                <Button variant='secondary' onClick={() => setFilters({page:1,limit:20})} className='flex-1'>
                    Clear filters
                </Button>
            </div>

            <Card className='mt-6 overflow-hidden'>
                <AuditLogTable
                    logs={logs}
                    loading={loading}
                />
            </Card>
        </div>
    )
}