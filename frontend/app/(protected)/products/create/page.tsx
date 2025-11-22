'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppDispatch, RootState } from '@/lib/store';
import { createProduct } from '@/lib/features/products/productSlice';
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

const productSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    sku: z.string().min(1, 'SKU is required'),
    category: z.string().min(1, 'Category is required'),
    unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
    reorderingRule: z.object({
        minimumQuantity: z.coerce.number().min(0),
        maximumQuantity: z.coerce.number().min(0),
    }).optional(),
    isActive: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function CreateProductPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { isOperationLoading } = useSelector((state: RootState) => state.products);
    const { categories } = useSelector((state: RootState) => state.categories);

    useEffect(() => {
        dispatch(getCategories());
    }, [dispatch]);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            sku: '',
            category: '',
            unitOfMeasure: 'Units',
            reorderingRule: {
                minimumQuantity: 0,
                maximumQuantity: 0,
            },
            isActive: true,
        },
    });

    const onSubmit = async (data: ProductFormValues) => {
        try {
            const resultAction = await dispatch(createProduct(data));
            if (createProduct.fulfilled.match(resultAction)) {
                toast.success('Product created successfully');
                router.push('/products');
            } else {
                toast.error(resultAction.payload as string || 'Failed to create product');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        }
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create Product</h1>
                    <p className="text-sm text-slate-500">Add a new item to your inventory.</p>
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
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            Create Product
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
