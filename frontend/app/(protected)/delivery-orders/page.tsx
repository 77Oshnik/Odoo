"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, MoreHorizontal, Truck, Package, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    products: any[];
    createdAt: string;
}

export default function DeliveryOrderPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<DeliveryOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get("/delivery-orders");
            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch delivery orders");
        } finally {
            setLoading(false);
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft': return <Package className="w-4 h-4 mr-1" />;
            case 'waiting': return <Clock className="w-4 h-4 mr-1" />;
            case 'ready': return <Truck className="w-4 h-4 mr-1" />;
            case 'done': return <CheckCircle className="w-4 h-4 mr-1" />;
            case 'canceled': return <XCircle className="w-4 h-4 mr-1" />;
            default: return null;
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Delivery Orders</h1>
                    <p className="text-muted-foreground mt-1">Manage your outbound deliveries</p>
                </div>
                <Link href="/delivery-orders/create">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Order
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search orders..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="waiting">Waiting</SelectItem>
                                    <SelectItem value="ready">Ready</SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                    <SelectItem value="canceled">Canceled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order #</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Warehouse</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            Loading orders...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No orders found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <TableRow key={order._id}>
                                            <TableCell className="font-medium">{order.deliveryNumber}</TableCell>
                                            <TableCell>{order.customer || "-"}</TableCell>
                                            <TableCell>{order.warehouse?.name}</TableCell>
                                            <TableCell>
                                                {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "-"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`${getStatusColor(order.status)} border flex w-fit items-center`}>
                                                    {getStatusIcon(order.status)}
                                                    <span className="capitalize">{order.status}</span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={() => router.push(`/delivery-orders/${order._id}`)}
                                                        >
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="cursor-pointer text-red-600 focus:text-red-600"
                                                            onClick={() => {
                                                                // Handle delete
                                                            }}
                                                        >
                                                            Delete Order
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
