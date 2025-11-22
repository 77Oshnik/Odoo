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
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import api from "@/lib/axios"

const locationFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z
    .string()
    .optional()
    .transform((value) => value ?? ""),
  isActive: z.boolean().default(true),
})

type LocationFormValues = z.infer<typeof locationFormSchema>

type LocationRecord = {
  id: string
  name: string
  code: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const defaultValues: LocationFormValues = {
  name: "",
  code: "",
  description: "",
  isActive: true,
}

const LocationsPage = () => {
  const [locations, setLocations] = useState<LocationRecord[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeLocation, setActiveLocation] = useState<LocationRecord | null>(null)

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues,
  })

  const resetDialogState = useCallback(() => {
    setIsDialogOpen(false)
    setActiveLocation(null)
    form.reset(defaultValues)
  }, [form])

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const locationsResponse = await api.get<LocationRecord[]>("/locations")
      setLocations(locationsResponse.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load locations")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreate = () => {
    setActiveLocation(null)
    form.reset(defaultValues)
    setIsDialogOpen(true)
  }

  const handleEdit = (location: LocationRecord) => {
    setActiveLocation(location)
    form.reset({
      name: location.name,
      code: location.code,
      description: location.description ?? "",
      isActive: location.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (location: LocationRecord) => {
    const confirmed = window.confirm(`Delete location "${location.name}"?`)
    if (!confirmed) {
      return
    }
    try {
      await api.delete(`/locations/${location.id}`)
      toast.success("Location deleted")
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete location")
    }
  }

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const payload = { ...data, code: data.code.toUpperCase() }
      if (activeLocation) {
        await api.put(`/locations/${activeLocation.id}`, payload)
        toast.success("Location updated")
      } else {
        await api.post("/locations", payload)
        toast.success("Location created")
      }
      resetDialogState()
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save location")
    }
  })

  const dialogTitle = activeLocation ? "Edit Location" : "New Location"
  const dialogDescription = activeLocation
    ? "Update the storage location details."
    : "Provide details to create a storage location."

  const emptyState = useMemo(() => !isLoading && locations.length === 0, [isLoading, locations.length])

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
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Locations</h1>
            <p className="text-sm sm:text-base text-white/60 mt-2">
              Manage bin and shelf locations inside each warehouse.
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 w-full sm:w-auto"
          >
            Add Location
          </Button>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-lg"
        >
          <h2 className="text-lg font-semibold text-white mb-2">Location List</h2>
          <p className="text-white/50 text-sm mb-6">Each location can host one or more warehouses.</p>

          {isLoading ? (
            <p className="text-sm text-white/40">Loading locations…</p>
          ) : emptyState ? (
            <p className="text-sm text-white/40">No locations created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/[0.02]">
                    <TableHead className="text-white/70">Name</TableHead>
                    <TableHead className="text-white/70">Code</TableHead>
                    <TableHead className="text-white/70">Description</TableHead>
                    <TableHead className="text-white/70">Status</TableHead>
                    <TableHead className="text-right text-white/70">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((location) => (
                    <TableRow key={location.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                      <TableCell className="text-white">{location.name}</TableCell>
                      <TableCell className="text-white/70 font-mono">{location.code}</TableCell>
                      <TableCell className="text-white/70">{location.description || "—"}</TableCell>
                      <TableCell>
                        <span className={location.isActive ? "text-emerald-400" : "text-white/40"}>
                          {location.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(location)}
                            className="bg-white/5 border-white/20 text-white/90 hover:bg-white/10"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(location)}
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
                placeholder="Row A - Shelf 1"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500/50 focus:ring-indigo-500/20"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-400">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="text-white/80">
                Code
              </Label>
              <Input
                id="code"
                {...form.register("code", {
                  onChange: (event) => form.setValue("code", event.target.value.toUpperCase()),
                })}
                placeholder="LOC-A-01"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500/50 focus:ring-indigo-500/20"
              />
              {form.formState.errors.code && (
                <p className="text-sm text-red-400">{form.formState.errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white/80">
                Description
              </Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Optional notes about this location"
                {...form.register("description")}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500/50 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 p-3">
              <div>
                <Label className="text-sm font-medium text-white">Active</Label>
                <p className="text-xs text-white/50">Toggle to deactivate this location.</p>
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

export default LocationsPage
