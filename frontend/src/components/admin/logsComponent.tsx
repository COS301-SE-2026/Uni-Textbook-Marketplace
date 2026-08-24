"use client";

import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import { getAuditLog, LogFilter, getadmin, AdminsEmail } from '@/lib/admin.api';
import { useState, useEffect } from 'react'
import AuditLogTable, { AuditLogEntry } from './auditlogTable';
import { ErrorText } from '../ui';
import { FileText } from 'lucide-react';

export default function LogsComponent() {

    const [filters, setFilters] = useState<LogFilter>({ page: 1, limit: 20 });
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
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
        <>
            
            <div className="relative overflow-hidden w-full" style={{
                background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 50%, #d5e0ea 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 20px rgba(0,0,0,0.05)',
            }}>
                <div className="absolute inset-0 opacity-30" style={{
                    background: 'radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.5) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(0,180,216,0.05) 0%, transparent 50%)',
                }} />
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }} />
                <div className="absolute top-0 left-0 right-0 h-px" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                }} />
                
                <div className="relative z-10 px-6 py-8 md:px-8 lg:px-12 max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">


                        <div className="p-3 rounded-2xl" style={{
                            background: 'rgba(0, 180, 216, 0.08)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(0, 180, 216, 0.1)',
                        }}>


                            <FileText size={28} className="text-[#00B4D8]" />
                        </div>


                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[#000f2b] tracking-tight">
                                Audit Logs
                            </h1>
                            <p className="text-gray-500 text-sm md:text-base mt-0.5">
                                Complete history of all admin actions
                            </p>

                        </div>
                    </div>


                </div>
                
                <div className="absolute bottom-0 left-0 right-0 h-px" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(0,180,216,0.15), transparent)',
                }} />
            </div>

            <div className="container-content py-8">
                <Card variant='default'
                    className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 p-6 shadow-sm hover:shadow-md transition-shadow duration-300'
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
                    <Button variant='secondary' disabled={true} className='flex-1 cursor-default opacity-75'>
                        Total Logs: {total}
                    </Button>

                    
                    <Button variant='primary' onClick={() => setFilters({ page: 1, limit: 20 })} className='flex-1 cursor-pointer'>
                        Clear filters
                    </Button>


                </div>

                <Card className='mt-6 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 p-0'>
                    <AuditLogTable
                        logs={logs}
                        loading={loading}
                    />
                </Card>
                
            </div>
        </>
    )
}