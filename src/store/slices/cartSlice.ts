import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { createCart } from '../../services/shopifyCartService';
import type { TaxiOption, SearchDetails } from '../../types';

export interface CartItem {
    taxi: TaxiOption;
    search: SearchDetails;
    totalPrice: number;
    quantity: number;
}

export interface CustomerInfo {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address?: {
        address1: string;
        city: string;
        country: string;
        zip: string;
    };
}

interface CartState {
    item: CartItem | null;
    customerInfo: CustomerInfo | null;
    checkoutUrl: string | null;
    loading: boolean;
    error: string | null;
    checkoutComplete: boolean;
}

const initialState: CartState = {
    item: null,
    customerInfo: null,
    checkoutUrl: null,
    loading: false,
    error: null,
    checkoutComplete: false,
};

// Create Shopify cart and get checkout URL
export const createCheckout = createAsyncThunk(
    'cart/createCheckout',
    async (
        { item, customerInfo }: { item: CartItem; customerInfo?: CustomerInfo },
        { rejectWithValue }
    ) => {
        try {
            const email = customerInfo?.email;
            const checkoutUrl = await createCart(item, email);
            return checkoutUrl;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create checkout');
        }
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCartItem: (state, action: PayloadAction<CartItem>) => {
            state.item = action.payload;
            state.error = null;
        },
        clearCart: (state) => {
            state.item = null;
            state.checkoutUrl = null;
            state.checkoutComplete = false;
        },
        setCustomerInfo: (state, action: PayloadAction<CustomerInfo>) => {
            state.customerInfo = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        setCheckoutComplete: (state, action: PayloadAction<boolean>) => {
            state.checkoutComplete = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create checkout
            .addCase(createCheckout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCheckout.fulfilled, (state, action) => {
                state.loading = false;
                state.checkoutUrl = action.payload;
                state.error = null;
            })
            .addCase(createCheckout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setCartItem,
    clearCart,
    setCustomerInfo,
    clearError,
    setCheckoutComplete,
} = cartSlice.actions;

export default cartSlice.reducer;