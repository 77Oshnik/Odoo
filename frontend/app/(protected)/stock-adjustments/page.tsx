"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, MoreHorizontal, Filter, FileText } from "lucide-react";
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

interface StockAdjustment {
    _id: string;
    adjustmentNumber: string;
    product: {
        _id: string;
        name: string;
        sku: string;
    };
    warehouse: {
        _id: string;
        name: string;
    };
    recordedQuantity: number;
    countedQuantity: number;
    adjustmentQuantity: number;
    reason: string;
    adjustedBy: {
        name: string;
    };
    createdAt: string;
}

export default function StockAdjustmentPage() {
    const router = useRouter();
    const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [reasonFilter, setReasonFilter] = useState("all");

    useEffect(() => {
        fetchAdjustments();
    }, []);

    const fetchAdjustments = async () => {
        try {
            setLoading(true);
            const response = await api.get("/stock-adjustments");
            if (response.data.success) {
                setAdjustments(response.data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch stock adjustments");
        } finally {
            setLoading(false);
        }
    };

    const getReasonColor = (reason: string) => {
        switch (reason) {
            case 'damaged': return 'bg-red-100 text-red-800 border-red-200';
            case 'lost': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'found': return 'bg-green-100 text-green-800 border-green-200';
            case 'expired': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'miscounted': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const filteredAdjustments = adjustments.filter(adj => {
        const matchesSearch =
            adj.adjustmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            adj.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            adj.product.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesReason = reasonFilter === "all" || adj.reason === reasonFilter;
        return matchesSearch && matchesReason;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Stock Adjustments</h1>
                    <p className="text-muted-foreground mt-1">Manage inventory discrepancies and updates</p>
                </div>
                <Link href="/stock-adjustments/create">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Adjustment
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search adjustments..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={reasonFilter} onValueChange={setReasonFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Reasons</SelectItem>
                                    <SelectItem value="damaged">Damaged</SelectItem>
                                    <SelectItem value="lost">Lost</SelectItem>
                                    <SelectItem value="found">Found</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                    <SelectItem value="miscounted">Miscounted</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
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
                                    <TableHead>Ref #</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Warehouse</TableHead>
                                    <TableHead className="text-right">Recorded</TableHead>
                                    <TableHead className="text-right">Counted</TableHead>
                                    <TableHead className="text-right">Diff</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                            Loading adjustments...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredAdjustments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                            No adjustments found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAdjustments.map((adj) => (
                                        <TableRow key={adj._id}>
                                            <TableCell className="font-medium">{adj.adjustmentNumber}</TableCell>
                                            <TableCell>
                                                <div>{adj.product.name}</div>
                                                <div className="text-sm text-muted-foreground">{adj.product.sku}</div>
                                            </TableCell>
                                            <TableCell>{adj.warehouse.name}</TableCell>
                                            <TableCell className="text-right">{adj.recordedQuantity}</TableCell>
                                            <TableCell className="text-right">{adj.countedQuantity}</TableCell>
                                            <TableCell className={`text-right font-medium ${adj.adjustmentQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {adj.adjustmentQuantity > 0 ? '+' : ''}{adj.adjustmentQuantity}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`${getReasonColor(adj.reason)} border capitalize`}>
                                                    {adj.reason}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(adj.createdAt).toLocaleDateString()}
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
