'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppDispatch, RootState } from '@/lib/store';
import { getProduct, updateProduct } from '@/lib/features/products/productSlice';
import { getCategories } from '@/lib/features/categories/categorySlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';

import { productSchema } from "@/schemas"
import type { ProductFormValues } from "@/types"

export default function EditProductPage({ params }: { params: { id: string } }) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { currentProduct, isLoading, isOperationLoading } = useSelector((state: RootState) => state.products);
    const { categories } = useSelector((state: RootState) => state.categories);

    useEffect(() => {
        dispatch(getProduct(params.id));
        dispatch(getCategories());
    }, [dispatch, params.id]);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            sku: '',
            category: '',
            unitOfMeasure: '',
            reorderingRule: {
                minimumQuantity: 0,
                maximumQuantity: 0,
            },
            isActive: true,
        },
    });

    useEffect(() => {
        if (currentProduct) {
            form.reset({
                name: currentProduct.name,
                sku: currentProduct.sku,
                category: typeof currentProduct.category === 'object' ? (currentProduct.category as any).id : currentProduct.category,
                unitOfMeasure: currentProduct.unitOfMeasure,
                reorderingRule: {
                    minimumQuantity: currentProduct.reorderingRule?.minimumQuantity || 0,
                    maximumQuantity: currentProduct.reorderingRule?.maximumQuantity || 0,
                },
                isActive: currentProduct.isActive,
            });
        }
    }, [currentProduct, form]);

    const onSubmit = async (data: ProductFormValues) => {
        try {
            const resultAction = await dispatch(updateProduct({ id: params.id, data }));
            if (updateProduct.fulfilled.match(resultAction)) {
                toast.success('Product updated successfully');
                router.push('/products');
            } else {
                toast.error(resultAction.payload as string || 'Failed to update product');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Product</h1>
                    <p className="text-sm text-slate-500">Update product details.</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Details</CardTitle>
                            <CardDescription>Basic information about the product.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Name <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Wireless Mouse" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid gap-6 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="sku"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SKU <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. WM-001" {...field} />
                                            </FormControl>
                                            <FormDescription>Unique Stock Keeping Unit.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="unitOfMeasure"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit of Measure <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Units, kg, m" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Active Status</FormLabel>
                                            <FormDescription>
                                                Inactive products are hidden from selection.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Rules</CardTitle>
                            <CardDescription>Configure reordering rules for this product.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="reorderingRule.minimumQuantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Minimum Quantity</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" {...field} />
                                        </FormControl>
                                        <FormDescription>Trigger reorder when stock falls below.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="reorderingRule.maximumQuantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Maximum Quantity</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" {...field} />
                                        </FormControl>
                                        <FormDescription>Target stock level after reorder.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isOperationLoading}>
                            {isOperationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
