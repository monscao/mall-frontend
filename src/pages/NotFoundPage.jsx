export function NotFoundPage({ navigate }) {
  return (
    <section className="panel empty-cart">
      <h3>页面不存在</h3>
      <p>当前地址没有对应的前端页面，可以返回首页继续浏览。</p>
      <button className="primary-button" type="button" onClick={() => navigate("/")}>
        返回首页
      </button>
    </section>
  );
}
