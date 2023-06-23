// import config from "../config";

const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/users",
    createProxyMiddleware({
      target: `${process.env.REACT_APP_BACKEND_URL}`,
      changeOrigin: true,
    })
  );
};
