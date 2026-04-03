import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductManagementPage } from "./index";

let mockAuthValue = {
  hasPermission: () => true,
  isAdmin: true,
  session: { token: "jwt" }
};

const mockPushNotification = jest.fn();
const mockDeleteAdminProduct = jest.fn();
const mockFetchAdminProducts = jest.fn();
const mockFetchCategories = jest.fn();
const mockUpdateAdminProduct = jest.fn();
const mockUpdateAdminProductShelf = jest.fn();

jest.mock("context/AuthContext", () => ({
  useAuth: () => mockAuthValue
}));

jest.mock("context/I18nContext", () => ({
  useI18n: () => ({
    t: (key) => key
  })
}));

jest.mock("context/NotificationContext", () => ({
  useNotification: () => ({ pushNotification: mockPushNotification })
}));

jest.mock("services/api", () => ({
  deleteAdminProduct: (...args) => mockDeleteAdminProduct(...args),
  fetchAdminProducts: (...args) => mockFetchAdminProducts(...args),
  fetchCategories: (...args) => mockFetchCategories(...args),
  getReadableErrorMessage: () => "Readable error",
  updateAdminProduct: (...args) => mockUpdateAdminProduct(...args),
  updateAdminProductShelf: (...args) => mockUpdateAdminProductShelf(...args)
}));

jest.mock("components/SafeImage", () => ({
  SafeImage: ({ alt, src }) => <img alt={alt} src={src} />
}));

describe("ProductManagementPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthValue = {
      hasPermission: () => true,
      isAdmin: true,
      session: { token: "jwt" }
    };
    mockFetchCategories.mockResolvedValue([{ code: "phones", name: "Phones" }]);
    mockFetchAdminProducts.mockResolvedValue([
      {
        id: 1,
        slug: "nova-x-pro",
        name: "Nova X Pro",
        subtitle: "Flagship",
        brand: "Nova",
        categoryCode: "phones",
        categoryName: "Phones",
        coverImage: "/cover.png",
        priceFrom: "4999",
        priceTo: "5499",
        marketPrice: "5999",
        stockStatus: "IN_STOCK",
        featured: true,
        onShelf: true
      }
    ]);
  });

  test("blocks non-admin users", () => {
    mockAuthValue = { hasPermission: () => false, isAdmin: false, session: null };
    render(<ProductManagementPage navigate={jest.fn()} />);
    expect(screen.getByText("admin.access.title")).toBeInTheDocument();
  });

  test("allows publishing and deleting products", async () => {
    const user = userEvent.setup();
    mockUpdateAdminProductShelf.mockResolvedValue({
      id: 1,
      slug: "nova-x-pro",
      name: "Nova X Pro",
      categoryName: "Phones",
      priceFrom: "4999",
      marketPrice: "5999",
      onShelf: false
    });
    mockDeleteAdminProduct.mockResolvedValue();

    render(<ProductManagementPage navigate={jest.fn()} />);

    await waitFor(() => expect(screen.getByText("Nova X Pro")).toBeInTheDocument());
    await user.click(screen.getByText("admin.management.takeDown"));
    expect(mockUpdateAdminProductShelf).toHaveBeenCalledWith(1, false, "jwt");

    await user.click(screen.getByText("admin.management.delete"));
    expect(mockDeleteAdminProduct).toHaveBeenCalledWith(1, "jwt");
  });

  test("save flow updates product and optionally shelf status", async () => {
    const user = userEvent.setup();
    mockUpdateAdminProduct.mockResolvedValue({
      id: 1,
      slug: "nova-x-pro",
      name: "Nova X Pro",
      subtitle: "Flagship",
      brand: "Nova",
      categoryCode: "phones",
      categoryName: "Phones",
      coverImage: "/cover.png",
      priceFrom: "4999",
      priceTo: "5499",
      marketPrice: "5999",
      stockStatus: "IN_STOCK",
      featured: true,
      onShelf: true
    });

    render(<ProductManagementPage navigate={jest.fn()} />);

    await waitFor(() => expect(screen.getByText("admin.management.edit")).toBeInTheDocument());
    await user.click(screen.getByText("admin.management.edit"));
    await user.click(screen.getByText("admin.management.save"));

    expect(mockUpdateAdminProduct).toHaveBeenCalled();
    expect(mockPushNotification).toHaveBeenCalled();
  });
});
