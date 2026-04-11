import { createSlice } from "@reduxjs/toolkit";

const getEmptyCart = () => ({
  items: [],
  subtotal: 0,
  totalQuantity: 0,
});

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const getInitialCart = () => {
  if (typeof window === "undefined") {
    return getEmptyCart();
  }

  try {
    const saved = localStorage.getItem("customer_cart");
    if (!saved) {
      return getEmptyCart();
    }

    const parsed = JSON.parse(saved);
    return {
      items: Array.isArray(parsed?.items) ? parsed.items : [],
      subtotal: toNumber(parsed?.subtotal),
      totalQuantity: toNumber(parsed?.totalQuantity),
    };
  } catch {
    return getEmptyCart();
  }
};

const calculateCart = (items) => {
  let subtotal = 0;
  let totalQuantity = 0;

  const normalizedItems = items.map((item) => {
    const productPrice = toNumber(item.productPrice);
    const variantPrice = toNumber(item.variantPrice);
    const addonsTotal = toNumber(item.addonsTotal);
    const quantity = Math.max(1, toNumber(item.quantity));

    const unitPrice = productPrice + variantPrice + addonsTotal;
    const lineTotal = unitPrice * quantity;

    subtotal += lineTotal;
    totalQuantity += quantity;

    return {
      ...item,
      productPrice,
      variantPrice,
      addonsTotal,
      quantity,
      unitPrice,
      lineTotal,
    };
  });

  return {
    items: normalizedItems,
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

const initialHydrated = calculateCart(getInitialCart().items);

const initialState = {
  items: initialHydrated.items,
  subtotal: initialHydrated.subtotal,
  totalQuantity: initialHydrated.totalQuantity,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const payload = action.payload;

      const sortedAddonIds = [...(payload.addonIds || [])].sort((a, b) => a - b);

      const cartKey = [
        payload.productId,
        payload.variantId ?? "no-variant",
        ...sortedAddonIds,
      ].join("-");

      const existingIndex = state.items.findIndex(
        (item) => item.cartKey === cartKey
      );

      if (existingIndex > -1) {
        state.items[existingIndex].quantity += toNumber(payload.quantity || 1);
      } else {
        state.items.push({
          cartKey,
          productId: payload.productId,
          productName: payload.productName,
          productSlug: payload.productSlug || "",
          productImage: payload.productImage || "",
          productPrice: toNumber(payload.productPrice),

          variantId: payload.variantId ?? null,
          variantName: payload.variantName || "",
          variantPrice: toNumber(payload.variantPrice),

          addonIds: sortedAddonIds,
          addons: payload.addons || [],
          addonsTotal: toNumber(payload.addonsTotal),

          quantity: Math.max(1, toNumber(payload.quantity || 1)),
          unitPrice: 0,
          lineTotal: 0,
        });
      }

      const calculated = calculateCart(state.items);
      state.items = calculated.items;
      state.subtotal = calculated.subtotal;
      state.totalQuantity = calculated.totalQuantity;

      persistCart(state);
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (item) => item.cartKey !== action.payload
      );

      const calculated = calculateCart(state.items);
      state.items = calculated.items;
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
      state.items = calculated.items;
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
      state.items = calculated.items;
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
      const calculated = calculateCart(hydrated.items || []);
      state.items = calculated.items;
      state.subtotal = calculated.subtotal;
      state.totalQuantity = calculated.totalQuantity;
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