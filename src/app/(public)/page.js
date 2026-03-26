"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts } from "@/store/thunks/publicProductThunks";
import { hydrateCartFromStorage } from "@/store/slices/cartSlice";

const heroImages = ["/banner1.png", "/banner2.png", "/banner3.png"];

export default function HomePage() {
  const dispatch = useDispatch();

  const publicProductsState = useSelector(
    (state) => state.publicProducts || {}
  );
  const { products = [], loading = false, error = null } = publicProductsState;

  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [isCategoryFixed, setIsCategoryFixed] = useState(false);

  const categorySentinelRef = useRef(null);
  const sectionRefs = useRef({});

  const TOP_BAR_HEIGHT = 80;
  const CATEGORY_BAR_HEIGHT = 68;
  const STICKY_OFFSET = TOP_BAR_HEIGHT + CATEGORY_BAR_HEIGHT;
  const CONTENT_MAX_WIDTH = "max-w-[1440px]";

  const sliderImages = [
    heroImages[heroImages.length - 1],
    ...heroImages,
    heroImages[0],
  ];

  const [currentSlide, setCurrentSlide] = useState(1);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(hydrateCartFromStorage());
    setMounted(true);
  }, [dispatch]);

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

  const categories = useMemo(
    () => Object.keys(groupedProducts),
    [groupedProducts]
  );

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
    if (isHovered) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => prev + 1);
    }, 3500);

    return () => clearInterval(interval);
  }, [isHovered]);

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
  }, [activeCategory, categories, STICKY_OFFSET]);

  useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const handleScrollToCategory = (categoryName) => {
    setActiveCategory(categoryName);

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

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => prev - 1);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => prev + 1);
  };

  const goToRealSlide = (index) => {
    setCurrentSlide(index + 1);
  };

  const handleTransitionEnd = () => {
    if (currentSlide === 0) {
      setIsAnimating(false);
      setCurrentSlide(heroImages.length);
    } else if (currentSlide === heroImages.length + 1) {
      setIsAnimating(false);
      setCurrentSlide(1);
    }
  };

  useEffect(() => {
    if (!isAnimating) {
      const id = requestAnimationFrame(() => {
        const second = requestAnimationFrame(() => {
          setIsAnimating(true);
        });
        return () => cancelAnimationFrame(second);
      });
      return () => cancelAnimationFrame(id);
    }
  }, [isAnimating]);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      goToNextSlide();
    } else if (distance < -minSwipeDistance) {
      goToPrevSlide();
    }
  };

  const activeDotIndex =
    currentSlide === 0
      ? heroImages.length - 1
      : currentSlide === heroImages.length + 1
      ? 0
      : currentSlide - 1;

  if (!mounted) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="px-4 py-8 text-sm text-white/70 sm:px-6 sm:py-10 sm:text-base">
          Loading menu...
        </div>
      </main>
    );
  }

  return (
    <>
      <section className="px-3 pb-4 pt-3 sm:px-4 md:px-6 md:pb-5 md:pt-4">
        <div className={`mx-auto w-full ${CONTENT_MAX_WIDTH}`}>
          <div
            className="relative overflow-hidden rounded-[18px] bg-[#121212] sm:rounded-[22px] md:rounded-[28px]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              onTransitionEnd={handleTransitionEnd}
              className={`flex ${
                isAnimating
                  ? "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  : ""
              }`}
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
            >
              {sliderImages.map((img, index) => (
                <div
                  key={`${img}-${index}`}
                  className="relative w-full shrink-0 overflow-hidden"
                >
                  <img
                    src={img}
                    alt={`Banner ${index + 1}`}
                    className="h-[170px] w-full object-cover sm:h-[220px] md:h-[300px] lg:h-[380px] xl:h-[420px]"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={goToPrevSlide}
              className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#d8102f] text-[22px] text-white shadow-lg transition hover:scale-105 hover:bg-[#be0d29] sm:left-3 sm:h-10 sm:w-10 sm:text-[24px] md:h-12 md:w-12 md:text-[28px] lg:h-14 lg:w-14 lg:text-[34px]"
            >
              ‹
            </button>

            <button
              onClick={goToNextSlide}
              className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#d8102f] text-[22px] text-white shadow-lg transition hover:scale-105 hover:bg-[#be0d29] sm:right-3 sm:h-10 sm:w-10 sm:text-[24px] md:h-12 md:w-12 md:text-[28px] lg:h-14 lg:w-14 lg:text-[34px]"
            >
              ›
            </button>

            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 sm:bottom-4 sm:gap-2">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToRealSlide(index)}
                  className={`rounded-full transition-all duration-300 ${
                    activeDotIndex === index
                      ? "h-2.5 w-6 bg-[#d8102f] sm:w-7"
                      : "h-2.5 w-2.5 bg-white/50 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div ref={categorySentinelRef} className="h-px w-full" />

      {isCategoryFixed && <div className="h-[68px]" />}

      <section
        className={`bg-[#151515] px-3 py-3 sm:px-4 md:px-6 ${
          isCategoryFixed
            ? "fixed left-0 top-[80px] z-[55] w-full lg:left-[78px] lg:w-[calc(100%-78px)] xl:left-[82px] xl:w-[calc(100%-82px)]"
            : "relative"
        }`}
      >
        <div className={`mx-auto w-full ${CONTENT_MAX_WIDTH}`}>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar sm:gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleScrollToCategory(category)}
                className={`shrink-0 rounded-[12px] px-3 py-2 text-[10px] font-semibold uppercase tracking-wide transition sm:rounded-[14px] sm:px-4 sm:text-[11px] md:px-5 md:text-[14px] lg:text-[16px] ${
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

      <section className="px-3 pb-12 pt-4 sm:px-4 sm:pb-14 md:px-6 md:pb-16">
        <div className={`mx-auto w-full ${CONTENT_MAX_WIDTH}`}>
          {loading && (
            <div className="py-8 text-base text-white/70 sm:py-10 sm:text-lg">
              Loading products...
            </div>
          )}

          {error && (
            <div className="py-8 text-base text-red-400 sm:py-10 sm:text-lg">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            categories.map((category) => (
              <section
                key={category}
                ref={(el) => {
                  sectionRefs.current[category] = el;
                }}
                className="scroll-mt-[160px] pb-8 sm:pb-10"
              >
                <div className="mb-5 border-t border-[#b30d28] pt-7 sm:mb-6 sm:pt-8 md:mb-8 md:pt-10">
                  <h2 className="heading-font text-[22px] font-black uppercase leading-none tracking-tight text-white sm:text-[28px] md:text-[36px] lg:text-[44px]">
                    {category}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:gap-5 2xl:grid-cols-5">
                  {groupedProducts[category]?.map((product) => (
                    <article
                      key={product.id}
                      className="overflow-hidden rounded-[16px] bg-[#1d1d1f] p-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition hover:scale-[1.02] sm:rounded-[18px] sm:p-3 md:p-3.5"
                    >
                      <Link href={`/products/${product.slug}`}>
                        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-[12px] bg-[#cf0f2f] sm:rounded-[14px]">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover transition duration-300 hover:scale-105"
                            />
                          ) : (
                            <div className="text-[10px] text-white/60 sm:text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="px-0.5 pb-0.5 pt-3 sm:px-1 sm:pt-3.5">
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="min-h-[38px] text-center text-[12px] font-bold leading-snug text-white hover:text-[#ffccd5] sm:min-h-[42px] sm:text-[13px] md:min-h-[48px] md:text-[15px] lg:min-h-[52px] lg:text-[18px]">
                            {product.name}
                          </h3>
                        </Link>

                        <div className="mt-4 flex items-center justify-between gap-2 sm:gap-3">
                          <Link
                            href={`/products/${product.slug}`}
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d8102f] text-[22px] font-semibold leading-none text-white transition hover:scale-105 sm:h-10 sm:w-10 sm:text-[24px] md:h-[42px] md:w-[42px] md:text-[25px] lg:h-[46px] lg:w-[46px] lg:text-[26px] ${
                              product.availability !== "AVAILABLE"
                                ? "pointer-events-none opacity-50"
                                : ""
                            }`}
                          >
                            +
                          </Link>

                          <div className="min-w-0 flex-1">
                            <div className="flex min-h-[36px] items-center justify-center whitespace-nowrap rounded-[10px] bg-white px-2.5 py-1.5 text-center text-[11px] font-extrabold text-[#1a1a1a] shadow sm:min-h-[38px] sm:px-3 sm:text-[12px] md:min-h-[40px] md:text-[13px] lg:min-h-[42px] lg:rounded-[12px] lg:px-3.5 lg:text-[15px]">
                              PKR{getDisplayPrice(product)}
                            </div>
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
    </>
  );
}