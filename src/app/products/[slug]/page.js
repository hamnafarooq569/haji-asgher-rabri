"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import {
  fetchAllProducts,
  fetchProductBySlug,
} from "@/store/thunks/publicProductThunks";
import { addToCart } from "@/store/slices/cartSlice";
import Link from "next/link";

export default function ProductDetailPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();

  const slug = params?.slug;

  const publicProductsState = useSelector((state) => state.publicProducts || {});
  const {
    currentProduct = null,
    products = [],
    loading = false,
    error = null,
  } = publicProductsState;

  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (slug) {
      dispatch(fetchProductBySlug(slug));
    }

    if (!products?.length) {
      dispatch(fetchAllProducts());
    }
  }, [dispatch, slug]);

  useEffect(() => {
    if (currentProduct?.variants?.length > 0) {
      const firstActiveVariant =
        currentProduct.variants.find((v) => v.isActive) ||
        currentProduct.variants[0];

      setSelectedVariantId(firstActiveVariant?.id || null);
      setSelectedAddonIds([]);
      setQuantity(1);
    }
  }, [currentProduct]);

  const selectedVariant = useMemo(() => {
    return (
      currentProduct?.variants?.find((v) => v.id === selectedVariantId) || null
    );
  }, [currentProduct, selectedVariantId]);

  const normalizedAddons = useMemo(() => {
    if (!currentProduct?.addons) return [];
    return currentProduct.addons.map((addon) => ({
      id: addon.id,
      name: addon.name,
      price: Number(addon.price || 0),
      imageUrl: addon.imageUrl || "",
    }));
  }, [currentProduct]);

  const selectedAddons = useMemo(() => {
    return normalizedAddons.filter((addon) =>
      selectedAddonIds.includes(addon.id)
    );
  }, [normalizedAddons, selectedAddonIds]);

  const addonsTotal = useMemo(() => {
    return selectedAddons.reduce(
      (sum, addon) => sum + Number(addon.price || 0),
      0
    );
  }, [selectedAddons]);

  const relatedProducts = useMemo(() => {
    if (!currentProduct || !products?.length) return [];

    const currentCategoryId = currentProduct?.category?.id || null;

    const filtered = products.filter((product) => {
      if (!product?.slug || product.slug === currentProduct.slug) return false;
      if (product.availability && product.availability !== "AVAILABLE") {
        return false;
      }
      return true;
    });

    const sameCategory = filtered.filter(
      (product) => product?.category?.id === currentCategoryId
    );

    const otherProducts = filtered.filter(
      (product) => product?.category?.id !== currentCategoryId
    );

    return [...sameCategory, ...otherProducts].slice(0, 8);
  }, [products, currentProduct]);

  const productPrice = Number(currentProduct?.basePrice || 0);
  const variantPrice = Number(selectedVariant?.price || 0);
  const unitPrice = productPrice + variantPrice + addonsTotal;
  const lineTotal = unitPrice * quantity;

  const hasDescription = Boolean(currentProduct?.description?.trim());
  const hasAddons = normalizedAddons.length > 0;

  const handleToggleAddon = (addonId) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleAddToCart = () => {
    if (!currentProduct || !selectedVariant) return;

    dispatch(
      addToCart({
        productId: currentProduct.id,
        productName: currentProduct.name,
        productSlug: currentProduct.slug,
        productImage: currentProduct.imageUrl || "",
        productPrice,

        variantId: selectedVariant.id,
        variantName: selectedVariant.name,
        variantPrice,

        addonIds: selectedAddons.map((addon) => addon.id),
        addons: selectedAddons.map((addon) => ({
          id: addon.id,
          name: addon.name,
          price: Number(addon.price || 0),
        })),
        addonsTotal,

        quantity,
      })
    );

    router.push("/cart");
  };

  const getCardPrice = (product) => {
    const firstActiveVariant =
      product?.variants?.find((variant) => variant.isActive) ||
      product?.variants?.[0] ||
      null;

    return (
      Number(product?.basePrice || 0) + Number(firstActiveVariant?.price || 0)
    );
  };

  if (loading && !currentProduct) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <p>Loading product...</p>
        </div>
      </main>
    );
  }

  if (error && !currentProduct) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-red-400">{error}</p>
        </div>
      </main>
    );
  }

  if (!currentProduct) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <p>Product not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center rounded-xl border border-white/10 bg-[#111] px-4 py-2.5 text-sm font-medium text-white transition hover:border-red-500 hover:text-red-400"
          >
            ← Back to Store
          </Link>
        </div>

        <div className="mx-auto grid max-w-5xl items-stretch gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:min-h-[620px]">
          <div className="h-full min-h-[620px] overflow-hidden rounded-[28px] border border-white/10 bg-[#111]">
            {currentProduct.imageUrl ? (
              <div className="h-full w-full">
                <img
                  src={currentProduct.imageUrl}
                  alt={currentProduct.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-full min-h-[620px] w-full items-center justify-center bg-[#cf0f2f] text-white/40">
                No Image
              </div>
            )}
          </div>

          <div className="h-full min-h-[620px] w-full max-w-[420px] mx-auto rounded-[28px] border border-white/10 bg-[#111] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-8">
            <div className="border-b border-white/10 pb-6">
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                {currentProduct.name}
              </h1>

              {currentProduct.isSpecial && (
                <span className="mt-4 inline-flex rounded-full bg-red-600 px-3 py-1 text-sm font-medium text-white">
                  Special
                </span>
              )}

              {hasDescription && (
                <p className="mt-4 text-[15px] leading-7 text-white/65">
                  {currentProduct.description}
                </p>
              )}
            </div>

            <div className="space-y-8 pt-7">
              <div>
                <h2 className="mb-4 text-lg font-semibold text-white">
                  Select Variant
                </h2>

                <div className="space-y-3">
                  {currentProduct.variants?.map((variant) => (
                    <label
                      key={variant.id}
                      className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-4 transition ${
                        selectedVariantId === variant.id
                          ? "border-red-500 bg-black shadow-[0_0_0_1px_rgba(239,68,68,0.2)]"
                          : "border-white/10 bg-black hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="variant"
                          checked={selectedVariantId === variant.id}
                          onChange={() => setSelectedVariantId(variant.id)}
                          disabled={!variant.isActive}
                        />

                        <div>
                          <p className="font-medium text-white">{variant.name}</p>
                          <p className="text-xs text-white/45">
                            Stock: {variant.stock}
                          </p>
                        </div>
                      </div>

                      <p className="text-base font-semibold text-white">
                        Rs. {Number(variant.price || 0)}
                      </p>
                    </label>
                  ))}
                </div>
              </div>

              {hasAddons && (
                <div>
                  <h2 className="mb-4 text-lg font-semibold text-white">
                    Addons
                  </h2>

                  <div className="space-y-3">
                    {normalizedAddons.map((addon) => (
                      <label
                        key={addon.id}
                        className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-4 transition ${
                          selectedAddonIds.includes(addon.id)
                            ? "border-red-500 bg-black shadow-[0_0_0_1px_rgba(239,68,68,0.2)]"
                            : "border-white/10 bg-black hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedAddonIds.includes(addon.id)}
                            onChange={() => handleToggleAddon(addon.id)}
                          />
                          <span className="text-white">{addon.name}</span>
                        </div>

                        <span className="font-medium text-white">
                          Rs. {addon.price}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h2 className="mb-4 text-lg font-semibold text-white">
                  Quantity
                </h2>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black text-lg font-semibold transition hover:border-red-500"
                  >
                    -
                  </button>

                  <div className="flex h-12 min-w-[56px] items-center justify-center rounded-xl border border-white/10 bg-black px-4 text-lg font-semibold text-white">
                    {quantity}
                  </div>

                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black text-lg font-semibold transition hover:border-red-500"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-white/45">
                      Final Price
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-white">
                      Total
                    </h2>
                  </div>

                  <span className="text-3xl font-bold text-white">
                    Rs. {lineTotal}
                  </span>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={
                  currentProduct.availability !== "AVAILABLE" || !selectedVariant
                }
                className="w-full rounded-2xl bg-red-600 px-4 py-4 text-lg font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16 border-t border-white/10 pt-10">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white">More Products</h2>
                <p className="mt-2 text-sm text-white/55">
                  Explore more items you may like.
                </p>
              </div>

              <Link
                href="/"
                className="hidden rounded-xl border border-white/10 bg-[#111] px-4 py-2 text-sm font-medium text-white transition hover:border-red-500 hover:text-red-400 md:inline-flex"
              >
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
              {relatedProducts.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-[22px] border border-white/10 bg-[#111] p-3 shadow-[0_12px_35px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-red-500/40"
                >
                  <Link href={`/products/${product.slug}`}>
                    <div className="overflow-hidden rounded-[16px] bg-[#0d0d0d]">
                      {product.imageUrl ? (
                        <div className="aspect-square w-full">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-square w-full items-center justify-center text-white/40">
                          No Image
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="pt-4">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="min-h-[48px] text-sm font-semibold leading-6 text-white transition group-hover:text-red-400 md:text-base">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white md:text-sm">
                        Rs. {getCardPrice(product)}
                      </span>

                      <Link
                        href={`/products/${product.slug}`}
                        className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-500 md:text-sm"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}