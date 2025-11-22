'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, FileText, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { AppDispatch, RootState } from '@/lib/store';
import { getReceipts } from '@/lib/features/receipts/receiptSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function ReceiptsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { receipts, isLoading } = useSelector((state: RootState) => state.receipts);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        dispatch(getReceipts());
    }, [dispatch]);

    const filteredReceipts = receipts.filter(receipt => {
        const matchesSearch =
            receipt.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            receipt.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            receipt.warehouse?.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200"><Clock className="mr-1 h-3 w-3" /> Draft</Badge>;
            case 'ready':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200"><AlertCircle className="mr-1 h-3 w-3" /> Ready</Badge>;
            case 'done':
                return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200"><CheckCircle className="mr-1 h-3 w-3" /> Done</Badge>;
            case 'canceled':
                return <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200"><XCircle className="mr-1 h-3 w-3" /> Canceled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Receipts</h1>
                    <p className="text-sm text-slate-500">
                        Manage incoming stock and supplier receipts.
                    </p>
                </div>
                <Link href="/receipts/create">
                    <Button className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Receipt
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>All Receipts</CardTitle>
                    <CardDescription>
                        View and filter your receipt documents.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search receipts, suppliers, or warehouses..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <Filter className="mr-2 h-4 w-4 text-slate-500" />
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="ready">Ready</SelectItem>
                                <SelectItem value="done">Done</SelectItem>
                                <SelectItem value="canceled">Canceled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Receipt #</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Warehouse</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-8" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredReceipts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No receipts found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredReceipts.map((receipt) => (
                                        <TableRow
                                            key={receipt._id}
                                            className="cursor-pointer hover:bg-slate-50"
                                            onClick={() => router.push(`/receipts/${receipt._id}`)}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center">
                                                    <FileText className="mr-2 h-4 w-4 text-slate-400" />
                                                    {receipt.receiptNumber || 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {receipt.createdAt ? format(new Date(receipt.createdAt), 'MMM dd, yyyy') : '-'}
                                            </TableCell>
                                            <TableCell>{receipt.supplier || '-'}</TableCell>
                                            <TableCell>{receipt.warehouse?.name || '-'}</TableCell>
                                            <TableCell>{getStatusBadge(receipt.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                                                    <Link href={`/receipts/${receipt._id}`}>View</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
