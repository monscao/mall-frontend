import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductPage } from "./index";

const mockAddItem = jest.fn();
const mockPushNotification = jest.fn();
const mockFetchProductDetail = jest.fn();

jest.mock("context/CartContext", () => ({
  useCart: () => ({ addItem: mockAddItem })
}));

jest.mock("context/I18nContext", () => ({
  useI18n: () => ({
    locale: "zh-CN",
    resolveText: (value) => value,
    t: (key, params) => (params?.name ? `${key}:${params.name}` : key)
  })
}));

jest.mock("context/NotificationContext", () => ({
  useNotification: () => ({ pushNotification: mockPushNotification })
}));

jest.mock("services/api", () => ({
  fetchProductDetail: (...args) => mockFetchProductDetail(...args),
  getErrorTone: () => "error",
  getReadableErrorMessage: () => "Readable error"
}));

jest.mock("components/SafeImage", () => ({
  SafeImage: ({ alt, src }) => <img alt={alt} src={src} />
}));

jest.mock("components/Icons", () => ({
  IconArrowLeft: () => <span>back-icon</span>,
  IconCart: () => <span>cart-icon</span>,
  IconStatusCloudOff: () => <span>cloud-off</span>,
  IconStatusInfo: () => <span>info</span>,
  IconStatusWarning: () => <span>warning</span>
}));

describe("ProductPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders error state when product request fails", async () => {
    mockFetchProductDetail.mockRejectedValue(new Error("failed"));

    render(<ProductPage navigate={jest.fn()} slug="broken" />);

    expect(screen.getByText("product.loading.title")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("product.error.title")).toBeInTheDocument());
  });

  test("renders product details and adds selected sku to cart", async () => {
    const navigate = jest.fn();
    const user = userEvent.setup();
    mockFetchProductDetail.mockResolvedValue({
      slug: "nova-x-pro",
      name: "Nova X Pro",
      subtitle: "Flagship",
      brand: "Nova",
      categoryName: "Phones",
      rating: "4.8",
      stockStatus: "IN_STOCK",
      salesCount: 100,
      priceFrom: "4999",
      marketPrice: "5999",
      coverImage: "/cover.png",
      description: "Desc",
      tags: ["A", "B"],
      galleryImages: [{ imageUrl: "/gallery-1.png" }],
      skus: [
        {
          skuCode: "SKU1",
          name: "Standard",
          specSummary: "Black / 256G",
          salePrice: "4999",
          marketPrice: "5999",
          stock: 5,
          coverImage: "/sku-1.png",
          isDefault: true
        },
        {
          skuCode: "SKU2",
          name: "Pro",
          specSummary: "Silver / 512G",
          salePrice: "5999",
          marketPrice: "6999",
          stock: 3,
          coverImage: "/sku-2.png",
          isDefault: false
        }
      ]
    });
    mockAddItem.mockResolvedValue();

    render(<ProductPage navigate={navigate} slug="nova-x-pro" />);

    await waitFor(() => expect(screen.getByText("Nova X Pro")).toBeInTheDocument());
    await user.click(screen.getByText("Pro"));
    await user.click(screen.getByText("product.addToCart"));

    expect(mockAddItem).toHaveBeenCalledWith(expect.objectContaining({
      skuCode: "SKU2",
      productSlug: "nova-x-pro"
    }));
    expect(mockPushNotification).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith("/cart");
  });
});
