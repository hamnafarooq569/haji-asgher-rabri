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
    } else {
      setSelectedVariantId(null);
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
      <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-5 md:px-6 md:py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-white/70 sm:text-base">Loading product...</p>
        </div>
      </main>
    );
  }

  if (error && !currentProduct) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-5 md:px-6 md:py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-red-400 sm:text-base">{error}</p>
        </div>
      </main>
    );
  }

  if (!currentProduct) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-5 md:px-6 md:py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-white/70 sm:text-base">Product not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-3 py-6 text-white sm:px-4 sm:py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 sm:mb-6 md:mb-8">
          <Link
            href="/"
            className="inline-flex items-center rounded-xl border border-white/10 bg-[#111] px-3.5 py-2 text-xs font-medium text-white transition hover:border-red-500 hover:text-red-400 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            ← Back to Store
          </Link>
        </div>

        <div className="mx-auto grid max-w-6xl items-start gap-4 sm:gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:gap-6 xl:gap-8">
          <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#111] sm:rounded-[24px] md:rounded-[28px]">
            {currentProduct.imageUrl ? (
              <div className="aspect-[4/4] w-full sm:aspect-[5/4] md:aspect-[6/5] lg:aspect-auto lg:min-h-[620px]">
                <img
                  src={currentProduct.imageUrl}
                  alt={currentProduct.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[4/4] w-full items-center justify-center bg-[#cf0f2f] text-sm text-white/40 sm:aspect-[5/4] md:text-base lg:min-h-[620px]">
                No Image
              </div>
            )}
          </div>

          <div className="w-full rounded-[22px] border border-white/10 bg-[#111] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:rounded-[24px] sm:p-5 md:rounded-[28px] md:p-6 lg:min-h-[620px] lg:p-7 xl:p-8">
            <div className="border-b border-white/10 pb-5 sm:pb-6">
              <h1 className="text-[28px] font-bold leading-tight sm:text-[34px] md:text-[40px] lg:text-[46px]">
                {currentProduct.name}
              </h1>

              {currentProduct.isSpecial && (
                <span className="mt-3 inline-flex rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white sm:mt-4 sm:text-sm">
                  Special
                </span>
              )}

              {hasDescription && (
                <p className="mt-3 text-sm leading-6 text-white/65 sm:mt-4 sm:text-[15px] sm:leading-7">
                  {currentProduct.description}
                </p>
              )}
            </div>

            <div className="space-y-6 pt-5 sm:space-y-7 sm:pt-6 md:space-y-8 md:pt-7">
              <div>
                <h2 className="mb-3 text-base font-semibold text-white sm:mb-4 sm:text-lg">
                  Select Variant
                </h2>

                <div className="space-y-3">
                  {currentProduct.variants?.map((variant) => (
                    <label
                      key={variant.id}
                      className={`flex cursor-pointer flex-col gap-3 rounded-2xl border px-4 py-3.5 transition sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-4 ${
                        selectedVariantId === variant.id
                          ? "border-red-500 bg-black shadow-[0_0_0_1px_rgba(239,68,68,0.2)]"
                          : "border-white/10 bg-black hover:border-white/20"
                      } ${!variant.isActive ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-start gap-3 sm:items-center">
                        <input
                          type="radio"
                          name="variant"
                          checked={selectedVariantId === variant.id}
                          onChange={() => setSelectedVariantId(variant.id)}
                          disabled={!variant.isActive}
                          className="mt-1 sm:mt-0"
                        />

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white sm:text-base">
                            {variant.name}
                          </p>
                          <p className="text-xs text-white/45">
                            Stock: {variant.stock}
                            {!variant.isActive ? " • Unavailable" : ""}
                          </p>
                        </div>
                      </div>

                      <p className="pl-6 text-sm font-semibold text-white sm:pl-0 sm:text-base">
                        Rs. {Number(variant.price || 0)}
                      </p>
                    </label>
                  ))}
                </div>
              </div>

              {hasAddons && (
                <div>
                  <h2 className="mb-3 text-base font-semibold text-white sm:mb-4 sm:text-lg">
                    Addons
                  </h2>

                  <div className="space-y-3">
                    {normalizedAddons.map((addon) => (
                      <label
                        key={addon.id}
                        className={`flex cursor-pointer flex-col gap-3 rounded-2xl border px-4 py-3.5 transition sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-4 ${
                          selectedAddonIds.includes(addon.id)
                            ? "border-red-500 bg-black shadow-[0_0_0_1px_rgba(239,68,68,0.2)]"
                            : "border-white/10 bg-black hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-start gap-3 sm:items-center">
                          <input
                            type="checkbox"
                            checked={selectedAddonIds.includes(addon.id)}
                            onChange={() => handleToggleAddon(addon.id)}
                            className="mt-1 sm:mt-0"
                          />
                          <span className="text-sm text-white sm:text-base">
                            {addon.name}
                          </span>
                        </div>

                        <span className="pl-6 text-sm font-medium text-white sm:pl-0 sm:text-base">
                          Rs. {addon.price}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h2 className="mb-3 text-base font-semibold text-white sm:mb-4 sm:text-lg">
                  Quantity
                </h2>

                <div className="flex items-center gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black text-lg font-semibold transition hover:border-red-500 sm:h-12 sm:w-12"
                  >
                    -
                  </button>

                  <div className="flex h-11 min-w-[54px] items-center justify-center rounded-xl border border-white/10 bg-black px-4 text-base font-semibold text-white sm:h-12 sm:min-w-[58px] sm:text-lg">
                    {quantity}
                  </div>

                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black text-lg font-semibold transition hover:border-red-500 sm:h-12 sm:w-12"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/45 sm:text-sm">
                      Final Price
                    </p>
                    <h2 className="mt-1 text-base font-semibold text-white sm:text-lg">
                      Total
                    </h2>
                  </div>

                  <span className="text-2xl font-bold text-white sm:text-3xl md:text-[32px]">
                    Rs. {lineTotal}
                  </span>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={
                  currentProduct.availability !== "AVAILABLE" || !selectedVariant
                }
                className="w-full rounded-2xl bg-red-600 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50 sm:py-4 sm:text-lg"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-12 border-t border-white/10 pt-8 sm:mt-14 sm:pt-9 md:mt-16 md:pt-10">
            <div className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between md:mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white sm:text-[28px] md:text-3xl">
                  More Products
                </h2>
                <p className="mt-2 text-xs text-white/55 sm:text-sm">
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

            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-5 xl:grid-cols-4">
              {relatedProducts.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-[18px] border border-white/10 bg-[#111] p-2.5 shadow-[0_12px_35px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-red-500/40 sm:rounded-[20px] sm:p-3 md:rounded-[22px]"
                >
                  <Link href={`/products/${product.slug}`}>
                    <div className="overflow-hidden rounded-[14px] bg-[#0d0d0d] sm:rounded-[16px]">
                      {product.imageUrl ? (
                        <div className="aspect-square w-full">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-square w-full items-center justify-center text-xs text-white/40 sm:text-sm">
                          No Image
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="pt-3 sm:pt-4">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="min-h-[40px] text-xs font-semibold leading-5 text-white transition group-hover:text-red-400 sm:min-h-[46px] sm:text-sm sm:leading-6 md:min-h-[48px] md:text-base">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                      <span className="inline-flex w-fit rounded-lg bg-black px-3 py-2 text-[11px] font-semibold text-white sm:text-xs md:text-sm">
                        Rs. {getCardPrice(product)}
                      </span>

                      <Link
                        href={`/products/${product.slug}`}
                        className="inline-flex w-full items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-[11px] font-semibold text-white transition hover:bg-red-500 sm:w-auto sm:text-xs md:text-sm"
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