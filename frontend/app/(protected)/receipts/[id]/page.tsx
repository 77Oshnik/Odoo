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
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <Badge variant="secondary" className="bg-slate-100 text-slate-700"><Clock className="mr-1 h-3 w-3" /> Draft</Badge>;
            case 'ready':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-700"><AlertCircle className="mr-1 h-3 w-3" /> Ready</Badge>;
            case 'done':
                return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700"><CheckCircle className="mr-1 h-3 w-3" /> Done</Badge>;
            case 'canceled':
                return <Badge variant="secondary" className="bg-red-100 text-red-700"><XCircle className="mr-1 h-3 w-3" /> Canceled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                {currentReceipt.receiptNumber}
                            </h1>
                            {getStatusBadge(currentReceipt.status)}
                        </div>
                        <p className="text-sm text-slate-500">
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
                                            This will update stock levels in <strong>{currentReceipt.warehouse.name}</strong>. This action cannot be undone.
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Products</CardTitle>
                            <CardDescription>Items included in this receipt.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentReceipt.products.map((item) => (
                                        <TableRow key={item.product._id}>
                                            <TableCell className="font-medium">{item.product.name}</TableCell>
                                            <TableCell className="text-slate-500">{item.product.sku}</TableCell>
                                            <TableCell className="text-right">
                                                {item.quantityReceived} {item.product.unitOfMeasure}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {currentReceipt.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600 whitespace-pre-wrap">{currentReceipt.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Warehouse</p>
                                <div className="mt-1 flex items-start gap-2">
                                    <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                                    <div>
                                        <p className="font-medium">{currentReceipt.warehouse.name}</p>
                                        <p className="text-xs text-slate-500">{currentReceipt.warehouse.location}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Supplier</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <User className="h-4 w-4 text-slate-400" />
                                    <p className="font-medium">{currentReceipt.supplier || 'N/A'}</p>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Received Date</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <p className="font-medium">
                                        {currentReceipt.receivedDate
                                            ? format(new Date(currentReceipt.receivedDate), 'PPP')
                                            : 'Pending'}
                                    </p>
                                </div>
                            </div>

                            {currentReceipt.validatedBy && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase">Validated By</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                                            <div>
                                                <p className="font-medium">{currentReceipt.validatedBy.name}</p>
                                                <p className="text-xs text-slate-500">
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
