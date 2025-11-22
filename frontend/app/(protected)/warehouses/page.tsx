"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import api from "@/lib/axios"

const warehouseFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  address: z
    .string()
    .optional()
    .transform((value) => value ?? ""),
  isActive: z.boolean().default(true),
})

type WarehouseFormValues = z.infer<typeof warehouseFormSchema>

type Warehouse = {
  id: string
  name: string
  location: { id: string; name?: string; code?: string } | string | null
  address?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type LocationOption = {
  id: string
  name: string
  code?: string
}

const defaultValues: WarehouseFormValues = {
  name: "",
  location: "",
  address: "",
  isActive: true,
}

const WarehousesPage = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeWarehouse, setActiveWarehouse] = useState<Warehouse | null>(null)

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues,
  })

  const resetDialogState = useCallback(() => {
    setIsDialogOpen(false)
    setActiveWarehouse(null)
    form.reset(defaultValues)
  }, [form])

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [warehouseResponse, locationResponse] = await Promise.all([
        api.get<Warehouse[]>("/warehouses"),
        api.get<LocationOption[]>("/locations"),
      ])
      setWarehouses(warehouseResponse.data)
      setLocations(locationResponse.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load warehouses")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreate = () => {
    if (locations.length === 0) {
      toast.warning("Create a location before adding a warehouse.")
      return
    }
    setActiveWarehouse(null)
    form.reset(defaultValues)
    setIsDialogOpen(true)
  }

  const handleEdit = (warehouse: Warehouse) => {
    setActiveWarehouse(warehouse)
    form.reset({
      name: warehouse.name,
      location: typeof warehouse.location === "string" ? warehouse.location : (warehouse.location?.id ?? ""),
      address: warehouse.address ?? "",
      isActive: warehouse.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (warehouse: Warehouse) => {
    const confirmed = window.confirm(`Delete warehouse "${warehouse.name}"?`)
    if (!confirmed) {
      return
    }
    try {
      await api.delete(`/warehouses/${warehouse.id}`)
      toast.success("Warehouse deleted")
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete warehouse")
    }
  }

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      if (activeWarehouse) {
        await api.put(`/warehouses/${activeWarehouse.id}`, data)
        toast.success("Warehouse updated")
      } else {
        await api.post("/warehouses", data)
        toast.success("Warehouse created")
      }
      resetDialogState()
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save warehouse")
    }
  })

  const dialogTitle = activeWarehouse ? "Edit Warehouse" : "New Warehouse"
  const dialogDescription = activeWarehouse ? "Update the warehouse details." : "Provide details to create a warehouse."

  const emptyState = useMemo(() => !isLoading && warehouses.length === 0, [isLoading, warehouses.length])

  const locationOptionsEmpty = locations.length === 0

  return (
    <div className="relative min-h-screen bg-[#030303] overflow-hidden">
      <div className="relative z-10 space-y-6 px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Warehouses</h1>
            <p className="text-sm sm:text-base text-white/60 mt-2">Manage physical warehouses under each location.</p>
          </div>
          <Button
            onClick={handleCreate}
            disabled={locationOptionsEmpty}
            className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 w-full sm:w-auto"
          >
            Add Warehouse
          </Button>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-lg"
        >
          <h2 className="text-lg font-semibold text-white mb-2">Warehouse List</h2>
          <p className="text-white/50 text-sm mb-6">
            Overview of all warehouses configured in the system. Warehouses must be associated with a location.
          </p>

          {locationOptionsEmpty && !isLoading && (
            <div className="mb-6 rounded-lg bg-amber-500/10 border border-amber-500/30 p-4">
              <p className="text-sm text-amber-300">Create at least one location before adding warehouses.</p>
            </div>
          )}

          {isLoading ? (
            <p className="text-sm text-white/40">Loading warehouses…</p>
          ) : emptyState ? (
            <p className="text-sm text-white/40">No warehouses created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/[0.02]">
                    <TableHead className="text-white/70">Name</TableHead>
                    <TableHead className="text-white/70">Location</TableHead>
                    <TableHead className="text-white/70">Address</TableHead>
                    <TableHead className="text-white/70">Status</TableHead>
                    <TableHead className="text-right text-white/70">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouses.map((warehouse) => (
                    <TableRow key={warehouse.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                      <TableCell className="text-white">{warehouse.name}</TableCell>
                      <TableCell className="text-white/70">
                        {typeof warehouse.location === "object"
                          ? warehouse.location?.name || warehouse.location?.code || "—"
                          : warehouse.location || "—"}
                      </TableCell>
                      <TableCell className="text-white/70">{warehouse.address || "—"}</TableCell>
                      <TableCell>
                        <span className={warehouse.isActive ? "text-emerald-400" : "text-white/40"}>
                          {warehouse.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(warehouse)}
                            className="bg-white/5 border-white/20 text-white/90 hover:bg-white/10"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(warehouse)}
                            className="bg-white/5 border-white/20 text-white/90 hover:bg-white/10"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => (open ? setIsDialogOpen(true) : resetDialogState())}>
        <DialogContent className="bg-[#1a1a1a] border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">{dialogTitle}</DialogTitle>
            <DialogDescription className="text-white/60">{dialogDescription}</DialogDescription>
          </DialogHeader>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/80">
                Name
              </Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Main Warehouse"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500/50 focus:ring-indigo-500/20"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-400">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">Location</Label>
              <Controller
                name="location"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select a location" className="text-white" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10">
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id} className="text-white">
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.location && (
                <p className="text-sm text-red-400">{form.formState.errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-white/80">
                Address
              </Label>
              <Input
                id="address"
                {...form.register("address")}
                placeholder="Optional address details"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500/50 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 p-3">
              <div>
                <Label className="text-sm font-medium text-white">Active</Label>
                <p className="text-xs text-white/50">Toggle to deactivate this warehouse.</p>
              </div>
              <Controller
                name="isActive"
                control={form.control}
                render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={resetDialogState}
                className="bg-white/5 border-white/20 text-white/90 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
              >
                {form.formState.isSubmitting ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default WarehousesPage
