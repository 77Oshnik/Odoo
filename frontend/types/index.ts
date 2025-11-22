import * as z from 'zod';
import { receiptSchema, productSchema } from '@/schemas';

export type ReceiptFormValues = z.infer<typeof receiptSchema>;
export type ProductFormValues = z.infer<typeof productSchema>;

export interface Warehouse {
    id: string;
    name: string;
    location?: string;
}

export interface Product {
    id: string;
    name: string;
    sku: string;
    unitOfMeasure: string;
    category?: string | { id: string; name: string };
    totalStock?: number;
    reorderingRule?: {
        minimumQuantity: number;
        maximumQuantity: number;
    };
    isActive?: boolean;
}
