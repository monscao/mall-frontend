import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider, useCart } from "./CartContext";

let mockAuthState = { authReady: true, session: null };

jest.mock("context/AuthContext", () => ({
  useAuth: () => mockAuthState
}));

jest.mock("services/api", () => ({
  clearCartRequest: jest.fn(),
  fetchCart: jest.fn(),
  normalizeCartItemsForSync: jest.requireActual("services/api").normalizeCartItemsForSync,
  syncCart: jest.fn()
}));

const { clearCartRequest, fetchCart, syncCart } = jest.requireMock("services/api");

function Consumer() {
  const cart = useCart();

  return (
    <div>
      <span data-testid="ready">{String(cart.cartReady)}</span>
      <span data-testid="items">{String(cart.items.length)}</span>
      <span data-testid="subtotal">{String(cart.subtotal)}</span>
      <button
        type="button"
        onClick={() =>
          cart.addItem({
            skuCode: "SKU-1",
            productSlug: "product-1",
            productName: "Phone",
            skuName: "Phone 256G",
            salePrice: "100",
            stock: 5,
            quantity: 1
          })
        }
      >
        add
      </button>
      <button type="button" onClick={() => cart.updateQuantity("SKU-1", 3)}>update</button>
      <button type="button" onClick={() => cart.removeItem("SKU-1")}>remove</button>
      <button type="button" onClick={() => cart.clearCart()}>clear</button>
    </div>
  );
}

describe("CartContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    mockAuthState = { authReady: true, session: null };
  });

  test("guest cart uses local storage operations", async () => {
    render(
      <CartProvider>
        <Consumer />
      </CartProvider>
    );

    const user = userEvent.setup();
    await user.click(screen.getByText("add"));
    expect(screen.getByTestId("items")).toHaveTextContent("1");
    expect(screen.getByTestId("subtotal")).toHaveTextContent("100");

    await user.click(screen.getByText("update"));
    expect(screen.getByTestId("subtotal")).toHaveTextContent("300");

    await user.click(screen.getByText("remove"));
    expect(screen.getByTestId("items")).toHaveTextContent("0");

    await user.click(screen.getByText("add"));
    await user.click(screen.getByText("clear"));
    expect(screen.getByTestId("items")).toHaveTextContent("0");
    expect(syncCart).not.toHaveBeenCalled();
  });

  test("server cart hydrates and syncs guest cart after login", async () => {
    window.localStorage.setItem("mall-frontend-cart:guest", JSON.stringify([{ skuCode: "SKU-2", quantity: 2 }]));
    mockAuthState = { authReady: true, session: { token: "jwt", username: "admin", currentUser: { username: "admin" } } };

    syncCart.mockResolvedValue({
      items: [
        {
          skuCode: "SKU-2",
          productSlug: "product-2",
          productName: "Laptop",
          skuName: "Laptop 16G",
          salePrice: "200",
          stock: 10,
          quantity: 2
        }
      ]
    });

    render(
      <CartProvider>
        <Consumer />
      </CartProvider>
    );

    await waitFor(() => expect(screen.getByTestId("ready")).toHaveTextContent("true"));
    expect(syncCart).toHaveBeenCalled();
    expect(screen.getByTestId("items")).toHaveTextContent("1");

    clearCartRequest.mockResolvedValue({ items: [] });
    const user = userEvent.setup();
    await user.click(screen.getByText("clear"));
    expect(clearCartRequest).toHaveBeenCalledWith("jwt");
  });

  test("server cart falls back to local items when hydrate fails", async () => {
    mockAuthState = { authReady: true, session: { token: "jwt", username: "admin", currentUser: { username: "admin" } } };
    window.localStorage.setItem("mall-frontend-cart:admin", JSON.stringify([{ skuCode: "SKU-1", salePrice: "20", quantity: 1 }]));
    fetchCart.mockRejectedValue(new Error("offline"));
    syncCart.mockRejectedValue(new Error("offline"));

    render(
      <CartProvider>
        <Consumer />
      </CartProvider>
    );

    await waitFor(() => expect(screen.getByTestId("ready")).toHaveTextContent("true"));
    expect(screen.getByTestId("items")).toHaveTextContent("1");
  });

  test("useCart throws outside provider", () => {
    function BrokenConsumer() {
      useCart();
      return null;
    }

    expect(() => render(<BrokenConsumer />)).toThrow("useCart must be used within CartProvider");
  });
});
