import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService, { Product, CreateProductData, UpdateProductData } from './productService';

interface ProductState {
    products: Product[];
    currentProduct: Product | null;
    isLoading: boolean;
    isOperationLoading: boolean;
    error: string | null;
    success: boolean;
}

const initialState: ProductState = {
    products: [],
    currentProduct: null,
    isLoading: false,
    isOperationLoading: false,
    error: null,
    success: false,
};

// Async Thunks
export const getProducts = createAsyncThunk(
    'products/getAll',
    async (_, thunkAPI) => {
        try {
            return await productService.getProducts();
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch products';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const getProduct = createAsyncThunk(
    'products/getOne',
    async (id: string, thunkAPI) => {
        try {
            return await productService.getProduct(id);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch product';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const createProduct = createAsyncThunk(
    'products/create',
    async (data: CreateProductData, thunkAPI) => {
        try {
            return await productService.createProduct(data);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to create product';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const updateProduct = createAsyncThunk(
    'products/update',
    async ({ id, data }: { id: string; data: UpdateProductData }, thunkAPI) => {
        try {
            return await productService.updateProduct(id, data);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to update product';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const deleteProduct = createAsyncThunk(
    'products/delete',
    async (id: string, thunkAPI) => {
        try {
            return await productService.deleteProduct(id);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to delete product';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isOperationLoading = false;
            state.error = null;
            state.success = false;
            state.currentProduct = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get All
            .addCase(getProducts.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.products = action.payload;
            })
            .addCase(getProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Get One
            .addCase(getProduct.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getProduct.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentProduct = action.payload;
            })
            .addCase(getProduct.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createProduct.pending, (state) => {
                state.isOperationLoading = true;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.isOperationLoading = false;
                state.success = true;
                state.products.push(action.payload);
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.isOperationLoading = false;
                state.error = action.payload as string;
            })
            // Update
            .addCase(updateProduct.pending, (state) => {
                state.isOperationLoading = true;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.isOperationLoading = false;
                state.success = true;
                state.currentProduct = action.payload;
                state.products = state.products.map((prod) =>
                    prod.id === action.payload.id ? action.payload : prod
                );
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.isOperationLoading = false;
                state.error = action.payload as string;
            })
            // Delete
            .addCase(deleteProduct.pending, (state) => {
                state.isOperationLoading = true;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.isOperationLoading = false;
                state.success = true;
                state.products = state.products.filter(
                    (prod) => prod.id !== action.meta.arg
                );
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.isOperationLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { reset, clearError } = productSlice.actions;
export default productSlice.reducer;
