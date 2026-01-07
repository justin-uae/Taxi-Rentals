import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchTaxiProducts as fetchProducts, fetchProductById as getProductById } from '../../services/shopifyClient';
import type { TaxiOption } from '../../types';

interface ShopifyState {
    products: TaxiOption[];
    loading: boolean;
    error: string | null;
    initialized: boolean;
}

const initialState: ShopifyState = {
    products: [],
    loading: false,
    error: null,
    initialized: false,
};

// Async thunk to fetch products from Shopify
export const fetchTaxiProducts = createAsyncThunk(
    'shopify/fetchTaxiProducts',
    async (_, { rejectWithValue }) => {
        try {
            const products = await fetchProducts();
            return products;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch products');
        }
    }
);

// Async thunk to fetch a single product by ID
export const fetchProductById = createAsyncThunk(
    'shopify/fetchProductById',
    async (productId: string, { rejectWithValue }) => {
        try {
            const product = await getProductById(productId);
            return product;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch product');
        }
    }
);

const shopifySlice = createSlice({
    name: 'shopify',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetProducts: (state) => {
            state.products = [];
            state.initialized = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all products
            .addCase(fetchTaxiProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTaxiProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload;
                state.initialized = true;
                state.error = null;
            })
            .addCase(fetchTaxiProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.initialized = true;
            })
            // Fetch single product
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.loading = false;
                // Handle null case
                if (action.payload) {
                    // Update or add the product
                    const index = state.products.findIndex(p => p.id === action.payload!.id);
                    if (index !== -1) {
                        state.products[index] = action.payload;
                    } else {
                        state.products.push(action.payload);
                    }
                }
                state.error = null;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, resetProducts } = shopifySlice.actions;
export default shopifySlice.reducer;