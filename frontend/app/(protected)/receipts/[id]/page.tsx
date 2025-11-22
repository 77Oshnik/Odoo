'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertCircle, Calendar, MapPin, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { AppDispatch, RootState } from '@/lib/store';
import { getReceipt, validateReceipt, cancelReceipt, updateReceipt } from '@/lib/features/receipts/receiptSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';

export default function ReceiptDetailsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const params = useParams();
    const { currentReceipt, isLoading, isOperationLoading } = useSelector((state: RootState) => state.receipts);
    const [isValidateDialogOpen, setIsValidateDialogOpen] = useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

    useEffect(() => {
        if (params.id) {
            dispatch(getReceipt(params.id as string));
        }
    }, [dispatch, params.id]);

    const handleValidate = async () => {
        if (!currentReceipt) return;

        try {
            const resultAction = await dispatch(validateReceipt(currentReceipt._id));
            if (validateReceipt.fulfilled.match(resultAction)) {
                toast.success('Receipt validated successfully');
                setIsValidateDialogOpen(false);
            } else {
                toast.error(resultAction.payload as string || 'Failed to validate receipt');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        }
    };

    const handleCancel = async () => {
        if (!currentReceipt) return;

        try {
            const resultAction = await dispatch(cancelReceipt(currentReceipt._id));
            if (cancelReceipt.fulfilled.match(resultAction)) {
                toast.success('Receipt canceled successfully');
                setIsCancelDialogOpen(false);
            } else {
                toast.error(resultAction.payload as string || 'Failed to cancel receipt');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        }
    };

    const handleMarkAsReady = async () => {
        if (!currentReceipt) return;

        try {
            const resultAction = await dispatch(updateReceipt({
                id: currentReceipt._id,
                data: { status: 'ready' }
            }));
            if (updateReceipt.fulfilled.match(resultAction)) {
                toast.success('Receipt marked as ready');
            } else {
                toast.error(resultAction.payload as string || 'Failed to update receipt');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        }
    };

    if (isLoading || !currentReceipt) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <Badge variant="secondary" className="bg-slate-500/20 text-slate-200"><Clock className="mr-1 h-3 w-3" /> Draft</Badge>;
            case 'ready':
                return <Badge variant="secondary" className="bg-blue-500/20 text-blue-200"><AlertCircle className="mr-1 h-3 w-3" /> Ready</Badge>;
            case 'done':
                return <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-200"><CheckCircle className="mr-1 h-3 w-3" /> Done</Badge>;
            case 'canceled':
                return <Badge variant="secondary" className="bg-red-500/20 text-red-200"><XCircle className="mr-1 h-3 w-3" /> Canceled</Badge>;
            default:
                return <Badge variant="outline" className="border-white/20 text-white/60">{status}</Badge>;
        }
    };

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-white">
                                {currentReceipt.receiptNumber}
                            </h1>
                            {getStatusBadge(currentReceipt.status)}
                        </div>
                        <p className="text-sm text-white/60">
                            Created on {format(new Date(currentReceipt.createdAt), 'PPP')}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {currentReceipt.status === 'draft' && (
                        <Button onClick={handleMarkAsReady} disabled={isOperationLoading}>
                            {isOperationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                            Mark as Ready
                        </Button>
                    )}

                    {currentReceipt.status === 'ready' && (
                        <>
                            <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                                        Cancel Receipt
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Cancel Receipt?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. The receipt will be marked as canceled.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Keep Receipt</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
                                            Yes, Cancel
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog open={isValidateDialogOpen} onOpenChange={setIsValidateDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                                        Validate Receipt
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Validate Receipt?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will update stock levels in <strong>{typeof currentReceipt.warehouse === 'object' ? currentReceipt.warehouse.name : 'the selected warehouse'}</strong>. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Not yet</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleValidate} className="bg-emerald-600 hover:bg-emerald-700">
                                            {isOperationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Validate & Update Stock
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Content */}
                <div className="space-y-6 md:col-span-2">
                    <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Products</CardTitle>
                            <CardDescription className="text-white/60">Items included in this receipt.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/10 hover:bg-transparent">
                                        <TableHead className="text-white/70">Product</TableHead>
                                        <TableHead className="text-white/70">SKU</TableHead>
                                        <TableHead className="text-right text-white/70">Quantity</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentReceipt.products.map((item, index) => (
                                        <TableRow key={typeof item.product === 'object' ? item.product._id : index} className="border-white/10">
                                            <TableCell className="font-medium text-white">
                                                {typeof item.product === 'object' ? item.product.name : 'Unknown Product'}
                                            </TableCell>
                                            <TableCell className="text-white/60">
                                                {typeof item.product === 'object' ? item.product.sku : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right text-white">
                                                {item.quantityReceived} {typeof item.product === 'object' ? item.product.unitOfMeasure : 'units'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {currentReceipt.notes && (
                        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white">Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-white/80 whitespace-pre-wrap">{currentReceipt.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-xs font-medium text-white/50 uppercase">Warehouse</p>
                                <div className="mt-1 flex items-start gap-2">
                                    <MapPin className="mt-0.5 h-4 w-4 text-white/40" />
                                    <div>
                                        <p className="font-medium text-white">
                                            {typeof currentReceipt.warehouse === 'object' ? currentReceipt.warehouse.name : 'Unknown Warehouse'}
                                        </p>
                                        <p className="text-xs text-white/60">
                                            {typeof currentReceipt.warehouse === 'object' && currentReceipt.warehouse.location
                                                ? (typeof currentReceipt.warehouse.location === 'object'
                                                    ? currentReceipt.warehouse.location.name
                                                    : currentReceipt.warehouse.location)
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-white/10" />

                            <div>
                                <p className="text-xs font-medium text-white/50 uppercase">Supplier</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <User className="h-4 w-4 text-white/40" />
                                    <p className="font-medium text-white">{currentReceipt.supplier || 'N/A'}</p>
                                </div>
                            </div>

                            <Separator className="bg-white/10" />

                            <div>
                                <p className="text-xs font-medium text-white/50 uppercase">Received Date</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-white/40" />
                                    <p className="font-medium text-white">
                                        {currentReceipt.receivedDate
                                            ? format(new Date(currentReceipt.receivedDate), 'PPP')
                                            : 'Pending'}
                                    </p>
                                </div>
                            </div>

                            {currentReceipt.validatedBy && (
                                <>
                                    <Separator className="bg-white/10" />
                                    <div>
                                        <p className="text-xs font-medium text-white/50 uppercase">Validated By</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                                            <div>
                                                <p className="font-medium text-white">
                                                    {typeof currentReceipt.validatedBy === 'object' ? currentReceipt.validatedBy.name : 'Unknown User'}
                                                </p>
                                                <p className="text-xs text-white/60">
                                                    {currentReceipt.validatedAt && format(new Date(currentReceipt.validatedAt), 'PP p')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
