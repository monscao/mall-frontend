import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./AuthContext";

jest.mock("services/api", () => ({
  AUTH_EXPIRED_EVENT: "mall-frontend-auth-expired",
  fetchCurrentUser: jest.fn(),
  loginUser: jest.fn(),
  registerUser: jest.fn()
}));

const { fetchCurrentUser, loginUser, registerUser } = jest.requireMock("services/api");

function Consumer() {
  const auth = useAuth();

  return (
    <div>
      <span data-testid="ready">{String(auth.authReady)}</span>
      <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="is-admin">{String(auth.isAdmin)}</span>
      <span data-testid="has-order-manage">{String(auth.hasPermission("ORDER:MANAGE"))}</span>
      <span data-testid="username">{auth.session?.currentUser?.username || auth.session?.username || ""}</span>
      <button type="button" onClick={() => auth.login({ username: "admin", password: "pw" })}>login</button>
      <button type="button" onClick={() => auth.register({ username: "new-user", password: "pw" })}>register</button>
      <button type="button" onClick={() => auth.logout()}>logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  test("hydrates stored session and exposes permissions", async () => {
    window.localStorage.setItem("mall-frontend-auth", JSON.stringify({ token: "jwt", username: "admin" }));
    fetchCurrentUser.mockResolvedValue({
      username: "admin",
      roleCodes: ["ADMIN"],
      permissionCodes: ["ORDER:MANAGE"]
    });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("ready")).toHaveTextContent("true"));
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("is-admin")).toHaveTextContent("true");
    expect(screen.getByTestId("has-order-manage")).toHaveTextContent("true");
    expect(screen.getByTestId("username")).toHaveTextContent("admin");
  });

  test("failed hydration clears bad local session", async () => {
    window.localStorage.setItem("mall-frontend-auth", JSON.stringify({ token: "bad", username: "admin" }));
    fetchCurrentUser.mockRejectedValue(new Error("expired"));

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("ready")).toHaveTextContent("true"));
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(window.localStorage.getItem("mall-frontend-auth")).toBeNull();
  });

  test("login register and logout update session", async () => {
    loginUser.mockResolvedValue({ token: "jwt", username: "admin", roleCodes: ["ADMIN"] });
    registerUser.mockResolvedValue({ token: "jwt2", username: "new-user", roleCodes: ["CUSTOMER"] });
    fetchCurrentUser
      .mockResolvedValueOnce({ username: "admin", roleCodes: ["ADMIN"], permissionCodes: ["PRODUCT:PUBLISH"] })
      .mockResolvedValueOnce({ username: "new-user", roleCodes: ["CUSTOMER"], permissionCodes: ["CART:WRITE"] });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    const user = userEvent.setup();

    await user.click(screen.getByText("login"));
    await waitFor(() => expect(screen.getByTestId("username")).toHaveTextContent("admin"));

    await user.click(screen.getByText("register"));
    await waitFor(() => expect(screen.getByTestId("username")).toHaveTextContent("new-user"));

    await user.click(screen.getByText("logout"));
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(window.localStorage.getItem("mall-frontend-auth")).toBeNull();
  });

  test("auth expired event clears the current session", async () => {
    window.localStorage.setItem("mall-frontend-auth", JSON.stringify({ token: "jwt", username: "admin" }));
    fetchCurrentUser.mockResolvedValue({
      username: "admin",
      roleCodes: ["ADMIN"],
      permissionCodes: ["ORDER:MANAGE"]
    });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("authenticated")).toHaveTextContent("true"));

    act(() => {
      window.dispatchEvent(new CustomEvent("mall-frontend-auth-expired"));
    });

    await waitFor(() => expect(screen.getByTestId("authenticated")).toHaveTextContent("false"));
    expect(window.localStorage.getItem("mall-frontend-auth")).toBeNull();
  });

  test("useAuth throws outside provider", () => {
    function BrokenConsumer() {
      useAuth();
      return null;
    }

    expect(() => render(<BrokenConsumer />)).toThrow("useAuth must be used within AuthProvider");
  });
});
