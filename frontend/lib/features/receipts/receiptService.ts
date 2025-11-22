import api from '@/lib/axios';

export interface ReceiptProduct {
    product: {
        _id: string;
        name: string;
        sku: string;
        unitOfMeasure: string;
    };
    quantityReceived: number;
    unitPrice?: number;
}

export interface Receipt {
    _id: string;
    receiptNumber: string;
    supplier?: string;
    warehouse: {
        _id: string;
        name: string;
        location: string;
    };
    products: ReceiptProduct[];
    status: 'draft' | 'ready' | 'done' | 'canceled';
    receivedDate?: string;
    notes?: string;
    validatedBy?: {
        _id: string;
        name: string;
        email: string;
    };
    validatedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateReceiptData {
    supplier?: string;
    warehouse: string;
    products: {
        product: string;
        quantityReceived: number;
        unitPrice?: number;
    }[];
    status?: string;
    receivedDate?: string;
    notes?: string;
}

export interface UpdateReceiptData {
    supplier?: string;
    warehouse?: string;
    products?: {
        product: string;
        quantityReceived: number;
        unitPrice?: number;
    }[];
    status?: string;
    receivedDate?: string;
    notes?: string;
}

const getReceipts = async (params?: { status?: string; warehouse?: string; supplier?: string }) => {
    const response = await api.get<{ success: boolean; count: number; data: Receipt[] }>('/receipts', { params });
    return response.data;
};

const getReceipt = async (id: string) => {
    const response = await api.get<{ success: boolean; data: Receipt }>(`/receipts/${id}`);
    return response.data;
};

const createReceipt = async (data: CreateReceiptData) => {
    const response = await api.post<{ success: boolean; message: string; data: Receipt }>('/receipts', data);
    return response.data;
};

const updateReceipt = async (id: string, data: UpdateReceiptData) => {
    const response = await api.put<{ success: boolean; message: string; data: Receipt }>(`/receipts/${id}`, data);
    return response.data;
};

const deleteReceipt = async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/receipts/${id}`);
    return response.data;
};

const validateReceipt = async (id: string) => {
    const response = await api.post<{ success: boolean; message: string; data: Receipt }>(`/receipts/${id}/validate`);
    return response.data;
};

const cancelReceipt = async (id: string) => {
    const response = await api.post<{ success: boolean; message: string; data: Receipt }>(`/receipts/${id}/cancel`);
    return response.data;
};

const receiptService = {
    getReceipts,
    getReceipt,
    createReceipt,
    updateReceipt,
    deleteReceipt,
    validateReceipt,
    cancelReceipt,
};

export default receiptService;
