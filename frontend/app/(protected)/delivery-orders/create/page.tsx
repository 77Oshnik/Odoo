"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const productSchema = z.object({
    product: z.string().min(1, "Product is required"),
    quantityOrdered: z.number().min(1, "Quantity must be at least 1"),
});

const createOrderSchema = z.object({
    customer: z.string().optional(),
    warehouse: z.string().min(1, "Warehouse is required"),
    deliveryDate: z.string().optional(),
    notes: z.string().optional(),
    products: z.array(productSchema).min(1, "At least one product is required"),
});

type CreateOrderFormValues = z.infer<typeof createOrderSchema>;

export default function CreateDeliveryOrderPage() {
    const router = useRouter();
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CreateOrderFormValues>({
        resolver: zodResolver(createOrderSchema),
        defaultValues: {
            products: [{ product: "", quantityOrdered: 1 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "products",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [warehousesRes, productsRes] = await Promise.all([
                    api.get("/warehouses"),
                    api.get("/products"),
                ]);

                // Handle direct array response or { success: true, data: [...] }
                if (Array.isArray(warehousesRes.data)) {
                    setWarehouses(warehousesRes.data);
                } else if (warehousesRes.data.success && Array.isArray(warehousesRes.data.data)) {
                    setWarehouses(warehousesRes.data.data);
                }

                if (Array.isArray(productsRes.data)) {
                    setProducts(productsRes.data);
                } else if (productsRes.data.success && Array.isArray(productsRes.data.data)) {
                    setProducts(productsRes.data.data);
                }

            } catch (error) {
                toast.error("Failed to load form data");
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (data: CreateOrderFormValues) => {
        try {
            setLoading(true);
            const response = await api.post("/delivery-orders", data);
            if (response.data.success) {
                toast.success("Delivery order created successfully");
                router.push("/delivery-orders");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create order");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/delivery-orders">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Delivery Order</h1>
                    <p className="text-muted-foreground mt-1">Create a new outbound delivery</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="customer">Customer Name</Label>
                                <Input
                                    id="customer"
                                    {...register("customer")}
                                    placeholder="Enter customer name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="warehouse">Warehouse</Label>
                                <Select onValueChange={(value) => setValue("warehouse", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select warehouse" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map((w) => (
                                            <SelectItem key={w.id || w._id} value={w.id || w._id}>
                                                {w.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.warehouse && (
                                    <p className="text-sm text-red-500">{errors.warehouse.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deliveryDate">Delivery Date</Label>
                                <Input
                                    id="deliveryDate"
                                    type="date"
                                    {...register("deliveryDate")}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                {...register("notes")}
                                className="min-h-[100px]"
                                placeholder="Add any additional notes..."
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Products</CardTitle>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ product: "", quantityOrdered: 1 })}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-4 items-start">
                                <div className="flex-1 space-y-2">
                                    <Label>Product</Label>
                                    <Select onValueChange={(value) => setValue(`products.${index}.product`, value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map((p) => (
                                                <SelectItem key={p.id || p._id} value={p.id || p._id}>
                                                    {p.name} ({p.sku})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.products?.[index]?.product && (
                                        <p className="text-sm text-red-500">{errors.products[index]?.product?.message}</p>
                                    )}
                                </div>
                                <div className="w-32 space-y-2">
                                    <Label>Quantity</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        {...register(`products.${index}.quantityOrdered`, { valueAsNumber: true })}
                                    />
                                    {errors.products?.[index]?.quantityOrdered && (
                                        <p className="text-sm text-red-500">{errors.products[index]?.quantityOrdered?.message}</p>
                                    )}
                                </div>
                                <div className="pt-8">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => remove(index)}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                        disabled={fields.length === 1}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Link href="/delivery-orders">
                        <Button variant="outline" type="button">
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            "Creating..."
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Create Order
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
