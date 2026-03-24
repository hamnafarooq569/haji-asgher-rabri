"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts } from "@/store/thunks/publicProductThunks";
import { hydrateCartFromStorage } from "@/store/slices/cartSlice";
import {
  FaBars,
  FaShoppingCart,
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaUser,
  FaTimes,
  FaMapMarkerAlt,
} from "react-icons/fa";

const heroSlides = [
  {
    id: 1,
    titleTop: "FEAST OF",
    titleBottom: "FLAVOURS",
    bg: "bg-[#e8dece]",
    pattern: true,
    imageLayout: "food",
  },
  {
    id: 2,
    titleTop: "HOT, FRESH",
    titleBottom: "& IRRESISTIBLE",
    bg: "bg-[linear-gradient(135deg,#7f0d1f_0%,#b30f2b_45%,#7a081b_100%)]",
    pattern: false,
    imageLayout: "red",
  },
];

export default function HomePage() {
  const dispatch = useDispatch();

  const publicProductsState = useSelector((state) => state.publicProducts || {});
  const { products = [], loading = false, error = null } = publicProductsState;

  const cartState = useSelector((state) => state.cart || {});
  const { totalQuantity = 0 } = cartState;

  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryFixed, setIsCategoryFixed] = useState(false);

  const categorySentinelRef = useRef(null);
  const sectionRefs = useRef({});

  const TOP_BAR_HEIGHT = 80;
  const CATEGORY_BAR_HEIGHT = 68;
  const STICKY_OFFSET = TOP_BAR_HEIGHT + CATEGORY_BAR_HEIGHT;
  const CONTENT_MAX_WIDTH = "max-w-[1400px]";

  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(hydrateCartFromStorage());
    setMounted(true);
  }, [dispatch]);

  useEffect(() => {
    const handleCategoryStick = () => {
      if (!categorySentinelRef.current) return;
      const rect = categorySentinelRef.current.getBoundingClientRect();
      setIsCategoryFixed(rect.top <= TOP_BAR_HEIGHT);
    };

    handleCategoryStick();
    window.addEventListener("scroll", handleCategoryStick);
    window.addEventListener("resize", handleCategoryStick);

    return () => {
      window.removeEventListener("scroll", handleCategoryStick);
      window.removeEventListener("resize", handleCategoryStick);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const groupedProducts = useMemo(() => {
    const grouped = {};

    for (const product of products) {
      const categoryName = product?.category?.name || "Other";

      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }

      grouped[categoryName].push(product);
    }

    return grouped;
  }, [products]);

  const categories = useMemo(() => Object.keys(groupedProducts), [groupedProducts]);

  useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    const handleScroll = () => {
      let currentCategory = activeCategory;
      const checkLine = STICKY_OFFSET + 20;

      for (const category of categories) {
        const section = sectionRefs.current[category];
        if (!section) continue;

        const rect = section.getBoundingClientRect();

        if (rect.top <= checkLine && rect.bottom >= checkLine) {
          currentCategory = category;
          break;
        }
      }

      if (currentCategory !== activeCategory) {
        setActiveCategory(currentCategory);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories, activeCategory, STICKY_OFFSET]);

  const handleScrollToCategory = (categoryName) => {
    setActiveCategory(categoryName);
    setIsMenuOpen(false);

    const section = sectionRefs.current[categoryName];
    if (section) {
      const top =
        section.getBoundingClientRect().top +
        window.scrollY -
        TOP_BAR_HEIGHT -
        CATEGORY_BAR_HEIGHT -
        12;

      window.scrollTo({
        top,
        behavior: "smooth",
      });
    }
  };

  const getDisplayPrice = (product) => {
    const activeVariant =
      product?.variants?.find((variant) => variant.isActive) ||
      product?.variants?.[0] ||
      null;

    return (
      Number(product?.basePrice || 0) + Number(activeVariant?.price || 0)
    ).toFixed(2);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="px-6 py-10 text-white/70">Loading menu...</div>
      </main>
    );
  }

  const activeHero = heroSlides[currentSlide];

  return (
    <main className="min-h-screen bg-[#060606] text-white">
      <div className="flex min-h-screen items-stretch">
        <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[82px] bg-[#151515] lg:block">
          <div className="flex h-full w-full flex-col items-center py-5">
            <button className="mb-6 mt-2 flex h-[70px] w-[70px] flex-col items-center justify-center rounded-full bg-[#d8102f] text-white shadow-lg transition hover:scale-105">
              <FaBars className="text-[22px]" />
              <span className="mt-[2px] text-[13px] font-semibold leading-none">
                Menu
              </span>
            </button>

            <Link
              href="/cart"
              className="relative mb-8 flex flex-col items-center text-white"
            >
              <FaShoppingCart className="text-[26px]" />
              {totalQuantity > 0 && (
                <span className="absolute left-[28px] top-[-6px] flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d8102f] px-1 text-[10px] font-bold">
                  {totalQuantity}
                </span>
              )}
              <span className="mt-1 text-[13px]">Cart</span>
            </Link>

            <div className="flex flex-col items-center gap-8 text-white">
              <FaFacebookF className="cursor-pointer text-[24px] transition hover:scale-110 hover:text-[#d8102f]" />
              <FaInstagram className="cursor-pointer text-[24px] transition hover:scale-110 hover:text-[#d8102f]" />
              <FaWhatsapp className="cursor-pointer text-[24px] transition hover:scale-110 hover:text-[#d8102f]" />
            </div>

            <Link
              href="/profile/account"
              className="mb-4 mt-auto flex flex-col items-center text-white"
            >
              <FaUser className="text-[26px]" />
              <span className="mt-1 text-[13px]">Profile</span>
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1 bg-[#050505] lg:ml-[82px]">
          <header className="fixed left-0 top-0 z-[60] w-full bg-[#151515] lg:left-[82px] lg:w-[calc(100%-82px)]">
            <div className="flex h-[80px] items-center justify-between gap-3 px-4 md:px-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d8102f] text-white lg:hidden"
                >
                  <FaBars className="text-[18px]" />
                </button>

                <img
                  src="/Logo_new.png"
                  alt="Zenab Kebab"
                  className="h-12 w-auto object-contain md:h-14"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 text-white md:flex">
                  <FaMapMarkerAlt className="text-[20px]" />
                  <span className="text-[18px] font-medium">Pickup</span>
                </div>

                <div className="rounded-2xl bg-[#d8102f] px-4 py-2 text-[13px] font-semibold text-white md:px-5 md:py-3 md:text-[18px]">
                  Iqbal Plaza, Nagan Chowrang, Karachi
                </div>
              </div>
            </div>
          </header>

          <div className="pt-[80px]">
            <div
              className={`fixed inset-0 z-[100] lg:hidden ${
                isMenuOpen ? "pointer-events-auto" : "pointer-events-none"
              }`}
            >
              <div
                onClick={() => setIsMenuOpen(false)}
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
                  isMenuOpen ? "opacity-100" : "opacity-0"
                }`}
              />

              <div
                className={`relative z-10 flex h-full w-[280px] flex-col bg-[#151515] p-5 text-white transition-transform duration-300 ${
                  isMenuOpen ? "translate-x-0" : "-translate-x-full"
                }`}
              >
                <div className="mb-6 flex items-center justify-between">
                  <img
                    src="/Logo_new.png"
                    alt="Zenab Kebab"
                    className="h-10 w-auto object-contain"
                  />

                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#222] text-white"
                  >
                    <FaTimes className="text-[18px]" />
                  </button>
                </div>

                <button className="mb-6 flex h-[64px] w-[64px] flex-col items-center justify-center rounded-full bg-[#d8102f] text-white shadow-lg">
                  <FaBars className="text-[20px]" />
                  <span className="mt-[2px] text-[12px] font-semibold leading-none">
                    Menu
                  </span>
                </button>

                <div className="mb-8">
                  <p className="mb-3 text-[12px] uppercase tracking-[0.2em] text-white/50">
                    Categories
                  </p>

                  <div className="flex flex-col gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleScrollToCategory(category)}
                        className={`rounded-xl px-4 py-3 text-left text-[14px] font-medium uppercase transition ${
                          activeCategory === category
                            ? "bg-[#d8102f] text-white"
                            : "bg-[#1d1d1f] text-white"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <Link
                  href="/cart"
                  onClick={() => setIsMenuOpen(false)}
                  className="mb-4 flex items-center gap-3 rounded-xl bg-[#1d1d1f] px-4 py-3"
                >
                  <FaShoppingCart className="text-[18px]" />
                  <span className="text-[15px]">Cart ({totalQuantity})</span>
                </Link>

                <Link
                  href="/profile/account"
                  onClick={() => setIsMenuOpen(false)}
                  className="mb-6 flex items-center gap-3 rounded-xl bg-[#1d1d1f] px-4 py-3"
                >
                  <FaUser className="text-[18px]" />
                  <span className="text-[15px]">Profile</span>
                </Link>

                <div className="mt-auto flex items-center gap-5 text-white">
                  <FaFacebookF className="cursor-pointer text-[22px]" />
                  <FaInstagram className="cursor-pointer text-[22px]" />
                  <FaWhatsapp className="cursor-pointer text-[22px]" />
                </div>
              </div>
            </div>

            <section className="px-4 pb-4 pt-4 md:px-6">
              <div className={`mx-auto w-full ${CONTENT_MAX_WIDTH}`}>
                <div className="relative px-8 md:px-12">
                  <button
                    onClick={prevSlide}
                    className="absolute left-[-28px] top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#d8102f] text-[28px] text-white shadow-lg transition hover:scale-105 md:h-16 md:w-16 md:text-[34px]"
                  >
                    ‹
                  </button>

                  <button
                    onClick={nextSlide}
                    className="absolute right-[-28px] top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#d8102f] text-[28px] text-white shadow-lg transition hover:scale-105 md:h-16 md:w-16 md:text-[34px]"
                  >
                    ›
                  </button>

                  <div className="overflow-hidden rounded-[28px] bg-[#121212]">
                    <div
                      className={`relative min-h-[240px] w-full overflow-hidden rounded-[28px] transition-all duration-500 ${activeHero.bg} md:min-h-[410px]`}
                    >
                      {activeHero.pattern && (
                        <div
                          className="absolute inset-0 opacity-40"
                          style={{
                            backgroundImage:
                              "radial-gradient(circle at 20px 20px, rgba(120,94,59,0.13) 2px, transparent 2px)",
                            backgroundSize: "80px 80px",
                          }}
                        />
                      )}

                      {activeHero.imageLayout === "food" ? (
                        <>
                          <div className="absolute left-[4%] top-[18%] z-10">
                            <div className="h-[130px] w-[130px] rounded-full bg-[#d39135] shadow-[0_18px_30px_rgba(0,0,0,0.25)] md:h-[230px] md:w-[230px]" />
                          </div>

                          <div className="absolute right-[21%] top-[18%] z-20 hidden md:block">
                            <div className="h-[150px] w-[150px] rounded-[26px] bg-[#8c4a20] shadow-[0_18px_30px_rgba(0,0,0,0.25)]" />
                          </div>

                          <div className="absolute right-[6%] top-[26%] z-20">
                            <div className="h-[120px] w-[120px] rounded-full bg-[#8a451f] shadow-[0_18px_30px_rgba(0,0,0,0.25)] md:h-[210px] md:w-[210px]" />
                          </div>

                          <div className="absolute right-[28%] bottom-[16%] z-20 hidden md:block">
                            <div className="h-[110px] w-[160px] rounded-[18px] bg-[#7d3418] shadow-[0_18px_30px_rgba(0,0,0,0.25)]" />
                          </div>

                          <div className="absolute inset-y-0 left-[7%] flex items-center">
                            <div>
                              <div className="heading-font text-[42px] font-black uppercase leading-none tracking-tight text-[#d6102d] [text-shadow:4px_4px_0_rgba(0,0,0,0.7)] md:text-[86px]">
                                {activeHero.titleTop}
                              </div>
                              <div className="heading-font text-[56px] font-black uppercase leading-none tracking-tight text-[#d6102d] [text-shadow:4px_4px_0_rgba(0,0,0,0.7)] md:text-[120px]">
                                {activeHero.titleBottom}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            className="absolute inset-0 opacity-20"
                            style={{
                              backgroundImage:
                                "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px)",
                              backgroundSize: "80px 100%",
                            }}
                          />
                          <div className="absolute left-[-70px] top-[-40px] h-[230px] w-[230px] rounded-full bg-[#e3a12b] blur-[2px] md:h-[360px] md:w-[360px]" />
                          <div className="absolute right-[-60px] bottom-[-50px] h-[220px] w-[220px] rounded-full bg-[#8b2a18] md:h-[360px] md:w-[360px]" />

                          <div className="relative z-10 flex min-h-[240px] items-center justify-center px-6 text-center md:min-h-[410px]">
                            <div>
                              <div className="heading-font text-[34px] font-black uppercase leading-none tracking-tight text-white/25 md:text-[86px]">
                                {activeHero.titleTop}
                              </div>
                              <div className="heading-font mt-1 text-[42px] font-black uppercase leading-none tracking-tight text-white md:text-[98px]">
                                {activeHero.titleBottom}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div ref={categorySentinelRef} className="h-px w-full" />

            {isCategoryFixed && <div className="h-[68px]" />}

            <section
              className={`bg-[#151515] px-4 py-3 md:px-6 ${
                isCategoryFixed
                  ? "fixed left-0 top-[80px] z-[55] w-full lg:left-[82px] lg:w-[calc(100%-82px)]"
                  : "relative"
              }`}
            >
              <div className={`mx-auto w-full ${CONTENT_MAX_WIDTH}`}>
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleScrollToCategory(category)}
                      className={`shrink-0 rounded-[14px] px-4 py-2 text-[11px] font-medium uppercase transition md:text-[16px] ${
                        activeCategory === category
                          ? "bg-[#d8102f] text-white"
                          : "bg-[#0f0f0f] text-white hover:bg-[#202020]"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="px-4 pb-16 pt-4 md:px-6">
              <div className={`mx-auto w-full ${CONTENT_MAX_WIDTH}`}>
                {loading && (
                  <div className="py-10 text-lg text-white/70">
                    Loading products...
                  </div>
                )}

                {error && <div className="py-10 text-lg text-red-400">{error}</div>}

                {!loading &&
                  !error &&
                  categories.map((category) => (
                    <section
                      key={category}
                      ref={(el) => {
                        sectionRefs.current[category] = el;
                      }}
                      className="scroll-mt-[160px] pb-10"
                    >
                      <div className="mb-8 border-t border-[#b30d28] pt-10">
                        <h2 className="heading-font text-[28px] font-black uppercase leading-none tracking-tight text-white md:text-[44px]">
                          {category}
                        </h2>
                      </div>

                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                        {groupedProducts[category]?.map((product) => (
                          <article
                            key={product.id}
                            className="overflow-hidden rounded-[18px] bg-[#1d1d1f] p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition hover:scale-[1.02]"
                          >
                            <Link href={`/products/${product.slug}`}>
                              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-[14px] bg-[#cf0f2f]">
                                {product.imageUrl ? (
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="h-full w-full object-cover transition duration-300 hover:scale-105"
                                  />
                                ) : (
                                  <div className="text-xs text-white/60">
                                    No Image
                                  </div>
                                )}
                              </div>
                            </Link>

                            <div className="px-1 pb-1 pt-3">
                              <Link href={`/products/${product.slug}`}>
                                <h3 className="min-h-[44px] text-center text-[14px] font-bold leading-snug text-white md:min-h-[52px] md:text-[18px] hover:text-[#ffccd5]">
                                  {product.name}
                                </h3>
                              </Link>

                              <div className="mt-4 flex items-end justify-between">
                                <Link
                                  href={`/products/${product.slug}`}
                                  className={`flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#d8102f] text-[24px] text-white transition hover:scale-105 md:h-[46px] md:w-[46px] ${
                                    product.availability !== "AVAILABLE"
                                      ? "pointer-events-none opacity-50"
                                      : ""
                                  }`}
                                >
                                  +
                                </Link>

                                <div className="rounded-[8px] bg-white px-3 py-1.5 text-[12px] font-bold text-[#1a1a1a] shadow md:text-[15px]">
                                  PKR{getDisplayPrice(product)}
                                </div>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        body {
          background: #050505;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}