import { AppLink } from "./AppLink";

const footerGroups = [
  {
    title: "商城",
    links: [
      { label: "首页", to: "/" },
      { label: "全部商品", to: "/catalog" },
      { label: "购物车", to: "/cart" }
    ]
  },
  {
    title: "账户",
    links: [
      { label: "登录", to: "/login" },
      { label: "注册", to: "/register" },
      { label: "新品专区", to: "/catalog?sort=latest" }
    ]
  },
  {
    title: "服务",
    links: [
      { label: "热销商品", to: "/catalog?sort=sales" },
      { label: "手机分类", to: "/catalog?category=phones" },
      { label: "笔记本分类", to: "/catalog?category=laptops" }
    ]
  }
];

export function Footer({ navigate }) {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <span className="brand-mark">AL</span>
          <div>
            <h3>Apple Lite Mall</h3>
            <p>面向本地后端与数据库的前端商城演示，聚焦高级感浏览与顺滑购买。</p>
          </div>
        </div>

        <div className="footer-links">
          {footerGroups.map((group) => (
            <section key={group.title}>
              <span>{group.title}</span>
              {group.links.map((link) => (
                <AppLink className="footer-link" key={link.to} navigate={navigate} to={link.to}>
                  {link.label}
                </AppLink>
              ))}
            </section>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <span>Premium electronics storefront</span>
        <span className="footer-meta-pill">Scroll-friendly shopping experience</span>
      </div>
    </footer>
  );
}
