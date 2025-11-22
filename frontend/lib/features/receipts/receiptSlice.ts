import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import receiptService, { Receipt, CreateReceiptData, UpdateReceiptData } from './receiptService';

interface ReceiptState {
    receipts: Receipt[];
    currentReceipt: Receipt | null;
    isLoading: boolean;
    isOperationLoading: boolean;
    error: string | null;
    success: boolean;
}

const initialState: ReceiptState = {
    receipts: [],
    currentReceipt: null,
    isLoading: false,
    isOperationLoading: false,
    error: null,
    success: false,
};

// Async Thunks
export const getReceipts = createAsyncThunk(
    'receipts/getAll',
    async (params: { status?: string; warehouse?: string; supplier?: string } | undefined, thunkAPI) => {
        try {
            return await receiptService.getReceipts(params);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch receipts';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const getReceipt = createAsyncThunk(
    'receipts/getOne',
    async (id: string, thunkAPI) => {
        try {
            return await receiptService.getReceipt(id);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch receipt';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const createReceipt = createAsyncThunk(
    'receipts/create',
    async (data: CreateReceiptData, thunkAPI) => {
        try {
            return await receiptService.createReceipt(data);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to create receipt';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const updateReceipt = createAsyncThunk(
    'receipts/update',
    async ({ id, data }: { id: string; data: UpdateReceiptData }, thunkAPI) => {
        try {
            return await receiptService.updateReceipt(id, data);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to update receipt';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const deleteReceipt = createAsyncThunk(
    'receipts/delete',
    async (id: string, thunkAPI) => {
        try {
            return await receiptService.deleteReceipt(id);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to delete receipt';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const validateReceipt = createAsyncThunk(
    'receipts/validate',
    async (id: string, thunkAPI) => {
        try {
            return await receiptService.validateReceipt(id);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to validate receipt';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const cancelReceipt = createAsyncThunk(
    'receipts/cancel',
    async (id: string, thunkAPI) => {
        try {
            return await receiptService.cancelReceipt(id);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to cancel receipt';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const receiptSlice = createSlice({
    name: 'receipts',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isOperationLoading = false;
            state.error = null;
            state.success = false;
            state.currentReceipt = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get All
            .addCase(getReceipts.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getReceipts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.receipts = action.payload.data;
            })
            .addCase(getReceipts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Get One
            .addCase(getReceipt.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getReceipt.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentReceipt = action.payload.data;
            })
            .addCase(getReceipt.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createReceipt.pending, (state) => {
                state.isOperationLoading = true;
            })
            .addCase(createReceipt.fulfilled, (state, action) => {
                state.isOperationLoading = false;
                state.success = true;
                state.receipts.unshift(action.payload.data);
            })
            .addCase(createReceipt.rejected, (state, action) => {
                state.isOperationLoading = false;
                state.error = action.payload as string;
            })
            // Update
            .addCase(updateReceipt.pending, (state) => {
                state.isOperationLoading = true;
            })
            .addCase(updateReceipt.fulfilled, (state, action) => {
                state.isOperationLoading = false;
                state.success = true;
                state.currentReceipt = action.payload.data;
                state.receipts = state.receipts.map((receipt) =>
                    receipt._id === action.payload.data._id ? action.payload.data : receipt
                );
            })
            .addCase(updateReceipt.rejected, (state, action) => {
                state.isOperationLoading = false;
                state.error = action.payload as string;
            })
            // Delete
            .addCase(deleteReceipt.pending, (state) => {
                state.isOperationLoading = true;
            })
            .addCase(deleteReceipt.fulfilled, (state, action) => {
                state.isOperationLoading = false;
                state.success = true;
                state.receipts = state.receipts.filter(
                    (receipt) => receipt._id !== action.meta.arg
                );
            })
            .addCase(deleteReceipt.rejected, (state, action) => {
                state.isOperationLoading = false;
                state.error = action.payload as string;
            })
            // Validate
            .addCase(validateReceipt.pending, (state) => {
                state.isOperationLoading = true;
            })
            .addCase(validateReceipt.fulfilled, (state, action) => {
                state.isOperationLoading = false;
                state.success = true;
                state.currentReceipt = action.payload.data;
                state.receipts = state.receipts.map((receipt) =>
                    receipt._id === action.payload.data._id ? action.payload.data : receipt
                );
            })
            .addCase(validateReceipt.rejected, (state, action) => {
                state.isOperationLoading = false;
                state.error = action.payload as string;
            })
            // Cancel
            .addCase(cancelReceipt.pending, (state) => {
                state.isOperationLoading = true;
            })
            .addCase(cancelReceipt.fulfilled, (state, action) => {
                state.isOperationLoading = false;
                state.success = true;
                state.currentReceipt = action.payload.data;
                state.receipts = state.receipts.map((receipt) =>
                    receipt._id === action.payload.data._id ? action.payload.data : receipt
                );
            })
            .addCase(cancelReceipt.rejected, (state, action) => {
                state.isOperationLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { reset, clearError } = receiptSlice.actions;
export default receiptSlice.reducer;
