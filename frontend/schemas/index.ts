import * as z from 'zod';

export const receiptSchema = z.object({
    supplier: z.string().optional(),
    warehouse: z.string().min(1, 'Warehouse is required'),
    receivedDate: z.string().optional(),
    notes: z.string().optional(),
    products: z.array(
        z.object({
            product: z.string().min(1, 'Product is required'),
            quantityReceived: z.coerce.number().min(1, 'Quantity must be at least 1'),
            unitPrice: z.coerce.number().optional(),
        })
    ).min(1, 'At least one product is required'),
});

export const productSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    sku: z.string().min(1, 'SKU is required'),
    category: z.string().min(1, 'Category is required'),
    unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
    reorderingRule: z.object({
        minimumQuantity: z.coerce.number().min(0),
        maximumQuantity: z.coerce.number().min(0),
    }).optional(),
    isActive: z.boolean().default(true),
});
