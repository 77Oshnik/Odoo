'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppDispatch, RootState } from '@/lib/store';
import { createReceipt } from '@/lib/features/receipts/receiptSlice';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Separator } from '@/components/ui/separator';

// Schema for validation
const receiptSchema = z.object({
    supplier: z.string().optional(),
    warehouse: z.string().min(1, 'Warehouse is required'),
    receivedDate: z.string().optional(),
    notes: z.string().optional(),
    products: z.array(
        z.object({
            product: z.string().min(1, 'Product is required'),
            quantityReceived: z.coerce.number().min(1, 'Quantity must be at least 1'),
            unitPrice: z.coerce.number().optional(),
        })
    ).min(1, 'At least one product is required'),
});

type ReceiptFormValues = z.infer<typeof receiptSchema>;

interface Warehouse {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    sku: string;
    unitOfMeasure: string;
}

export default function CreateReceiptPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { isOperationLoading } = useSelector((state: RootState) => state.receipts);

    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [productsList, setProductsList] = useState<Product[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const form = useForm<ReceiptFormValues>({
        resolver: zodResolver(receiptSchema),
        defaultValues: {
            supplier: '',
            warehouse: '',
            receivedDate: new Date().toISOString().split('T')[0],
            notes: '',
            products: [{ product: '', quantityReceived: 1 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'products',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [warehousesRes, productsRes] = await Promise.all([
                    api.get<Warehouse[]>('/warehouses'),
                    api.get<Product[]>('/products')
                ]);
                setWarehouses(warehousesRes.data || []);
                setProductsList(productsRes.data || []);
            } catch (error) {
                console.error('Failed to fetch data:', error);
                toast.error('Failed to load warehouses or products');
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const onSubmit = async (data: ReceiptFormValues) => {
        try {
            const resultAction = await dispatch(createReceipt(data));
            if (createReceipt.fulfilled.match(resultAction)) {
                toast.success('Receipt created successfully');
                router.push('/receipts');
            } else {
                toast.error(resultAction.payload as string || 'Failed to create receipt');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        }
    };

    if (isLoadingData) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create Receipt</h1>
                    <p className="text-sm text-slate-500">Record a new incoming shipment.</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                            <CardDescription>Basic details about the receipt.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="warehouse"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Destination Warehouse <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select warehouse" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {warehouses.map((w) => (
                                                    <SelectItem key={w.id} value={w.id}>
                                                        {w.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="supplier"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Supplier</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Supplier name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="receivedDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Received Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Products</CardTitle>
                                <CardDescription>Items included in this receipt.</CardDescription>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ product: '', quantityReceived: 1 })}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Product
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-start">
                                    <div className="flex-1 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                                        <FormField
                                            control={form.control}
                                            name={`products.${index}.product`}
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Product</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select product" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {productsList.map((p) => (
                                                                <SelectItem key={p.id} value={p.id}>
                                                                    {p.name} ({p.sku})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`products.${index}.quantityReceived`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Quantity</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="1" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="mt-2 text-red-500 hover:bg-red-50 hover:text-red-600 sm:mt-0"
                                        onClick={() => remove(index)}
                                        disabled={fields.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {form.formState.errors.products && (
                                <p className="text-sm font-medium text-red-500">
                                    {form.formState.errors.products.root?.message}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Add any additional notes here..."
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
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
                            Create Receipt
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
