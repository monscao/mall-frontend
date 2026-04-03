import {
  AUTH_EXPIRED_EVENT,
  cancelOrder,
  clearCartRequest,
  createOrder,
  deleteAdminProduct,
  fetchAdminOrderDetail,
  fetchAdminOrders,
  fetchAdminProducts,
  fetchCart,
  fetchCurrentUser,
  fetchHome,
  fetchOrderDetail,
  fetchOrders,
  fetchProductDetail,
  fetchProducts,
  getErrorTone,
  getReadableErrorMessage,
  loginUser,
  normalizeCartItemsForSync,
  resolveAssetUrl,
  syncCart,
  updateAdminProduct,
  updateAdminProductShelf,
  updateOrderStatus,
  uploadProductImage
} from "./index";

function mockJsonResponse(data, ok = true, status = 200, statusText = "OK") {
  return Promise.resolve({
    ok,
    status,
    statusText,
    json: () => Promise.resolve(data)
  });
}

describe("api helpers", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("resolveAssetUrl handles remote, blob, and relative paths", () => {
    expect(resolveAssetUrl("https://example.com/a.png")).toBe("https://example.com/a.png");
    expect(resolveAssetUrl("blob:test")).toBe("blob:test");
    expect(resolveAssetUrl("/uploads/a.png")).toBe("/uploads/a.png");
    expect(resolveAssetUrl("uploads/a.png")).toBe("/uploads/a.png");
    expect(resolveAssetUrl("")).toBe("");
  });

  test("error helpers return translated message and tone", () => {
    const t = (key) => key;
    expect(getReadableErrorMessage({ code: "AUTH_REQUIRED" }, t)).toBe("error.auth.body");
    expect(getReadableErrorMessage({ code: "FORBIDDEN" }, t)).toBe("error.forbidden.body");
    expect(getReadableErrorMessage({ code: "FILE_TOO_LARGE" }, t)).toBe("error.upload.body");
    expect(getReadableErrorMessage({ code: "UNKNOWN" }, t)).toBe("error.generic.body");
    expect(getErrorTone({ code: "NETWORK_UNAVAILABLE" })).toBe("network");
    expect(getErrorTone({ code: "AUTH_REQUIRED" })).toBe("info");
    expect(getErrorTone({ code: "OTHER" })).toBe("error");
  });

  test("normalizeCartItemsForSync keeps sku and quantity", () => {
    expect(normalizeCartItemsForSync([{ skuCode: "A", quantity: "2" }])).toEqual([{ skuCode: "A", quantity: 2 }]);
  });

  test("JSON requests include auth and parse payloads", async () => {
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ theme: "apple-lite" }));
    global.fetch.mockResolvedValueOnce(mockJsonResponse([{ id: 1 }]));
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ slug: "nova-x-pro" }));
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ token: "jwt" }));
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ username: "admin" }));
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ cartId: 1, items: [] }));
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ cartId: 1, items: [] }));
    global.fetch.mockResolvedValueOnce(mockJsonResponse([{ id: 1 }]));
    global.fetch.mockResolvedValueOnce(mockJsonResponse([{ id: 1 }]));
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ id: 1 }));
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ id: 1 }));
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ onShelf: true }));
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ id: 9 }));

    await expect(fetchHome()).resolves.toEqual({ theme: "apple-lite" });
    await expect(fetchProducts({ categoryCode: "phones", limit: 2 })).resolves.toEqual([{ id: 1 }]);
    await expect(fetchProductDetail("nova-x-pro")).resolves.toEqual({ slug: "nova-x-pro" });
    await expect(loginUser({ username: "admin", password: "123456" })).resolves.toEqual({ token: "jwt" });
    await expect(fetchCurrentUser("jwt")).resolves.toEqual({ username: "admin" });
    await expect(fetchCart("jwt")).resolves.toEqual({ cartId: 1, items: [] });
    await expect(syncCart([{ skuCode: "ABC", quantity: 1 }], "jwt")).resolves.toEqual({ cartId: 1, items: [] });
    await expect(fetchOrders("jwt")).resolves.toEqual([{ id: 1 }]);
    await expect(fetchAdminOrders("jwt")).resolves.toEqual([{ id: 1 }]);
    await expect(fetchOrderDetail(1, "jwt")).resolves.toEqual({ id: 1 });
    await expect(fetchAdminOrderDetail(1, "jwt")).resolves.toEqual({ id: 1 });
    await expect(updateAdminProductShelf(1, true, "jwt")).resolves.toEqual({ onShelf: true });
    await expect(updateOrderStatus(9, "PROCESSING", "jwt")).resolves.toEqual({ id: 9 });

    expect(global.fetch).toHaveBeenCalledWith("/api/home", expect.any(Object));
    expect(global.fetch).toHaveBeenCalledWith("/api/catalog/products?categoryCode=phones&limit=2", expect.any(Object));
    expect(global.fetch).toHaveBeenCalledWith("/api/catalog/products/nova-x-pro", expect.any(Object));
    expect(global.fetch).toHaveBeenCalledWith("/api/auth/login", expect.objectContaining({ method: "POST" }));
    expect(global.fetch).toHaveBeenCalledWith("/api/auth/me", expect.objectContaining({
      headers: expect.objectContaining({ Authorization: "Bearer jwt" })
    }));
  });

  test("multipart and mutation helpers work", async () => {
    const file = new File(["hello"], "hello.png", { type: "image/png" });
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ url: "/uploads/hello.png" }));
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ id: 2 }));
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ id: 2 }));
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ id: 2 }));
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ items: [] }));
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ status: "CANCELLED" }));
    global.fetch.mockResolvedValueOnce(mockJsonResponse({}, true, 204));

    await expect(uploadProductImage(file, "jwt")).resolves.toEqual({ url: "/uploads/hello.png" });
    await expect(updateAdminProduct(2, { name: "New" }, "jwt")).resolves.toEqual({ id: 2 });
    await expect(fetchAdminProducts("jwt")).resolves.toEqual({ id: 2 });
    await expect(createOrder({ contactName: "A" }, "jwt")).resolves.toEqual({ id: 2 });
    await expect(clearCartRequest("jwt")).resolves.toEqual({ items: [] });
    await expect(cancelOrder(3, "jwt")).resolves.toEqual({ status: "CANCELLED" });
    await expect(deleteAdminProduct(9, "jwt")).resolves.toBeUndefined();
  });

  test("non-ok responses normalize errors", async () => {
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ message: "bad data" }, false, 400, "Bad Request"));
    await expect(fetchHome()).rejects.toMatchObject({ code: "BAD_REQUEST", rawMessage: "bad data" });

    global.fetch.mockResolvedValueOnce(mockJsonResponse({ message: "forbidden" }, false, 403, "Forbidden"));
    await expect(clearCartRequest("jwt")).rejects.toMatchObject({ code: "FORBIDDEN", rawMessage: "forbidden" });

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Server Error",
      json: () => Promise.reject(new Error("bad json"))
    });
    await expect(deleteAdminProduct(1, "jwt")).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
  });

  test("401 authed responses dispatch an auth expired event", async () => {
    const listener = jest.fn();
    window.addEventListener(AUTH_EXPIRED_EVENT, listener);
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ message: "expired" }, false, 401, "Unauthorized"));

    await expect(fetchCart("jwt")).rejects.toMatchObject({ code: "AUTH_REQUIRED", rawMessage: "expired" });
    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener(AUTH_EXPIRED_EVENT, listener);
  });

  test("network failures are converted to network unavailable", async () => {
    global.fetch.mockRejectedValue(new Error("offline"));
    await expect(loginUser({ username: "a" })).rejects.toMatchObject({ code: "NETWORK_UNAVAILABLE" });
  });
});
