const { BillingInterval, LATEST_API_VERSION } = require("@shopify/shopify-api");
const { shopifyApp } = require("@shopify/shopify-app-express");
const { MySQLSessionStorage } = require('@shopify/shopify-app-session-storage-mysql');
const { restResources } = require(`@shopify/shopify-api/rest/admin/${LATEST_API_VERSION}`);
const config = require("../../config.json");

const billingConfig = {
  "My Shopify One-Time Charge": {
    required: true,
    amount: 5.0,
    currencyCode: "USD",
    interval: BillingInterval.OneTime,
  },
};

const shopifyCommonJS = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    billing: billingConfig,
    apiKey : '9b5a54eaf524186d8ff8e61e9978beb7',
    apiSecretKey: '7c486463651a9a960538ec361465158f',
    hostName : 'albums-good-sacrifice-jeff.trycloudflare.com',
    scopes : 'write_products, write_customers'
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  sessionStorage: MySQLSessionStorage.withCredentials(
    config?.DB?.host,
    config?.DB?.dbname,
    config?.DB?.user,
    config?.DB?.password,
  ),
});

module.exports = shopifyCommonJS;
