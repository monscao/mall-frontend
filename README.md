# Mall Frontend

Webpack + React storefront for the mall practice project. The frontend is wired to the Spring Boot backend and now supports persistent carts, order status operations, admin product management, and image upload workflows.

## Run

```bash
npm start
```

Dev server URL: `http://localhost:3000`

## Build

```bash
npm run build
```

## Backend Dependency

The frontend expects the backend to be available at `http://localhost:8080`.

Webpack dev server proxies:

- `/api/*`
- `/uploads/*`

## Main Frontend Flows

- catalog browsing and product detail
- guest cart with local persistence
- automatic cart sync to backend after login
- checkout and order creation
- order detail and status display
- customer order cancellation
- admin order status progression
- admin product create/edit/publish workflow
- admin local image upload

## Important Files

- [`src/services/api/index.js`](/Users/monscao/Documents/mall-frontend/src/services/api/index.js): API client layer
- [`src/context/AuthContext.jsx`](/Users/monscao/Documents/mall-frontend/src/context/AuthContext.jsx): session and permission state
- [`src/context/CartContext.jsx`](/Users/monscao/Documents/mall-frontend/src/context/CartContext.jsx): guest/server cart sync
- [`src/pages/ProductManagementPage/index.jsx`](/Users/monscao/Documents/mall-frontend/src/pages/ProductManagementPage/index.jsx): admin product operations
- [`src/pages/OrdersPage/index.jsx`](/Users/monscao/Documents/mall-frontend/src/pages/OrdersPage/index.jsx): customer/admin order list interactions

## Notes

- A logged-in cart is persisted by the backend.
- A guest cart is stored in `localStorage`.
- Guest cart items are merged into the backend cart after login.
- Uploaded product images are served from backend `/uploads/*`.
