module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleFileExtensions: ["js", "jsx"],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest"
  },
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
    "\\.(png|jpe?g|gif|svg|webp)$": "<rootDir>/test/fileMock.js",
    "^app/(.*)$": "<rootDir>/src/app/$1",
    "^assets/(.*)$": "<rootDir>/src/assets/$1",
    "^components/(.*)$": "<rootDir>/src/components/$1",
    "^context/(.*)$": "<rootDir>/src/context/$1",
    "^hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^pages/(.*)$": "<rootDir>/src/pages/$1",
    "^routes/(.*)$": "<rootDir>/src/routes/$1",
    "^services/(.*)$": "<rootDir>/src/services/$1",
    "^shared/(.*)$": "<rootDir>/src/shared/$1"
  },
  collectCoverageFrom: [
    "src/services/api/index.js",
    "src/context/AuthContext.jsx",
    "src/context/CartContext.jsx",
    "src/pages/ProductPage/index.jsx",
    "src/pages/OrdersPage/index.jsx",
    "src/pages/ProductManagementPage/index.jsx"
  ],
  coverageThreshold: {
    global: {
      lines: 80
    }
  }
};
