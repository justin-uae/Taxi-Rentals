import { configureStore } from '@reduxjs/toolkit';
import shopifyReducer from './slices/shopifySlice';
import cartReducer from './slices/cartSlice';

export const store = configureStore({
    reducer: {
        shopify: shopifyReducer,
        cart: cartReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;