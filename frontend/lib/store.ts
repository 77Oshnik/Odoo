import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import receiptReducer from './features/receipts/receiptSlice';
import categoryReducer from './features/categories/categorySlice';
import productReducer from './features/products/productSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        receipts: receiptReducer,
        categories: categoryReducer,
        products: productReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
