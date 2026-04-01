import { useEffect, useState } from "react";

const fallbackData = {
  theme: "apple-lite",
  hero: {
    eyebrow: "Crafted For Everyday Wonder",
    title: "Premium technology, presented with calm confidence.",
    subtitle:
      "A storefront that opens like a product film, then smoothly turns into a shopping experience.",
    backgroundStyle: "dark-cinematic",
    product: {
      name: "Nova X Pro",
      subtitle: "120Hz OLED flagship with all-day battery",
      coverImage:
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80",
      priceFrom: "4999.00",
      tags: ["旗舰", "热销", "5G"]
    }
  },
  featuredCategories: [
    {
      code: "phones",
      name: "Phones",
      description: "Flagship and mid-range devices with premium presentation.",
      bannerImage:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80"
    },
    {
      code: "laptops",
      name: "Laptops",
      description: "Portable performance for creators, office, and study.",
      bannerImage:
        "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80"
    },
    {
      code: "audio",
      name: "Audio",
      description: "Noise cancelling, commuting, and immersive listening.",
      bannerImage:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80"
    }
  ],
  sections: [
    {
      code: "featured",
      title: "Flagship Highlights",
      subtitle: "The strongest products for cinematic storytelling blocks.",
      layout: "sticky-showcase",
      products: [
        {
          name: "Nova X Pro",
          subtitle: "120Hz OLED flagship with all-day battery",
          brand: "NovaTech",
          coverImage:
            "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80",
          priceFrom: "4999.00",
          marketPrice: "5999.00",
          rating: "4.80",
          tags: ["旗舰", "热销", "5G"]
        },
        {
          name: "Forge Studio 16",
          subtitle: "Performance notebook for design and rendering",
          brand: "Forge",
          coverImage:
            "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1200&q=80",
          priceFrom: "8999.00",
          marketPrice: "11999.00",
          rating: "4.90",
          tags: ["设计师", "高性能", "独显"]
        }
      ]
    },
    {
      code: "hot",
      title: "Most Wanted",
      subtitle: "The fast-scrolling, high-intent block where shopping takes over.",
      layout: "grid-compact",
      products: [
        {
          name: "EchoBeat Pro",
          subtitle: "Active noise cancelling over-ear headphones",
          brand: "EchoBeat",
          coverImage:
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
          priceFrom: "899.00",
          marketPrice: "1299.00",
          rating: "4.75",
          tags: ["降噪", "通勤", "蓝牙"]
        },
        {
          name: "AeroBook 14",
          subtitle: "Portable laptop for office and study",
          brand: "Aero",
          coverImage:
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80",
          priceFrom: "5699.00",
          marketPrice: "7299.00",
          rating: "4.70",
          tags: ["办公本", "轻薄", "长续航"]
        }
      ]
    }
  ]
};

function App() {
  const [homeData, setHomeData] = useState(fallbackData);

  useEffect(() => {
    let active = true;

    fetch("/api/home")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load home data");
        }
        return response.json();
      })
      .then((data) => {
        if (active) {
          setHomeData(data);
        }
      })
      .catch(() => {
        if (active) {
          setHomeData(fallbackData);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const heroProduct = homeData.hero?.product;

  return (
    <div className="page-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">{homeData.hero?.eyebrow}</span>
          <h1>{homeData.hero?.title}</h1>
          <p>{homeData.hero?.subtitle}</p>
          <div className="hero-meta">
            <span>Apple Lite Storefront</span>
            <span>Dark Motion Narrative</span>
            <span>Shop-Ready Grid Below</span>
          </div>
        </div>

        {heroProduct ? (
          <div className="hero-product">
            <img alt={heroProduct.name} src={heroProduct.coverImage} />
            <div className="hero-product-card">
              <div>
                <h2>{heroProduct.name}</h2>
                <p>{heroProduct.subtitle}</p>
              </div>
              <div className="price-line">
                <span className="price">From ¥{heroProduct.priceFrom}</span>
                <span className="tag-pill">{(heroProduct.tags || [])[0] || "Featured"}</span>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="story-rail">
        <div className="section-heading">
          <span>Featured Categories</span>
          <h3>Calm storytelling first, quick discovery immediately after.</h3>
        </div>

        <div className="category-strip">
          {(homeData.featuredCategories || []).map((category) => (
            <article className="category-card" key={category.code}>
              <img alt={category.name} src={category.bannerImage} />
              <div className="overlay" />
              <div className="category-content">
                <span>{category.code}</span>
                <h4>{category.name}</h4>
                <p>{category.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {(homeData.sections || []).map((section, index) => (
        <section className={`product-section layout-${section.layout}`} key={section.code}>
          <div className="section-heading">
            <span>{section.code}</span>
            <h3>{section.title}</h3>
            <p>{section.subtitle}</p>
          </div>

          <div className={`product-grid product-grid-${index % 2 === 0 ? "wide" : "compact"}`}>
            {(section.products || []).map((product) => (
              <article className="product-card" key={`${section.code}-${product.name}`}>
                <div className="product-visual">
                  <img alt={product.name} src={product.coverImage} />
                </div>
                <div className="product-body">
                  <div className="product-topline">
                    <span>{product.brand}</span>
                    <span>{product.rating}</span>
                  </div>
                  <h4>{product.name}</h4>
                  <p>{product.subtitle}</p>
                  <div className="tag-row">
                    {(product.tags || []).slice(0, 3).map((tag) => (
                      <span className="tag-pill muted" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="price-line">
                    <span className="price">¥{product.priceFrom}</span>
                    {product.marketPrice ? <span className="market-price">¥{product.marketPrice}</span> : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default App;
