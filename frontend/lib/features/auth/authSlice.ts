import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../axios';

interface User {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    isLoading: false,
    error: null,
};

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: any, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials);
            localStorage.setItem('token', response.data.token);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const signup = createAsyncThunk(
    'auth/signup',
    async (userData: any, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/signup', userData);
            localStorage.setItem('token', response.data.token);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Signup failed');
        }
    }
);

export const logout = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
    localStorage.removeItem('token');
    // Optional: Call backend logout if needed
    // await api.post('/auth/logout');
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Signup
            .addCase(signup.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signup.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(signup.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
            });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
