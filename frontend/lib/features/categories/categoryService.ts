import api from '@/lib/axios';

export interface Category {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryData {
    name: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateCategoryData {
    name?: string;
    description?: string;
    isActive?: boolean;
}

const getCategories = async () => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
};

const getCategory = async (id: string) => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
};

const createCategory = async (data: CreateCategoryData) => {
    const response = await api.post<Category>('/categories', data);
    return response.data;
};

const updateCategory = async (id: string, data: UpdateCategoryData) => {
    const response = await api.put<Category>(`/categories/${id}`, data);
    return response.data;
};

const deleteCategory = async (id: string) => {
    const response = await api.delete<{ message: string }>(`/categories/${id}`);
    return response.data;
};

const categoryService = {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
};

export default categoryService;
