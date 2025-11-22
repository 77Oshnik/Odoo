'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import api from '@/lib/axios';

const warehouseFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.string().min(1, 'Location is required'),
  address: z.string().optional().transform((value) => value ?? ''),
  isActive: z.boolean().default(true)
});

type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;

type Warehouse = {
  id: string;
  name: string;
  location: { id: string; name?: string; code?: string } | string | null;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type LocationOption = {
  id: string;
  name: string;
  code?: string;
};

const defaultValues: WarehouseFormValues = {
  name: '',
  location: '',
  address: '',
  isActive: true
};

const WarehousesPage = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeWarehouse, setActiveWarehouse] = useState<Warehouse | null>(null);

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues
  });

  const resetDialogState = useCallback(() => {
    setIsDialogOpen(false);
    setActiveWarehouse(null);
    form.reset(defaultValues);
  }, [form]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [warehouseResponse, locationResponse] = await Promise.all([
        api.get<Warehouse[]>('/warehouses'),
        api.get<LocationOption[]>('/locations')
      ]);
      setWarehouses(warehouseResponse.data);
      setLocations(locationResponse.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load warehouses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = () => {
    if (locations.length === 0) {
      toast.warning('Create a location before adding a warehouse.');
      return;
    }
    setActiveWarehouse(null);
    form.reset(defaultValues);
    setIsDialogOpen(true);
  };

  const handleEdit = (warehouse: Warehouse) => {
    setActiveWarehouse(warehouse);
    form.reset({
      name: warehouse.name,
      location:
        typeof warehouse.location === 'string'
          ? warehouse.location
          : warehouse.location?.id ?? '',
      address: warehouse.address ?? '',
      isActive: warehouse.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (warehouse: Warehouse) => {
    const confirmed = window.confirm(`Delete warehouse “${warehouse.name}”?`);
    if (!confirmed) {
      return;
    }
    try {
      await api.delete(`/warehouses/${warehouse.id}`);
      toast.success('Warehouse deleted');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete warehouse');
    }
  };

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      if (activeWarehouse) {
        await api.put(`/warehouses/${activeWarehouse.id}`, data);
        toast.success('Warehouse updated');
      } else {
        await api.post('/warehouses', data);
        toast.success('Warehouse created');
      }
      resetDialogState();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save warehouse');
    }
  });

  const dialogTitle = activeWarehouse ? 'Edit Warehouse' : 'New Warehouse';
  const dialogDescription = activeWarehouse
    ? 'Update the warehouse details.'
    : 'Provide details to create a warehouse.';

  const emptyState = useMemo(
    () => !isLoading && warehouses.length === 0,
    [isLoading, warehouses.length]
  );

  const locationOptionsEmpty = locations.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Warehouses</h1>
          <p className="text-sm text-slate-600">Manage physical warehouses under each location.</p>
        </div>
        <Button onClick={handleCreate} disabled={locationOptionsEmpty}>
          Add Warehouse
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Warehouse List</CardTitle>
          <CardDescription>
            Overview of all warehouses configured in the system. Warehouses must be associated with a
            location.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {locationOptionsEmpty && !isLoading && (
            <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-600">
              Create at least one location before adding warehouses.
            </p>
          )}
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading warehouses…</p>
          ) : emptyState ? (
            <p className="text-sm text-slate-500">No warehouses created yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.map((warehouse) => (
                  <TableRow key={warehouse.id}>
                    <TableCell>{warehouse.name}</TableCell>
                    <TableCell>
                      {typeof warehouse.location === 'object'
                        ? warehouse.location?.name || warehouse.location?.code || '—'
                        : warehouse.location || '—'}
                    </TableCell>
                    <TableCell>{warehouse.address || '—'}</TableCell>
                    <TableCell>
                      <span className={warehouse.isActive ? 'text-emerald-600' : 'text-slate-400'}>
                        {warehouse.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(warehouse)}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(warehouse)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => (open ? setIsDialogOpen(true) : resetDialogState())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register('name')} placeholder="Main Warehouse" />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Controller
                name="location"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full justify-between">
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.location && (
                <p className="text-sm text-red-500">{form.formState.errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...form.register('address')} placeholder="Optional address details" />
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label className="text-sm font-medium">Active</Label>
                <p className="text-xs text-slate-500">Toggle to deactivate this warehouse.</p>
              </div>
              <Controller
                name="isActive"
                control={form.control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetDialogState}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WarehousesPage;
