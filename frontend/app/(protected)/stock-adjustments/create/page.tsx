"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { motion } from "framer-motion"
import api from "@/lib/axios"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const createAdjustmentSchema = z.object({
  warehouse: z.string().min(1, "Warehouse is required"),
  product: z.string().min(1, "Product is required"),
  recordedQuantity: z.number(),
  countedQuantity: z.number({ required_error: "Counted quantity is required" }),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
})

type CreateAdjustmentFormValues = z.infer<typeof createAdjustmentSchema>

export default function CreateStockAdjustmentPage() {
  const router = useRouter()
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [currentStock, setCurrentStock] = useState<number | null>(null)

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
  })

  const selectedWarehouse = watch("warehouse")
  const selectedProduct = watch("product")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [warehousesRes, productsRes] = await Promise.all([api.get("/warehouses"), api.get("/products")])

        if (Array.isArray(warehousesRes.data)) {
          setWarehouses(warehousesRes.data)
        } else if (warehousesRes.data.success) {
          setWarehouses(warehousesRes.data.data || [])
        }

        if (Array.isArray(productsRes.data)) {
          setProducts(productsRes.data)
        } else if (productsRes.data.success) {
          setProducts(productsRes.data.data || [])
        }
      } catch (error) {
        toast.error("Failed to load form data")
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedWarehouse && selectedProduct) {
      const product = products.find((p) => (p.id || p._id) === selectedProduct)
      if (product) {
        const stockLoc = product.stockByLocation?.find(
          (loc: any) => (loc.warehouse?._id || loc.warehouse) === selectedWarehouse,
        )
        const qty = stockLoc ? stockLoc.quantity : 0
        setCurrentStock(qty)
        setValue("recordedQuantity", qty)
      }
    } else {
      setCurrentStock(null)
      setValue("recordedQuantity", 0)
    }
  }, [selectedWarehouse, selectedProduct, products, setValue])

  const onSubmit = async (data: CreateAdjustmentFormValues) => {
    try {
      setLoading(true)
      const response = await api.post("/stock-adjustments", data)
      if (response.data.success) {
        toast.success("Stock adjustment created successfully")
        router.push("/stock-adjustments")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create adjustment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#030303] overflow-hidden">
      <div className="relative z-10 space-y-6 px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4"
        >
          <Link href="/stock-adjustments">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">New Stock Adjustment</h1>
            <p className="text-white/60 mt-1">Record a stock discrepancy</p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-2">Adjustment Details</h2>
            <p className="text-white/50 text-sm mb-6">Select a product and warehouse to see current recorded stock.</p>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="warehouse" className="text-white/80">
                    Warehouse
                  </Label>
                  <Select onValueChange={(value) => setValue("warehouse", value)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10">
                      {warehouses.map((w) => (
                        <SelectItem key={w.id || w._id} value={w.id || w._id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.warehouse && <p className="text-sm text-red-400">{errors.warehouse.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product" className="text-white/80">
                    Product
                  </Label>
                  <Select onValueChange={(value) => setValue("product", value)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10">
                      {products.map((p) => (
                        <SelectItem key={p.id || p._id} value={p.id || p._id}>
                          {p.name} ({p.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.product && <p className="text-sm text-red-400">{errors.product.message}</p>}
                </div>
              </div>

              {currentStock !== null && (
                <Alert className="bg-blue-500/10 border-blue-500/30 text-blue-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Current Stock</AlertTitle>
                  <AlertDescription>
                    The system records <strong>{currentStock}</strong> units in this warehouse.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="countedQuantity" className="text-white/80">
                    Counted Quantity
                  </Label>
                  <Input
                    id="countedQuantity"
                    type="number"
                    min="0"
                    {...register("countedQuantity", { valueAsNumber: true })}
                    className="bg-white/5 border-white/10 text-white focus:border-indigo-500/50 focus:ring-indigo-500/20"
                  />
                  <p className="text-xs text-white/50">Enter the actual physical quantity found.</p>
                  {errors.countedQuantity && <p className="text-sm text-red-400">{errors.countedQuantity.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-white/80">
                    Reason
                  </Label>
                  <Select onValueChange={(value) => setValue("reason", value)} defaultValue="miscounted">
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10">
                      <SelectItem value="miscounted">Miscounted</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                      <SelectItem value="found">Found</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.reason && <p className="text-sm text-red-400">{errors.reason.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white/80">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                  placeholder="Add any additional details about this adjustment..."
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Link href="/stock-adjustments">
                  <Button
                    variant="outline"
                    type="button"
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={loading || currentStock === null}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
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
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  )
}
