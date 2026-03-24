import { createSlice } from "@reduxjs/toolkit";

const getInitialCart = () => {
  if (typeof window === "undefined") {
    return {
      items: [],
      subtotal: 0,
      totalQuantity: 0,
    };
  }

  try {
    const saved = localStorage.getItem("customer_cart");
    if (!saved) {
      return {
        items: [],
        subtotal: 0,
        totalQuantity: 0,
      };
    }
    return JSON.parse(saved);
  } catch {
    return {
      items: [],
      subtotal: 0,
      totalQuantity: 0,
    };
  }
};

const calculateCart = (items) => {
  let subtotal = 0;
  let totalQuantity = 0;

  for (const item of items) {
    const productPrice = Number(item.productPrice || 0);
    const variantPrice = Number(item.variantPrice || 0);
    const addonsTotal = Number(item.addonsTotal || 0);
    const quantity = Number(item.quantity || 0);

    const unitPrice = productPrice + variantPrice + addonsTotal;
    const lineTotal = unitPrice * quantity;

    subtotal += lineTotal;
    totalQuantity += quantity;

    item.unitPrice = unitPrice;
    item.lineTotal = lineTotal;
  }

  return {
    items,
    subtotal,
    totalQuantity,
  };
};

const persistCart = (state) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      "customer_cart",
      JSON.stringify({
        items: state.items,
        subtotal: state.subtotal,
        totalQuantity: state.totalQuantity,
      })
    );
  }
};

const initialState = getInitialCart();

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const payload = action.payload;

      const cartKey = [
        payload.productId,
        payload.variantId,
        ...(payload.addonIds || []),
      ].join("-");

      const existingIndex = state.items.findIndex(
        (item) => item.cartKey === cartKey
      );

      if (existingIndex > -1) {
        state.items[existingIndex].quantity += payload.quantity || 1;
      } else {
        state.items.push({
          cartKey,
          productId: payload.productId,
          productName: payload.productName,
          productSlug: payload.productSlug || "",
          productImage: payload.productImage || "",
          productPrice: Number(payload.productPrice || 0),

          variantId: payload.variantId,
          variantName: payload.variantName || "",
          variantPrice: Number(payload.variantPrice || 0),

          addonIds: payload.addonIds || [],
          addons: payload.addons || [],
          addonsTotal: Number(payload.addonsTotal || 0),

          quantity: Number(payload.quantity || 1),
          unitPrice: 0,
          lineTotal: 0,
        });
      }

      const calculated = calculateCart(state.items);
      state.items = [...calculated.items];
      state.subtotal = calculated.subtotal;
      state.totalQuantity = calculated.totalQuantity;

      persistCart(state);
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (item) => item.cartKey !== action.payload
      );

      const calculated = calculateCart(state.items);
      state.items = [...calculated.items];
      state.subtotal = calculated.subtotal;
      state.totalQuantity = calculated.totalQuantity;

      persistCart(state);
    },

    increaseCartQty: (state, action) => {
      const item = state.items.find((i) => i.cartKey === action.payload);
      if (item) {
        item.quantity += 1;
      }

      const calculated = calculateCart(state.items);
      state.items = [...calculated.items];
      state.subtotal = calculated.subtotal;
      state.totalQuantity = calculated.totalQuantity;

      persistCart(state);
    },

    decreaseCartQty: (state, action) => {
      const item = state.items.find((i) => i.cartKey === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }

      const calculated = calculateCart(state.items);
      state.items = [...calculated.items];
      state.subtotal = calculated.subtotal;
      state.totalQuantity = calculated.totalQuantity;

      persistCart(state);
    },

    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.totalQuantity = 0;
      persistCart(state);
    },

    hydrateCartFromStorage: (state) => {
      const hydrated = getInitialCart();
      state.items = hydrated.items || [];
      state.subtotal = hydrated.subtotal || 0;
      state.totalQuantity = hydrated.totalQuantity || 0;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  increaseCartQty,
  decreaseCartQty,
  clearCart,
  hydrateCartFromStorage,
} = cartSlice.actions;

export default cartSlice.reducer;