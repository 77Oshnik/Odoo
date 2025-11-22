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
import { Textarea } from '@/components/ui/textarea';
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

const locationFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional().transform((value) => value ?? ''),
  isActive: z.boolean().default(true)
});

type LocationFormValues = z.infer<typeof locationFormSchema>;

type LocationRecord = {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const defaultValues: LocationFormValues = {
  name: '',
  code: '',
  description: '',
  isActive: true
};

const LocationsPage = () => {
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLocation, setActiveLocation] = useState<LocationRecord | null>(null);

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues
  });

  const resetDialogState = useCallback(() => {
    setIsDialogOpen(false);
    setActiveLocation(null);
    form.reset(defaultValues);
  }, [form]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const locationsResponse = await api.get<LocationRecord[]>('/locations');
      setLocations(locationsResponse.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load locations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = () => {
    setActiveLocation(null);
    form.reset(defaultValues);
    setIsDialogOpen(true);
  };

  const handleEdit = (location: LocationRecord) => {
    setActiveLocation(location);
    form.reset({
      name: location.name,
      code: location.code,
      description: location.description ?? '',
      isActive: location.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (location: LocationRecord) => {
    const confirmed = window.confirm(`Delete location “${location.name}”?`);
    if (!confirmed) {
      return;
    }
    try {
      await api.delete(`/locations/${location.id}`);
      toast.success('Location deleted');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete location');
    }
  };

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const payload = { ...data, code: data.code.toUpperCase() };
      if (activeLocation) {
        await api.put(`/locations/${activeLocation.id}`, payload);
        toast.success('Location updated');
      } else {
        await api.post('/locations', payload);
        toast.success('Location created');
      }
      resetDialogState();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save location');
    }
  });

  const dialogTitle = activeLocation ? 'Edit Location' : 'New Location';
  const dialogDescription = activeLocation
    ? 'Update the storage location details.'
  : 'Provide details to create a storage location.';

  const emptyState = useMemo(
    () => !isLoading && locations.length === 0,
    [isLoading, locations.length]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Locations</h1>
          <p className="text-sm text-slate-600">Manage bin and shelf locations inside each warehouse.</p>
        </div>
        <Button onClick={handleCreate}>Add Location</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Location List</CardTitle>
          <CardDescription>Each location can host one or more warehouses.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading locations…</p>
          ) : emptyState ? (
            <p className="text-sm text-slate-500">No locations created yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>{location.name}</TableCell>
                    <TableCell>{location.code}</TableCell>
                    <TableCell>{location.description || '—'}</TableCell>
                    <TableCell>
                      <span className={location.isActive ? 'text-emerald-600' : 'text-slate-400'}>
                        {location.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(location)}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(location)}>
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
              <Input id="name" {...form.register('name')} placeholder="Row A - Shelf 1" />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                {...form.register('code', {
                  onChange: (event) => form.setValue('code', event.target.value.toUpperCase())
                })}
                placeholder="LOC-A-01"
              />
              {form.formState.errors.code && (
                <p className="text-sm text-red-500">{form.formState.errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Optional notes about this location"
                {...form.register('description')}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label className="text-sm font-medium">Active</Label>
                <p className="text-xs text-slate-500">Toggle to deactivate this location.</p>
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

export default LocationsPage;
