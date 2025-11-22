"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Plus, Search, Pencil, Trash2, Package, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import type { AppDispatch, RootState } from "@/lib/store"
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/features/categories/categorySlice"
import type { Category } from "@/lib/features/categories/categoryService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { CategoryDialog } from "@/components/features/categories/category-dialog"

export default function CategoriesPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { categories, isLoading, isOperationLoading } = useSelector((state: RootState) => state.categories)

  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    dispatch(getCategories())
  }, [dispatch])

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreate = async (values: any) => {
    const resultAction = await dispatch(createCategory(values))
    if (createCategory.fulfilled.match(resultAction)) {
      toast.success("Category created successfully")
      setIsDialogOpen(false)
    } else {
      toast.error((resultAction.payload as string) || "Failed to create category")
    }
  }

  const handleUpdate = async (values: any) => {
    if (!editingCategory) return
    const resultAction = await dispatch(updateCategory({ id: editingCategory.id, data: values }))
    if (updateCategory.fulfilled.match(resultAction)) {
      toast.success("Category updated successfully")
      setIsDialogOpen(false)
      setEditingCategory(null)
    } else {
      toast.error((resultAction.payload as string) || "Failed to update category")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const resultAction = await dispatch(deleteCategory(deleteId))
    if (deleteCategory.fulfilled.match(resultAction)) {
      toast.success("Category deleted successfully")
      setDeleteId(null)
    } else {
      toast.error((resultAction.payload as string) || "Failed to delete category")
    }
  }

  const openCreateDialog = () => {
    setEditingCategory(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

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
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Categories</h1>
            <p className="text-sm sm:text-base text-white/60 mt-2">Organize your products into logical groups.</p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Category
          </Button>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-lg"
        >
          <h2 className="text-lg font-semibold text-white mb-2">All Categories</h2>
          <p className="text-white/50 text-sm mb-6">Manage your product categories and their visibility.</p>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
              <Input
                placeholder="Search categories..."
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-white/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/[0.02]">
                  <TableHead className="text-white/70">Name</TableHead>
                  <TableHead className="text-white/70">Description</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-right text-white/70">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-32 bg-white/10" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48 bg-white/10" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-8 w-8 bg-white/10" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-white/40">
                      No categories found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Package className="mr-2 h-4 w-4 text-white/50" />
                          <span className="text-white">{category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/70">{category.description || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={category.isActive ? "default" : "secondary"}
                          className={
                            category.isActive
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                          }
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(category)}
                            className="text-white/70 hover:text-white hover:bg-white/10"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                            onClick={() => setDeleteId(category.id)}
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
        </motion.div>
      </div>

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={editingCategory ? handleUpdate : handleCreate}
        category={editingCategory}
        isLoading={isOperationLoading}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-[#1a1a1a] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This action cannot be undone. This will permanently delete the category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white border-0">
              {isOperationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
