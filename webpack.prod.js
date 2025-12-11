const webpack = require("webpack");
const { merge } = require("webpack-merge");
const common = require("./webpack.common");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");

module.exports = merge(common, {
  mode: "production",
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.API_URL": JSON.stringify(
        process.env.API_URL || "https://loading-backend-rrby.onrender.com",
      ),
      "process.env.NODE_ENV": JSON.stringify("production"),
    }),
    new WorkboxPlugin.InjectManifest({
      swSrc: "./src/service.worker.js",
      swDest: "service.worker.js",
    }),
  ],
});
