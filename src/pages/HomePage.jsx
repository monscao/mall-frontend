import { useEffect, useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { SectionState } from "../components/SectionState";
import { fetchHome } from "../lib/api";
import { createCatalogPath } from "../lib/navigation";

export function HomePage({ navigate }) {
  const [state, setState] = useState({
    loading: true,
    data: null,
    error: ""
  });

  useEffect(() => {
    let active = true;

    fetchHome()
      .then((data) => {
        if (active) {
          setState({
            loading: false,
            data,
            error: ""
          });
        }
      })
      .catch((error) => {
        if (active) {
          setState({
            loading: false,
            data: null,
            error: error.message
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (state.loading) {
    return <SectionState title="首页加载中" body="正在从本地后端读取首页故事区与推荐商品。" />;
  }

  if (state.error) {
    return (
      <SectionState
        title="首页暂时不可用"
        body={state.error}
        action={
          <button className="primary-button" type="button" onClick={() => window.location.reload()}>
            重新加载
          </button>
        }
      />
    );
  }

  const data = state.data;
  const heroProduct = data?.hero?.product;

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">{data.hero?.eyebrow}</span>
          <h1>{data.hero?.title}</h1>
          <p>{data.hero?.subtitle}</p>
          <div className="hero-meta">
            <span>数据库驱动商品</span>
            <span>前后端本地联调</span>
            <span>组件化商城界面</span>
          </div>
          <div className="hero-cta">
            <button className="primary-button" type="button" onClick={() => navigate("/catalog")}>
              进入商城
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => navigate(createCatalogPath("phones", "featured"))}
            >
              浏览旗舰手机
            </button>
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
                <button className="text-link" type="button" onClick={() => navigate("/catalog")}>
                  继续浏览
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="panel">
        <div className="section-heading">
          <span>Featured Categories</span>
          <h2>从主题分类进入，保留高级感，也保留购买效率。</h2>
        </div>

        <div className="category-grid">
          {(data.featuredCategories || []).map((category) => (
            <button
              className="category-card"
              key={category.code}
              type="button"
              onClick={() => navigate(createCatalogPath(category.code, "featured"))}
            >
              <img alt={category.name} src={category.bannerImage} />
              <div className="overlay" />
              <div className="category-content">
                <span>{category.code}</span>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {(data.sections || []).map((section) => (
        <section className="panel" key={section.code}>
          <div className="section-heading section-heading-row">
            <div>
              <span>{section.code}</span>
              <h2>{section.title}</h2>
              <p>{section.subtitle}</p>
            </div>
            <button className="text-link" type="button" onClick={() => navigate("/catalog")}>
              查看更多
            </button>
          </div>

          <div className="product-grid">
            {(section.products || []).map((product) => (
              <ProductCard key={`${section.code}-${product.slug || product.name}`} navigate={navigate} product={product} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
