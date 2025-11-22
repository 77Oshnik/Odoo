"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, AlertCircle, Box } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface ProductItem {
    product: {
        _id: string;
        name: string;
        sku: string;
        unitOfMeasure: string;
    };
    quantityOrdered: number;
    quantityPicked: number;
    quantityPacked: number;
}

interface DeliveryOrder {
    _id: string;
    deliveryNumber: string;
    customer: string;
    warehouse: {
        _id: string;
        name: string;
    };
    status: 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';
    deliveryDate: string;
    products: ProductItem[];
    notes: string;
    createdAt: string;
}

export default function DeliveryOrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<DeliveryOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Action states
    const [pickQuantities, setPickQuantities] = useState<Record<string, number>>({});
    const [packQuantities, setPackQuantities] = useState<Record<string, number>>({});
    const [isPickOpen, setIsPickOpen] = useState(false);
    const [isPackOpen, setIsPackOpen] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/delivery-orders/${id}`);
            if (response.data.success) {
                setOrder(response.data.data);
                // Initialize quantities
                const initialPick: Record<string, number> = {};
                const initialPack: Record<string, number> = {};
                response.data.data.products.forEach((p: ProductItem) => {
                    initialPick[p.product._id] = p.quantityOrdered - p.quantityPicked;
                    initialPack[p.product._id] = p.quantityPicked - p.quantityPacked;
                });
                setPickQuantities(initialPick);
                setPackQuantities(initialPack);
            }
        } catch (error) {
            toast.error("Failed to fetch order details");
            router.push("/delivery-orders");
        } finally {
            setLoading(false);
        }
    };

    const handlePick = async () => {
        try {
            setActionLoading(true);
            const productsToPick = Object.entries(pickQuantities)
                .filter(([_, qty]) => qty > 0)
                .map(([productId, qty]) => {
                    const currentProduct = order?.products.find(p => p.product._id === productId);
                    const currentPicked = currentProduct?.quantityPicked || 0;
                    return {
                        product: productId,
                        quantityPicked: currentPicked + qty
                    };
                });

            const response = await api.post(`/delivery-orders/${id}/pick`, { products: productsToPick });
            if (response.data.success) {
                toast.success("Items picked successfully");
                setOrder(response.data.data);
                setIsPickOpen(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to pick items");
        } finally {
            setActionLoading(false);
        }
    };

    const handlePack = async () => {
        try {
            setActionLoading(true);
            const productsToPack = Object.entries(packQuantities)
                .filter(([_, qty]) => qty > 0)
                .map(([productId, qty]) => {
                    const currentProduct = order?.products.find(p => p.product._id === productId);
                    const currentPacked = currentProduct?.quantityPacked || 0;
                    return {
                        product: productId,
                        quantityPacked: currentPacked + qty
                    };
                });

            const response = await api.post(`/delivery-orders/${id}/pack`, { products: productsToPack });
            if (response.data.success) {
                toast.success("Items packed successfully");
                setOrder(response.data.data);
                setIsPackOpen(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to pack items");
        } finally {
            setActionLoading(false);
        }
    };

    const handleValidate = async () => {
        try {
            setActionLoading(true);
            const response = await api.post(`/delivery-orders/${id}/validate`);
            if (response.data.success) {
                toast.success("Order validated successfully");
                setOrder(response.data.data);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to validate order");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel this order?")) return;
        try {
            setActionLoading(true);
            const response = await api.post(`/delivery-orders/${id}/cancel`);
            if (response.data.success) {
                toast.success("Order canceled successfully");
                setOrder(response.data.data);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to cancel order");
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'ready': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'done': return 'bg-green-100 text-green-800 border-green-200';
            case 'canceled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading || !order) {
        return <div className="flex items-center justify-center p-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/delivery-orders">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">
                                {order.deliveryNumber}
                            </h1>
                            <Badge variant="outline" className={getStatusColor(order.status)}>
                                {order.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">Created on {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {order.status !== 'done' && order.status !== 'canceled' && (
                        <>
                            {(order.status === 'draft' || order.status === 'waiting') && (
                                <Dialog open={isPickOpen} onOpenChange={setIsPickOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-yellow-600 hover:bg-yellow-500 text-white">
                                            <Package className="w-4 h-4 mr-2" />
                                            Pick Items
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Pick Items</DialogTitle>
                                            <DialogDescription>
                                                Enter quantities to pick for each product.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            {order.products.map((p) => {
                                                const remaining = p.quantityOrdered - p.quantityPicked;
                                                if (remaining <= 0) return null;
                                                return (
                                                    <div key={p.product._id} className="flex items-center justify-between gap-4">
                                                        <div className="flex-1">
                                                            <p className="font-medium">{p.product.name}</p>
                                                            <p className="text-sm text-muted-foreground">Ordered: {p.quantityOrdered}, Picked: {p.quantityPicked}</p>
                                                        </div>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max={remaining}
                                                            value={pickQuantities[p.product._id] || 0}
                                                            onChange={(e) => setPickQuantities({ ...pickQuantities, [p.product._id]: parseInt(e.target.value) || 0 })}
                                                            className="w-24"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsPickOpen(false)}>Cancel</Button>
                                            <Button onClick={handlePick} disabled={actionLoading} className="bg-yellow-600 hover:bg-yellow-500 text-white">Confirm Pick</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}

                            {(order.status === 'waiting' || order.status === 'ready') && (
                                <Dialog open={isPackOpen} onOpenChange={setIsPackOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                                            <Box className="w-4 h-4 mr-2" />
                                            Pack Items
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Pack Items</DialogTitle>
                                            <DialogDescription>
                                                Enter quantities to pack for each product.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            {order.products.map((p) => {
                                                const remaining = p.quantityPicked - p.quantityPacked;
                                                if (remaining <= 0) return null;
                                                return (
                                                    <div key={p.product._id} className="flex items-center justify-between gap-4">
                                                        <div className="flex-1">
                                                            <p className="font-medium">{p.product.name}</p>
                                                            <p className="text-sm text-muted-foreground">Picked: {p.quantityPicked}, Packed: {p.quantityPacked}</p>
                                                        </div>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max={remaining}
                                                            value={packQuantities[p.product._id] || 0}
                                                            onChange={(e) => setPackQuantities({ ...packQuantities, [p.product._id]: parseInt(e.target.value) || 0 })}
                                                            className="w-24"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsPackOpen(false)}>Cancel</Button>
                                            <Button onClick={handlePack} disabled={actionLoading} className="bg-blue-600 hover:bg-blue-500 text-white">Confirm Pack</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}

                            {order.status === 'ready' && (
                                <Button onClick={handleValidate} disabled={actionLoading} className="bg-green-600 hover:bg-green-500 text-white">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Validate
                                </Button>
                            )}

                            <Button onClick={handleCancel} disabled={actionLoading} variant="destructive">
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Order Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Ordered</TableHead>
                                    <TableHead className="text-right">Picked</TableHead>
                                    <TableHead className="text-right">Packed</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.products.map((p) => (
                                    <TableRow key={p.product._id}>
                                        <TableCell className="font-medium">
                                            <div>{p.product.name}</div>
                                            <div className="text-sm text-muted-foreground">{p.product.sku}</div>
                                        </TableCell>
                                        <TableCell className="text-right">{p.quantityOrdered}</TableCell>
                                        <TableCell className="text-right text-yellow-600 font-medium">{p.quantityPicked}</TableCell>
                                        <TableCell className="text-right text-blue-600 font-medium">{p.quantityPacked}</TableCell>
                                        <TableCell>
                                            {p.quantityPacked >= p.quantityOrdered ? (
                                                <Badge className="bg-green-100 text-green-800 border-green-200">Fully Packed</Badge>
                                            ) : p.quantityPicked >= p.quantityOrdered ? (
                                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">Picked</Badge>
                                            ) : (
                                                <Badge className="bg-gray-100 text-gray-800 border-gray-200">Pending</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-muted-foreground">Customer Name</Label>
                                <p className="font-medium">{order.customer || "N/A"}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Warehouse</Label>
                                <p className="font-medium">{order.warehouse.name}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Delivery Date</Label>
                                <p className="font-medium">
                                    {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "N/A"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {order.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{order.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
