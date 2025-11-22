import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryService, { Category, CreateCategoryData, UpdateCategoryData } from './categoryService';

interface CategoryState {
    categories: Category[];
    currentCategory: Category | null;
    isLoading: boolean;
    isOperationLoading: boolean;
    error: string | null;
    success: boolean;
}

const initialState: CategoryState = {
    categories: [],
    currentCategory: null,
    isLoading: false,
    isOperationLoading: false,
    error: null,
    success: false,
};

// Async Thunks
export const getCategories = createAsyncThunk(
    'categories/getAll',
    async (_, thunkAPI) => {
        try {
            return await categoryService.getCategories();
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch categories';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const createCategory = createAsyncThunk(
    'categories/create',
    async (data: CreateCategoryData, thunkAPI) => {
        try {
            return await categoryService.createCategory(data);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to create category';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const updateCategory = createAsyncThunk(
    'categories/update',
    async ({ id, data }: { id: string; data: UpdateCategoryData }, thunkAPI) => {
        try {
            return await categoryService.updateCategory(id, data);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to update category';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const deleteCategory = createAsyncThunk(
    'categories/delete',
    async (id: string, thunkAPI) => {
        try {
            return await categoryService.deleteCategory(id);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Failed to delete category';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const categorySlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isOperationLoading = false;
            state.error = null;
            state.success = false;
            state.currentCategory = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get All
            .addCase(getCategories.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getCategories.fulfilled, (state, action) => {
                state.isLoading = false;
                state.categories = action.payload;
            })
            .addCase(getCategories.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createCategory.pending, (state) => {
                state.isOperationLoading = true;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.isOperationLoading = false;
                state.success = true;
                state.categories.push(action.payload);
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.isOperationLoading = false;
                state.error = action.payload as string;
            })
            // Update
            .addCase(updateCategory.pending, (state) => {
                state.isOperationLoading = true;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.isOperationLoading = false;
                state.success = true;
                state.categories = state.categories.map((cat) =>
                    cat.id === action.payload.id ? action.payload : cat
                );
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.isOperationLoading = false;
                state.error = action.payload as string;
            })
            // Delete
            .addCase(deleteCategory.pending, (state) => {
                state.isOperationLoading = true;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.isOperationLoading = false;
                state.success = true;
                state.categories = state.categories.filter(
                    (cat) => cat.id !== action.meta.arg
                );
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.isOperationLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { reset, clearError } = categorySlice.actions;
export default categorySlice.reducer;
