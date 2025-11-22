"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { AppDispatch, RootState } from "@/lib/store"
import { createProduct } from "@/lib/features/products/productSlice"
import { getCategories } from "@/lib/features/categories/categorySlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"

import { productSchema } from "@/schemas"
import type { ProductFormValues } from "@/types"

export default function CreateProductPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { isOperationLoading } = useSelector((state: RootState) => state.products)
  const { categories } = useSelector((state: RootState) => state.categories)

  useEffect(() => {
    dispatch(getCategories())
  }, [dispatch])

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      unitOfMeasure: "Units",
      reorderingRule: {
        minimumQuantity: 0,
        maximumQuantity: 0,
      },
      isActive: true,
    },
  })

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const resultAction = await dispatch(createProduct(data))
      if (createProduct.fulfilled.match(resultAction)) {
        toast.success("Product created successfully")
        router.push("/products")
      } else {
        toast.error((resultAction.payload as string) || "Failed to create product")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
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
          <h1 className="text-2xl font-bold tracking-tight text-white">Create Product</h1>
          <p className="text-sm text-white/60">Add a new item to your inventory.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Product Details</CardTitle>
              <CardDescription className="text-white/60">Basic information about the product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Product Name <span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Wireless Mouse"
                        className="bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-white/30"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        SKU <span className="text-red-400">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. WM-001"
                          className="bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-white/30"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-white/40">Unique Stock Keeping Unit.</FormDescription>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Category <span className="text-red-400">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/10 border border-white/20 text-white">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#1a1a1a] border border-white/10">
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id} className="text-white">
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="unitOfMeasure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Unit of Measure <span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Units, kg, m"
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
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-white">Active Status</FormLabel>
                      <FormDescription className="text-white/40">
                        Inactive products are hidden from selection.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Inventory Rules</CardTitle>
              <CardDescription className="text-white/60">Configure reordering rules for this product.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="reorderingRule.minimumQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Minimum Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        className="bg-white/10 border border-white/20 text-white focus:border-white/30"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-white/40">Trigger reorder when stock falls below.</FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reorderingRule.maximumQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Maximum Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        className="bg-white/10 border border-white/20 text-white focus:border-white/30"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-white/40">Target stock level after reorder.</FormDescription>
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
              Create Product
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
