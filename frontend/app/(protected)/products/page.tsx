'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, Pencil, Trash2, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { AppDispatch, RootState } from '@/lib/store';
import { getProducts, deleteProduct } from '@/lib/features/products/productSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { products, isLoading, isOperationLoading } = useSelector(
        (state: RootState) => state.products
    );

    const [searchTerm, setSearchTerm] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(getProducts());
    }, [dispatch]);

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async () => {
        if (!deleteId) return;
        const resultAction = await dispatch(deleteProduct(deleteId));
        if (deleteProduct.fulfilled.match(resultAction)) {
            toast.success('Product deleted successfully');
            setDeleteId(null);
        } else {
            toast.error(resultAction.payload as string || 'Failed to delete product');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Products</h1>
                    <p className="text-sm text-slate-500">
                        Manage your product inventory and details.
                    </p>
                </div>
                <Link href="/products/create">
                    <Button className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Product
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>All Products</CardTitle>
                    <CardDescription>
                        View and manage your product catalog.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search products or SKU..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-8" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredProducts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No products found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <TableRow
                                            key={product.id}
                                            className="cursor-pointer hover:bg-slate-50"
                                            onClick={() => router.push(`/products/${product.id}`)}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center">
                                                    <Package className="mr-2 h-4 w-4 text-slate-400" />
                                                    {product.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-500">{product.sku}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {product.totalStock} {product.unitOfMeasure}
                                                    {product.reorderingRule && product.totalStock <= product.reorderingRule.minimumQuantity && (
                                                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={product.isActive ? 'default' : 'secondary'}>
                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                    >
                                                        <Link href={`/products/${product.id}/edit`}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                                        onClick={() => setDeleteId(product.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the product.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isOperationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
