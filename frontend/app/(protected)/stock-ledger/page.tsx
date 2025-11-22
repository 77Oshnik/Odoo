'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import api from '@/lib/axios';
import { Badge } from '@/components/ui/badge';

const transactionTypeOptions = [
  { value: 'receipt', label: 'Receipt' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'transfer_in', label: 'Transfer In' },
  { value: 'transfer_out', label: 'Transfer Out' },
  { value: 'adjustment', label: 'Adjustment' }
];

const pageSizeOptions = [
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 100, label: '100' }
];

type WarehouseLocation = {
  id?: string;
  name?: string;
  code?: string;
};

type WarehouseOption = {
  id: string;
  name: string;
  location?: WarehouseLocation | null;
};

type ProductOption = {
  id: string;
  name: string;
  sku?: string;
};

type MoveHistoryRecord = {
  id: string;
  product: {
    id?: string;
    name?: string;
    sku?: string;
    unitOfMeasure?: string;
  } | null;
  warehouse: {
    id?: string;
    name?: string;
    location?: WarehouseLocation | null;
  } | null;
  transactionType: string;
  quantityChange: number;
  balanceAfter: number;
  referenceDocument?: {
    documentType?: string;
    documentNumber?: string;
  } | null;
  performedBy?: {
    id?: string;
    name?: string;
    email?: string;
  } | null;
  notes?: string;
  createdAt: string;
};

type MoveHistoryApiRecord = {
  _id: string;
  product?: {
    _id?: string;
    name?: string;
    sku?: string;
    unitOfMeasure?: string;
  } | null;
  warehouse?: {
    _id?: string;
    name?: string;
    location?: WarehouseLocation | null;
  } | null;
  transactionType: string;
  quantityChange: number;
  balanceAfter: number;
  referenceDocument?: MoveHistoryRecord['referenceDocument'];
  performedBy?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;
  notes?: string;
  createdAt: string;
};

type MoveHistoryResponse = {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: MoveHistoryApiRecord[];
};

const formatTransactionType = (type: string) => {
  const option = transactionTypeOptions.find((item) => item.value === type);
  if (option) {
    return option.label;
  }
  return type
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const formatDocumentType = (type?: string) => {
  if (!type) {
    return '';
  }

  const normalized = type.toLowerCase();
  const knownMatch = transactionTypeOptions.find((option) => option.value === normalized);
  if (knownMatch) {
    return knownMatch.label;
  }

  return type
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDateTime = (value: string) => {
  if (!value) {
    return '—';
  }
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  } catch (_error) {
    return value;
  }
};

const initialFilters = {
  product: '',
  warehouse: '',
  transactionType: '',
  startDate: '',
  endDate: ''
};

const StockLedgerPage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [moveHistory, setMoveHistory] = useState<MoveHistoryRecord[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(25);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFiltersData = useCallback(async () => {
    try {
      const [productResponse, warehouseResponse] = await Promise.all([
        api.get<ProductOption[]>('/products'),
        api.get<WarehouseOption[]>('/warehouses')
      ]);
      setProducts(productResponse.data);
      setWarehouses(warehouseResponse.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load filter options');
    }
  }, []);

  const fetchMoveHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string | number> = {
        limit,
        page
      };

      if (filters.product) params.product = filters.product;
      if (filters.warehouse) params.warehouse = filters.warehouse;
      if (filters.transactionType) params.transactionType = filters.transactionType;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await api.get<MoveHistoryResponse>('/move-history', { params });

      const formattedRecords: MoveHistoryRecord[] = response.data.data.map((record) => {
        const location = record.warehouse?.location as (WarehouseLocation & { _id?: string }) | null;

        return {
          id: record._id,
          product: record.product
            ? {
                id: record.product._id,
                name: record.product.name,
                sku: record.product.sku,
                unitOfMeasure: record.product.unitOfMeasure
              }
            : null,
          warehouse: record.warehouse
            ? {
                id: record.warehouse._id,
                name: record.warehouse.name,
                location: location
                  ? {
                      id: location._id,
                      name: location.name,
                      code: location.code
                    }
                  : null
              }
            : null,
          transactionType: record.transactionType,
          quantityChange: record.quantityChange,
          balanceAfter: record.balanceAfter,
          referenceDocument: record.referenceDocument ?? undefined,
          performedBy: record.performedBy
            ? {
                id: record.performedBy._id,
                name: record.performedBy.name,
                email: record.performedBy.email
              }
            : undefined,
          notes: record.notes,
          createdAt: record.createdAt
        };
      });

      setMoveHistory(formattedRecords);
      setPages(response.data.pages || 1);
      setTotal(response.data.total || 0);
      setPage(response.data.page || 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load move history');
    } finally {
      setIsLoading(false);
    }
  }, [filters.product, filters.warehouse, filters.transactionType, filters.startDate, filters.endDate, limit, page]);

  useEffect(() => {
    fetchFiltersData();
  }, [fetchFiltersData]);

  useEffect(() => {
    fetchMoveHistory();
  }, [fetchMoveHistory]);

  const handleFilterChange = (field: keyof typeof initialFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setPage(1);
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const canGoPrev = page > 1;
  const canGoNext = page < pages;

  const emptyState = useMemo(() => !isLoading && moveHistory.length === 0, [isLoading, moveHistory.length]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Move History</h1>
          <p className="text-sm text-slate-600">
            Review stock movements across warehouses with full traceability.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine results by product, warehouse, transaction type, or dates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select
                value={filters.product || 'all'}
                onValueChange={(value) => handleFilterChange('product', value === 'all' ? '' : value)}
              >
                <SelectTrigger className="w-full justify-between">
                  <SelectValue placeholder="All products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All products</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}{product.sku ? ` (${product.sku})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Warehouse</Label>
              <Select
                value={filters.warehouse || 'all'}
                onValueChange={(value) => handleFilterChange('warehouse', value === 'all' ? '' : value)}
              >
                <SelectTrigger className="w-full justify-between">
                  <SelectValue placeholder="All warehouses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All warehouses</SelectItem>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                      {warehouse.location?.name ? ` • ${warehouse.location.name}` : ''}
                      {warehouse.location?.code ? ` (${warehouse.location.code})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select
                value={filters.transactionType || 'all'}
                onValueChange={(value) => handleFilterChange('transactionType', value === 'all' ? '' : value)}
              >
                <SelectTrigger className="w-full justify-between">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {transactionTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(event) => handleFilterChange('startDate', event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(event) => handleFilterChange('endDate', event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Rows per page</Label>
              <Select value={String(limit)} onValueChange={(value) => handleLimitChange(Number(value))}>
                <SelectTrigger className="w-[100px] justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={handleResetFilters} disabled={isLoading}>
              Reset filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movement History</CardTitle>
          <CardDescription>
            {total ? `${total.toLocaleString()} movements found.` : 'Review all recorded stock movements.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading move history…</p>
          ) : emptyState ? (
            <p className="text-sm text-slate-500">No move history records match your filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Performed By</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moveHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDateTime(record.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{record.product?.name || 'Unknown product'}</span>
                          {record.product?.sku && (
                            <span className="text-xs text-slate-500">SKU: {record.product.sku}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{record.warehouse?.name || 'Unknown warehouse'}</span>
                          {record.warehouse?.location && (
                            <span className="text-xs text-slate-500">
                              {record.warehouse.location.name || 'Unnamed location'}
                              {record.warehouse.location.code ? ` (${record.warehouse.location.code})` : ''}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{formatTransactionType(record.transactionType)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={record.quantityChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {record.quantityChange >= 0 ? '+' : ''}
                          {record.quantityChange.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{record.balanceAfter.toLocaleString()}</TableCell>
                      <TableCell>
                        {record.referenceDocument?.documentNumber ? (
                          <div className="flex flex-col">
                            <span>{record.referenceDocument.documentNumber}</span>
                            {record.referenceDocument.documentType && (
                              <span className="text-xs text-slate-500">
                                {formatDocumentType(record.referenceDocument.documentType)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.performedBy?.name || record.performedBy?.email || 'System'}
                        {record.performedBy?.email && record.performedBy.name && (
                          <span className="block text-xs text-slate-500">{record.performedBy.email}</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate">
                        {record.notes || <span className="text-slate-400">—</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-500">
              Page {page} of {pages} • {total.toLocaleString()} total records
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={!canGoPrev || isLoading}>
                Previous
              </Button>
              <Button variant="outline" onClick={() => setPage((prev) => Math.min(prev + 1, pages))} disabled={!canGoNext || isLoading}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockLedgerPage;
