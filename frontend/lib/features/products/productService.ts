import api from '@/lib/axios';

export interface Product {
    id: string;
    name: string;
    sku: string;
    category: string;
    unitOfMeasure: string;
    stockByLocation: {
        warehouse: string;
        quantity: number;
    }[];
    totalStock: number;
    reorderingRule?: {
        minimumQuantity: number;
        maximumQuantity: number;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductData {
    name: string;
    sku: string;
    category: string;
    unitOfMeasure: string;
    reorderingRule?: {
        minimumQuantity: number;
        maximumQuantity: number;
    };
    isActive?: boolean;
}

export interface UpdateProductData {
    name?: string;
    sku?: string;
    category?: string;
    unitOfMeasure?: string;
    reorderingRule?: {
        minimumQuantity: number;
        maximumQuantity: number;
    };
    isActive?: boolean;
}

const getProducts = async () => {
    const response = await api.get<Product[]>('/products');
    return response.data;
};

const getProduct = async (id: string) => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
};

const createProduct = async (data: CreateProductData) => {
    const response = await api.post<Product>('/products', data);
    return response.data;
};

const updateProduct = async (id: string, data: UpdateProductData) => {
    const response = await api.put<Product>(`/products/${id}`, data);
    return response.data;
};

const deleteProduct = async (id: string) => {
    const response = await api.delete<{ message: string }>(`/products/${id}`);
    return response.data;
};

const productService = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
};

export default productService;
