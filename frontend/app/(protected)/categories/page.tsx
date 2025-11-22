'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Pencil, Trash2, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppDispatch, RootState } from '@/lib/store';
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from '@/lib/features/categories/categorySlice';
import { Category } from '@/lib/features/categories/categoryService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryDialog } from '@/components/features/categories/category-dialog';

export default function CategoriesPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { categories, isLoading, isOperationLoading } = useSelector(
        (state: RootState) => state.categories
    );

    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(getCategories());
    }, [dispatch]);

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = async (values: any) => {
        const resultAction = await dispatch(createCategory(values));
        if (createCategory.fulfilled.match(resultAction)) {
            toast.success('Category created successfully');
            setIsDialogOpen(false);
        } else {
            toast.error(resultAction.payload as string || 'Failed to create category');
        }
    };

    const handleUpdate = async (values: any) => {
        if (!editingCategory) return;
        const resultAction = await dispatch(
            updateCategory({ id: editingCategory.id, data: values })
        );
        if (updateCategory.fulfilled.match(resultAction)) {
            toast.success('Category updated successfully');
            setIsDialogOpen(false);
            setEditingCategory(null);
        } else {
            toast.error(resultAction.payload as string || 'Failed to update category');
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const resultAction = await dispatch(deleteCategory(deleteId));
        if (deleteCategory.fulfilled.match(resultAction)) {
            toast.success('Category deleted successfully');
            setDeleteId(null);
        } else {
            toast.error(resultAction.payload as string || 'Failed to delete category');
        }
    };

    const openCreateDialog = () => {
        setEditingCategory(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (category: Category) => {
        setEditingCategory(category);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Categories</h1>
                    <p className="text-sm text-slate-500">
                        Organize your products into logical groups.
                    </p>
                </div>
                <Button onClick={openCreateDialog} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Category
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>All Categories</CardTitle>
                    <CardDescription>
                        Manage your product categories and their visibility.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search categories..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-8" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No categories found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCategories.map((category) => (
                                        <TableRow key={category.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center">
                                                    <Package className="mr-2 h-4 w-4 text-slate-400" />
                                                    {category.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-500">
                                                {category.description || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={category.isActive ? 'default' : 'secondary'}>
                                                    {category.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditDialog(category)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
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
                </CardContent>
            </Card>

            <CategoryDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSubmit={editingCategory ? handleUpdate : handleCreate}
                category={editingCategory}
                isLoading={isOperationLoading}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the category.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isOperationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
