"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const createAdjustmentSchema = z.object({
    warehouse: z.string().min(1, "Warehouse is required"),
    product: z.string().min(1, "Product is required"),
    recordedQuantity: z.number(),
    countedQuantity: z.number({ required_error: "Counted quantity is required" }),
    reason: z.string().min(1, "Reason is required"),
    notes: z.string().optional(),
});

type CreateAdjustmentFormValues = z.infer<typeof createAdjustmentSchema>;

export default function CreateStockAdjustmentPage() {
    const router = useRouter();
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentStock, setCurrentStock] = useState<number | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CreateAdjustmentFormValues>({
        resolver: zodResolver(createAdjustmentSchema),
        defaultValues: {
            reason: "miscounted",
        },
    });

    const selectedWarehouse = watch("warehouse");
    const selectedProduct = watch("product");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [warehousesRes, productsRes] = await Promise.all([
                    api.get("/warehouses"),
                    api.get("/products"),
                ]);

                if (Array.isArray(warehousesRes.data)) {
                    setWarehouses(warehousesRes.data);
                } else if (warehousesRes.data.success) {
                    setWarehouses(warehousesRes.data.data || []);
                }

                if (Array.isArray(productsRes.data)) {
                    setProducts(productsRes.data);
                } else if (productsRes.data.success) {
                    setProducts(productsRes.data.data || []);
                }

            } catch (error) {
                toast.error("Failed to load form data");
            }
        };
        fetchData();
    }, []);

    // Calculate current stock when warehouse or product changes
    useEffect(() => {
        if (selectedWarehouse && selectedProduct) {
            const product = products.find(p => (p.id || p._id) === selectedProduct);
            if (product) {
                const stockLoc = product.stockByLocation?.find(
                    (loc: any) => (loc.warehouse?._id || loc.warehouse) === selectedWarehouse
                );
                const qty = stockLoc ? stockLoc.quantity : 0;
                setCurrentStock(qty);
                setValue("recordedQuantity", qty);
            }
        } else {
            setCurrentStock(null);
            setValue("recordedQuantity", 0);
        }
    }, [selectedWarehouse, selectedProduct, products, setValue]);

    const onSubmit = async (data: CreateAdjustmentFormValues) => {
        try {
            setLoading(true);
            const response = await api.post("/stock-adjustments", data);
            if (response.data.success) {
                toast.success("Stock adjustment created successfully");
                router.push("/stock-adjustments");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create adjustment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/stock-adjustments">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">New Stock Adjustment</h1>
                    <p className="text-muted-foreground mt-1">Record a stock discrepancy</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Adjustment Details</CardTitle>
                        <CardDescription>
                            Select a product and warehouse to see current recorded stock.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <Label htmlFor="product">Product</Label>
                                <Select onValueChange={(value) => setValue("product", value)}>
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
                                {errors.product && (
                                    <p className="text-sm text-red-500">{errors.product.message}</p>
                                )}
                            </div>
                        </div>

                        {currentStock !== null && (
                            <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Current Stock</AlertTitle>
                                <AlertDescription>
                                    The system records <strong>{currentStock}</strong> units in this warehouse.
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="countedQuantity">Counted Quantity</Label>
                                <Input
                                    id="countedQuantity"
                                    type="number"
                                    min="0"
                                    {...register("countedQuantity", { valueAsNumber: true })}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter the actual physical quantity found.
                                </p>
                                {errors.countedQuantity && (
                                    <p className="text-sm text-red-500">{errors.countedQuantity.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason</Label>
                                <Select onValueChange={(value) => setValue("reason", value)} defaultValue="miscounted">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select reason" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="miscounted">Miscounted</SelectItem>
                                        <SelectItem value="damaged">Damaged</SelectItem>
                                        <SelectItem value="lost">Lost</SelectItem>
                                        <SelectItem value="found">Found</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.reason && (
                                    <p className="text-sm text-red-500">{errors.reason.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                {...register("notes")}
                                className="min-h-[100px]"
                                placeholder="Add any additional details about this adjustment..."
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Link href="/stock-adjustments">
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={loading || currentStock === null}
                            >
                                {loading ? (
                                    "Creating..."
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Create Adjustment
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
