'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Loader2, Package, AlertTriangle } from 'lucide-react';
import { AppDispatch, RootState } from '@/lib/store';
import { getProduct } from '@/lib/features/products/productSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { currentProduct, isLoading } = useSelector((state: RootState) => state.products);

    useEffect(() => {
        dispatch(getProduct(params.id));
    }, [dispatch, params.id]);

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!currentProduct) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-4">
                <p className="text-lg text-slate-500">Product not found.</p>
                <Button variant="outline" onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{currentProduct.name}</h1>
                        <p className="text-sm text-slate-500">SKU: {currentProduct.sku}</p>
                    </div>
                </div>
                <Link href={`/products/${currentProduct.id}/edit`}>
                    <Button>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Product
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-6 md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Category</p>
                                    <p className="text-sm text-slate-900">
                                        {typeof currentProduct.category === 'object'
                                            ? (currentProduct.category as any).name
                                            : 'Unknown'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Unit of Measure</p>
                                    <p className="text-sm text-slate-900">{currentProduct.unitOfMeasure}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Status</p>
                                    <Badge variant={currentProduct.isActive ? 'default' : 'secondary'} className="mt-1">
                                        {currentProduct.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Total Stock</p>
                                    <p className="text-lg font-bold text-slate-900">
                                        {currentProduct.totalStock} {currentProduct.unitOfMeasure}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Stock by Location</CardTitle>
                            <CardDescription>Current inventory levels across all warehouses.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Warehouse</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentProduct.stockByLocation && currentProduct.stockByLocation.length > 0 ? (
                                        currentProduct.stockByLocation.map((stock: any, index: number) => (
                                            <TableRow key={index}>
                                                <TableCell>{stock.warehouse?.name || 'Unknown Warehouse'}</TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {stock.quantity} {currentProduct.unitOfMeasure}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center text-slate-500">
                                                No stock recorded in any warehouse.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Reordering Rules</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {currentProduct.reorderingRule ? (
                                <>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Minimum Quantity</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-lg font-bold text-slate-900">
                                                {currentProduct.reorderingRule.minimumQuantity}
                                            </p>
                                            {currentProduct.totalStock <= currentProduct.reorderingRule.minimumQuantity && (
                                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                            )}
                                        </div>
                                    </div>
                                    <Separator />
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Maximum Quantity</p>
                                        <p className="text-lg font-bold text-slate-900">
                                            {currentProduct.reorderingRule.maximumQuantity}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-slate-500">No reordering rules configured.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
