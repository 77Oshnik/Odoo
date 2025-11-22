"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Search, Pencil, Trash2, Package, AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { AppDispatch, RootState } from "@/lib/store"
import { getProducts, deleteProduct } from "@/lib/features/products/productSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { products, isLoading, isOperationLoading } = useSelector((state: RootState) => state.products)

  const [searchTerm, setSearchTerm] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    dispatch(getProducts())
  }, [dispatch])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async () => {
    if (!deleteId) return
    const resultAction = await dispatch(deleteProduct(deleteId))
    if (deleteProduct.fulfilled.match(resultAction)) {
      toast.success("Product deleted successfully")
      setDeleteId(null)
    } else {
      toast.error((resultAction.payload as string) || "Failed to delete product")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Products</h1>
          <p className="text-sm text-white/60">Manage your product inventory and details.</p>
        </div>
        <Link href="/products/create">
          <Button className="w-full sm:w-auto bg-indigo-600 text-white hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Product
          </Button>
        </Link>
      </div>

      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white">All Products</CardTitle>
          <CardDescription className="text-white/60">View and manage your product catalog.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search products or SKU..."
                className="pl-9 bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-white/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border border-white/10">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-white/70">Name</TableHead>
                  <TableHead className="text-white/70">SKU</TableHead>
                  <TableHead className="text-white/70">Stock</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-right text-white/70">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index} className="border-white/10">
                      <TableCell>
                        <Skeleton className="h-4 w-32 bg-white/10" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24 bg-white/10" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16 bg-white/10" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-8 w-8 bg-white/10" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <TableRow className="border-white/10">
                    <TableCell colSpan={5} className="h-24 text-center text-white/40">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow
                      key={product.id}
                      className="cursor-pointer border-white/10 hover:bg-white/5"
                      onClick={() => router.push(`/products/${product.id}`)}
                    >
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center">
                          <Package className="mr-2 h-4 w-4 text-white/40" />
                          {product.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-white/60">{product.sku}</TableCell>
                      <TableCell className="text-white">
                        <div className="flex items-center gap-2">
                          {product.totalStock} {product.unitOfMeasure}
                          {product.reorderingRule && product.totalStock <= product.reorderingRule.minimumQuantity && (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product.isActive ? "default" : "secondary"}
                          className={
                            product.isActive ? "bg-emerald-600/20 text-emerald-400" : "bg-white/10 text-white/60"
                          }
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-white/60 hover:text-white hover:bg-white/10"
                            asChild
                          >
                            <Link href={`/products/${product.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                            onClick={() => setDeleteId(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-[#1a1a1a] border border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              {isOperationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
