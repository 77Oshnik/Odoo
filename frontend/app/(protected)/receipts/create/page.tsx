"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { AppDispatch, RootState } from "@/lib/store"
import { createReceipt } from "@/lib/features/receipts/receiptSlice"
import api from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { Warehouse, Product, ReceiptFormValues } from "@/types" // Import Warehouse, Product, and ReceiptFormValues
import { receiptSchema } from "@/schemas" // Import receiptSchema

export default function CreateReceiptPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { isOperationLoading } = useSelector((state: RootState) => state.receipts)

  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [productsList, setProductsList] = useState<Product[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      supplier: "",
      warehouse: "",
      receivedDate: new Date().toISOString().split("T")[0],
      notes: "",
      products: [{ product: "", quantityReceived: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [warehousesRes, productsRes] = await Promise.all([
          api.get<Warehouse[]>("/warehouses"),
          api.get<Product[]>("/products"),
        ])
        setWarehouses(warehousesRes.data || [])
        setProductsList(productsRes.data || [])
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast.error("Failed to load warehouses or products")
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [])

  const onSubmit = async (data: ReceiptFormValues) => {
    try {
      const resultAction = await dispatch(createReceipt(data))
      if (createReceipt.fulfilled.match(resultAction)) {
        toast.success("Receipt created successfully")
        router.push("/receipts")
      } else {
        toast.error((resultAction.payload as string) || "Failed to create receipt")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-white/60 hover:text-white hover:bg-white/10"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create Receipt</h1>
          <p className="text-sm text-white/60">Record a new incoming shipment.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">General Information</CardTitle>
              <CardDescription className="text-white/60">Basic details about the receipt.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="warehouse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Destination Warehouse <span className="text-red-400">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/10 border border-white/20 text-white">
                          <SelectValue placeholder="Select warehouse" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1a1a1a] border border-white/10">
                        {warehouses.map((w) => (
                          <SelectItem key={w.id} value={w.id} className="text-white">
                            {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Supplier</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Supplier name"
                        className="bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-white/30"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="receivedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Received Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="bg-white/10 border border-white/20 text-white focus:border-white/30"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Products</CardTitle>
                <CardDescription className="text-white/60">Items included in this receipt.</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => append({ product: "", quantityReceived: 1 })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-start"
                >
                  <div className="flex-1 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`products.${index}.product`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className={index !== 0 ? "sr-only" : "text-white"}>Product</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/10 border border-white/20 text-white">
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#1a1a1a] border border-white/10">
                              {productsList.map((p) => (
                                <SelectItem key={p.id} value={p.id} className="text-white">
                                  {p.name} ({p.sku})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`products.${index}.quantityReceived`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={index !== 0 ? "sr-only" : "text-white"}>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              className="bg-white/10 border border-white/20 text-white focus:border-white/30"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 sm:mt-0"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {form.formState.errors.products && (
                <p className="text-sm font-medium text-red-400">{form.formState.errors.products.root?.message}</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes here..."
                        className="min-h-[100px] bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-white/30"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isOperationLoading}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {isOperationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Receipt
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
