import config from "../config";

const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/users",
    createProxyMiddleware({
      target: config,
      changeOrigin: true,
    })
  );
};
