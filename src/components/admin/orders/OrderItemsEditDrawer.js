"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Trash2 } from "lucide-react";

const formatCurrency = (amount) => `PKR ${Number(amount || 0).toLocaleString()}`;

export default function OrderItemsEditDrawer({
  isOpen,
  order,
  products = [],
  onClose,
  onSubmit,
  loading = false,
}) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    if (!order) return;

    const mappedItems =
      order?.items?.map((item, index) => ({
        localId: `${item?.id || index}`,
        productId: item?.productId || item?.product?.id || null,
        productName: item?.productName || item?.product?.name || "Product",
        variantId: item?.variantId || item?.variant?.id || null,
        variantName: item?.variantName || item?.variant?.name || "Variant",
        quantity: Number(item?.quantity || 1),
        unitPrice: Number(item?.unitPrice || item?.priceAtPurchase || 0),
        lineTotal:
          Number(item?.lineTotal || 0) ||
          Number(item?.quantity || 1) *
            Number(item?.unitPrice || item?.priceAtPurchase || 0),
        addonIds: Array.isArray(item?.addons)
          ? item.addons
              .map((addon) => addon?.addonId || addon?.id)
              .filter(Boolean)
          : [],
        addons: Array.isArray(item?.addons) ? item.addons : [],
      })) || [];

    setSelectedItems(mappedItems);
  }, [order]);

  const normalizedProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    return products.map((product) => {
      const variants = Array.isArray(product?.variants) ? product.variants : [];
      const firstVariant = variants[0];

      return {
        id: product?.id,
        name: product?.name,
        type: product?.category?.name || product?.type?.name || "Product",
        image: product?.image || product?.thumbnail || "",
        price:
          Number(firstVariant?.price || 0) + Number(product?.basePrice || 0),
        basePrice: Number(product?.basePrice || 0),
        variants,
        firstVariant,
      };
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    return normalizedProducts.filter((product) =>
      product?.name?.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [normalizedProducts, productSearch]);

  const subtotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
  }, [selectedItems]);

  const total = subtotal;

  const handleAddProduct = (product) => {
    if (!product?.id || !product?.firstVariant?.id) return;

    const variantStock = Number(product.firstVariant.stock || 0);

    const existingIndex = selectedItems.findIndex(
      (item) =>
        Number(item.productId) === Number(product.id) &&
        Number(item.variantId) === Number(product.firstVariant.id)
    );

    const unitPrice =
      Number(product.basePrice || 0) +
      Number(product.firstVariant?.price || 0);

    if (existingIndex !== -1) {
      const updated = [...selectedItems];
      const currentQty = Number(updated[existingIndex].quantity || 0);

      if (currentQty >= variantStock) {
        alert("Stock limit reached");
        return;
      }

      const newQty = currentQty + 1;

      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        lineTotal: unitPrice * newQty,
      };

      setSelectedItems(updated);
      return;
    }

    if (variantStock <= 0) {
      alert("Out of stock");
      return;
    }

    setSelectedItems((prev) => [
      ...prev,
      {
        localId: `new-${product.id}-${product.firstVariant.id}-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        variantId: product.firstVariant.id,
        variantName: product.firstVariant.name || "Default Variant",
        quantity: 1,
        unitPrice,
        lineTotal: unitPrice,
        addonIds: [],
        addons: [],
      },
    ]);
  };

  const handleQuantityChange = (localId, value) => {
    const quantity = Math.max(1, Number(value || 1));

    setSelectedItems((prev) =>
      prev.map((item) => {
        if (item.localId !== localId) return item;

        const product = normalizedProducts.find(
          (p) => p.id === item.productId
        );

        const variant = product?.variants?.find(
          (v) => v.id === item.variantId
        );

        const stock = Number(variant?.stock || 0);

        if (quantity > stock) {
          alert(`Only ${stock} items available in stock`);
          return item;
        }

        return {
          ...item,
          quantity,
          lineTotal: Number(item.unitPrice || 0) * quantity,
        };
      })
    );
  };

  const handleRemoveItem = (localId) => {
    setSelectedItems((prev) => prev.filter((item) => item.localId !== localId));
  };

  const handleSubmit = () => {
    const payloadItems = selectedItems.map((item) => ({
      productId: Number(item.productId),
      variantId: Number(item.variantId),
      quantity: Number(item.quantity),
      addonIds: Array.isArray(item.addonIds) ? item.addonIds : [],
    }));

    onSubmit?.(payloadItems);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-black/40">
      <div className="h-full w-full max-w-[1200px] overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Order Items Edit
            </h2>
            <p className="text-sm text-slate-500">
              Update selected items and browse products
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Code
            </label>
            <input
              type="text"
              value={order?.orderNumber || ""}
              disabled
              className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="mb-4 rounded-lg bg-slate-50 px-4 py-3">
                <h3 className="text-xl font-semibold text-slate-900">Item List</h3>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <div className="text-lg font-semibold text-slate-900">
                  Product Added{" "}
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-sm text-amber-700">
                    {selectedItems.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedItems([])}
                  className="text-sm font-medium text-rose-600"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-[420px] space-y-4 overflow-y-auto pr-2">
                {selectedItems.length > 0 ? (
                  selectedItems.map((item) => (
                    <div
                      key={item.localId}
                      className="rounded-lg border-l-4 border-amber-400 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-slate-900">
                            {item.productName}
                          </h4>

                          <p className="mt-1 text-sm text-slate-500">
                            {item.variantName}
                          </p>

                          <div className="mt-3 flex items-center gap-3">
                            <label className="text-sm text-slate-600">Qty</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(item.localId, e.target.value)
                              }
                              className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            />
                          </div>

                          <p className="mt-3 text-sm text-slate-600">
                            Unit Price: {formatCurrency(item.unitPrice)}
                          </p>
                        </div>

                        <div className="text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.localId)}
                            className="mb-3 rounded-full bg-rose-50 p-2 text-rose-600"
                            title="Remove"
                          >
                            <Trash2 size={15} />
                          </button>

                          <p className="text-lg font-semibold text-slate-900">
                            {formatCurrency(item.lineTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                    No selected items
                  </div>
                )}
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between py-2 text-slate-700">
                  <span>Sub Total</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between py-2 text-lg font-semibold text-slate-900">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>

                <div className="mt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {loading ? "Saving..." : "Submit"}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-2xl font-semibold text-slate-900">Products</h3>

              <div className="mb-4">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search By Name"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-3 flex h-36 items-center justify-center rounded-lg bg-slate-100">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full rounded-lg object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">Product Image</span>
                      )}
                    </div>

                    <p className="text-sm text-slate-400">Type : {product.type}</p>
                    <h4 className="min-h-[48px] text-lg font-semibold text-slate-900">
                      {product.name}
                    </h4>
                    <p className="mt-2 text-lg font-semibold text-indigo-500">
                      {formatCurrency(product.price)}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleAddProduct(product)}
                      disabled={!product.firstVariant}
                      className="mt-3 w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      Add To Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}