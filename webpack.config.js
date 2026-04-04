const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const isDevelopment = process.env.NODE_ENV !== "production";

module.exports = {
  entry: path.resolve(__dirname, "src/index.jsx"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: isDevelopment ? "bundle.js" : "bundle.[contenthash].js",
    clean: true,
    publicPath: "/"
  },
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      app: path.resolve(__dirname, "src/app"),
      assets: path.resolve(__dirname, "src/assets"),
      components: path.resolve(__dirname, "src/components"),
      context: path.resolve(__dirname, "src/context"),
      hooks: path.resolve(__dirname, "src/hooks"),
      pages: path.resolve(__dirname, "src/pages"),
      routes: path.resolve(__dirname, "src/routes"),
      services: path.resolve(__dirname, "src/services"),
      shared: path.resolve(__dirname, "src/shared")
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: "asset/resource"
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public/index.html"),
      favicon: path.resolve(__dirname, "public/favicon.svg")
    }),
    isDevelopment && new ReactRefreshWebpackPlugin()
  ].filter(Boolean),
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
    static: {
      directory: path.resolve(__dirname, "public")
    },
    proxy: [
      {
        context: ["/api", "/uploads"],
        target: "http://localhost:8080",
        changeOrigin: true
      }
    ]
  }
};
