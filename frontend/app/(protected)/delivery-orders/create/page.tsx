"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { motion } from "framer-motion"
import api from "@/lib/axios"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const productSchema = z.object({
  product: z.string().min(1, "Product is required"),
  quantityOrdered: z.number().min(1, "Quantity must be at least 1"),
})

const createOrderSchema = z.object({
  customer: z.string().optional(),
  warehouse: z.string().min(1, "Warehouse is required"),
  deliveryDate: z.string().optional(),
  notes: z.string().optional(),
  products: z.array(productSchema).min(1, "At least one product is required"),
})

type CreateOrderFormValues = z.infer<typeof createOrderSchema>

export default function CreateDeliveryOrderPage() {
  const router = useRouter()
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      products: [{ product: "", quantityOrdered: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [warehousesRes, productsRes] = await Promise.all([api.get("/warehouses"), api.get("/products")])

        if (Array.isArray(warehousesRes.data)) {
          setWarehouses(warehousesRes.data)
        } else if (warehousesRes.data.success && Array.isArray(warehousesRes.data.data)) {
          setWarehouses(warehousesRes.data.data)
        }

        if (Array.isArray(productsRes.data)) {
          setProducts(productsRes.data)
        } else if (productsRes.data.success && Array.isArray(productsRes.data.data)) {
          setProducts(productsRes.data.data)
        }
      } catch (error) {
        toast.error("Failed to load form data")
      }
    }
    fetchData()
  }, [])

  const onSubmit = async (data: CreateOrderFormValues) => {
    try {
      setLoading(true)
      const response = await api.post("/delivery-orders", data)
      if (response.data.success) {
        toast.success("Delivery order created successfully")
        router.push("/delivery-orders")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create order")
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
          <Link href="/delivery-orders">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Create Delivery Order</h1>
            <p className="text-white/60 mt-1">Create a new outbound delivery</p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Order Details Card */}
          <div className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-6">Order Details</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="customer" className="text-white/80">
                    Customer Name
                  </Label>
                  <Input
                    id="customer"
                    {...register("customer")}
                    placeholder="Enter customer name"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                  />
                </div>
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
                  <Label htmlFor="deliveryDate" className="text-white/80">
                    Delivery Date
                  </Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    {...register("deliveryDate")}
                    className="bg-white/5 border-white/10 text-white focus:border-indigo-500/50 focus:ring-indigo-500/20"
                  />
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
                  placeholder="Add any additional notes..."
                />
              </div>
            </div>
          </div>

          {/* Products Card */}
          <div className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-lg">
            <div className="flex flex-row items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Products</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ product: "", quantityOrdered: 1 })}
                className="bg-indigo-600 hover:bg-indigo-700 text-white border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-4 items-start p-4 bg-white/[0.02] rounded-lg border border-white/5"
                >
                  <div className="flex-1 space-y-2">
                    <Label className="text-white/80">Product</Label>
                    <Select onValueChange={(value) => setValue(`products.${index}.product`, value)}>
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
                    {errors.products?.[index]?.product && (
                      <p className="text-sm text-red-400">{errors.products[index]?.product?.message}</p>
                    )}
                  </div>
                  <div className="w-32 space-y-2">
                    <Label className="text-white/80">Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      {...register(`products.${index}.quantityOrdered`, { valueAsNumber: true })}
                      className="bg-white/5 border-white/10 text-white focus:border-indigo-500/50 focus:ring-indigo-500/20"
                    />
                    {errors.products?.[index]?.quantityOrdered && (
                      <p className="text-sm text-red-400">{errors.products[index]?.quantityOrdered?.message}</p>
                    )}
                  </div>
                  <div className="pt-8">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href="/delivery-orders">
              <Button
                variant="outline"
                type="button"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white border-0">
              {loading ? (
                "Creating..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Order
                </>
              )}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  )
}
