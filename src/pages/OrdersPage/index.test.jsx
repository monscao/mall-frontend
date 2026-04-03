import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrdersPage } from "./index";

let mockAuthValue = {
  hasPermission: () => false,
  isAdmin: false,
  isAuthenticated: true,
  session: { token: "jwt" }
};

const mockCancelOrder = jest.fn();
const mockFetchAdminOrders = jest.fn();
const mockFetchOrders = jest.fn();
const mockUpdateOrderStatus = jest.fn();

jest.mock("context/AuthContext", () => ({
  useAuth: () => mockAuthValue
}));

jest.mock("context/I18nContext", () => ({
  useI18n: () => ({
    locale: "zh-CN",
    t: (key) => key
  })
}));

jest.mock("services/api", () => ({
  cancelOrder: (...args) => mockCancelOrder(...args),
  fetchAdminOrders: (...args) => mockFetchAdminOrders(...args),
  fetchOrders: (...args) => mockFetchOrders(...args),
  getErrorTone: () => "error",
  getReadableErrorMessage: () => "Readable error",
  updateOrderStatus: (...args) => mockUpdateOrderStatus(...args)
}));

jest.mock("components/EmptyState", () => ({
  EmptyState: ({ title, body, action }) => (
    <div>
      <div>{title}</div>
      <div>{body}</div>
      {action}
    </div>
  )
}));

describe("OrdersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthValue = {
      hasPermission: () => false,
      isAdmin: false,
      isAuthenticated: true,
      session: { token: "jwt" }
    };
  });

  test("shows auth prompt when not logged in", () => {
    mockAuthValue = { hasPermission: () => false, isAdmin: false, isAuthenticated: false, session: null };
    render(<OrdersPage navigate={jest.fn()} />);
    expect(screen.getByText("checkout.auth.title")).toBeInTheDocument();
  });

  test("customer can cancel actionable order", async () => {
    const user = userEvent.setup();
    mockFetchOrders.mockResolvedValue([
      {
        id: 1,
        orderNo: "ML001",
        status: "PAID",
        paymentMethod: "card",
        totalQuantity: 1,
        totalAmount: "100",
        createdAt: "2026-04-03 10:00",
        customerActionable: true
      }
    ]);
    mockCancelOrder.mockResolvedValue({ status: "CANCELLED", customerActionable: false });

    render(<OrdersPage navigate={jest.fn()} />);

    await waitFor(() => expect(screen.getByText("ML001")).toBeInTheDocument());
    await user.click(screen.getByText("orders.cancel"));

    expect(mockCancelOrder).toHaveBeenCalledWith(1, "jwt");
    await waitFor(() => expect(screen.getByText("orders.status.CANCELLED")).toBeInTheDocument());
  });

  test("admin sees admin orders and can progress status", async () => {
    const user = userEvent.setup();
    mockAuthValue = {
      hasPermission: (code) => code === "ORDER:MANAGE",
      isAdmin: true,
      isAuthenticated: true,
      session: { token: "jwt" }
    };
    mockFetchAdminOrders.mockResolvedValue([
      {
        id: 2,
        orderNo: "ML002",
        status: "PAID",
        paymentMethod: "wallet",
        totalQuantity: 2,
        totalAmount: "200",
        createdAt: "2026-04-03 11:00",
        customerActionable: true
      }
    ]);
    mockUpdateOrderStatus.mockResolvedValue({ status: "PROCESSING", customerActionable: true });

    render(<OrdersPage navigate={jest.fn()} />);

    await waitFor(() => expect(screen.getByText("ML002")).toBeInTheDocument());
    await user.click(screen.getByText("orders.status.PROCESSING"));

    expect(mockFetchAdminOrders).toHaveBeenCalledWith("jwt");
    expect(mockUpdateOrderStatus).toHaveBeenCalledWith(2, "PROCESSING", "jwt");
  });
});
