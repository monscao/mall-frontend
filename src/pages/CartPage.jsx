import { useCart } from "../context/CartContext";
import { formatCurrency } from "../lib/format";

export function CartPage({ navigate }) {
  const { items, subtotal, removeItem, updateQuantity, clearCart } = useCart();
  const shipping = items.length > 0 ? 18 : 0;
  const total = subtotal + shipping;

  return (
    <div className="page-stack">
      <section className="panel section-heading-row">
        <div className="section-heading">
          <span>Cart</span>
          <h2>购物车清单</h2>
          <p>支持数量调整、删除商品和费用汇总，作为后续接入下单流程的前端基础。</p>
        </div>
        {items.length > 0 ? (
          <button className="text-button" type="button" onClick={clearCart}>
            清空购物车
          </button>
        ) : null}
      </section>

      {items.length === 0 ? (
        <section className="panel empty-cart">
          <h3>购物车还是空的</h3>
          <p>从商品列表或详情页加入商品后，这里会显示真实 SKU 清单。</p>
          <button className="primary-button" type="button" onClick={() => navigate("/catalog")}>
            去选购
          </button>
        </section>
      ) : (
        <section className="cart-layout">
          <div className="panel cart-list">
            {items.map((item) => (
              <article className="cart-item" key={item.skuCode}>
                <img alt={item.productName} src={item.coverImage} />
                <div className="cart-item-copy">
                  <h3>{item.productName}</h3>
                  <p>{item.skuName}</p>
                  <button className="text-button align-start" type="button" onClick={() => navigate(`/product/${item.productSlug}`)}>
                    返回商品详情
                  </button>
                </div>
                <div className="cart-item-controls">
                  <label className="qty-control">
                    <span>数量</span>
                    <input
                      min="1"
                      type="number"
                      value={item.quantity}
                      onChange={(event) => updateQuantity(item.skuCode, Number(event.target.value))}
                    />
                  </label>
                  <strong>{formatCurrency(Number(item.salePrice) * item.quantity)}</strong>
                  <button className="text-button" type="button" onClick={() => removeItem(item.skuCode)}>
                    删除
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="panel order-summary">
            <h3>订单摘要</h3>
            <div className="summary-line">
              <span>商品小计</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div className="summary-line">
              <span>配送费</span>
              <strong>{formatCurrency(shipping)}</strong>
            </div>
            <div className="summary-line total-line">
              <span>合计</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
            <button className="primary-button" type="button">
              去结算
            </button>
          </aside>
        </section>
      )}
    </div>
  );
}
