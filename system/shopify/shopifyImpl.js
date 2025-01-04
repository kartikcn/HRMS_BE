const { userLogger } = require('../../loggerFile');
//const __filename = module.filename.split('/').slice(-1);
const config = require("../../config.json");

const { Session, GraphqlQueryError, LATEST_API_VERSION } = require("@shopify/shopify-api");

const shopifyCommonJS = require('./shopifyCommonJS');
//const shopify = require('../../../web/shopify').default;
//const shopify = shopifyModule.default.shopify;
//const { default: shopify } = require('../../../web/shopify');



const axios = require('axios');
class shopifyImpl {
    constructor() {

    }
    //Shopify one time purchase api
    async oneTimePurchase(session, name, returnUrl, amount, currencyCode = "USD", test = false) {
        return new Promise(async (resolve, reject) => {
            try {
                const client = new shopifyCommonJS.api.clients.Graphql({ session });
                const oneTimePurchaseResponse = await client.query({
                    data: {
                        "query": `mutation AppPurchaseOneTimeCreate($name: String!, $price: MoneyInput!, $returnUrl: URL!, $test: Boolean!) {
                            appPurchaseOneTimeCreate(name: $name, returnUrl: $returnUrl, price: $price, test: $test) {
                                userErrors {
                                field
                                message
                                }
                                appPurchaseOneTime {
                                createdAt
                                id
                                }
                                confirmationUrl
                            }
                            }`,
                        "variables": {
                            "name": name,
                            "returnUrl": returnUrl,
                            "test": test,
                            "price": {
                                "amount": amount,
                                "currencyCode": currencyCode
                            }
                        },
                    },
                });
                userLogger.info(__filename, 'Start processing agent ' + JSON.stringify(oneTimePurchaseResponse, null, 4));
                resolve({ "status": "resolve", "response": oneTimePurchaseResponse });
            } catch (error) {
                userLogger.info(__filename, `onTimePurchase(name, returnUrl, amount, currencyCode) Error` + error.stack);
                if (error instanceof GraphqlQueryError) {
                    userLogger.info(__filename, `onTimePurchase(name, returnUrl, amount, currencyCode) Error` + `${error.message}\n${JSON.stringify(error.response, null, 2)}`);
                    reject({ "status": "reject" })
                } else {
                    userLogger.info(__filename, `onTimePurchase(name, returnUrl, amount, currencyCode) Error` + error.stack);
                    reject({ "status": "reject" })
                }
            } finally {

            }
        }).then((data) => {
            return data;
        }).catch((error) => {
            return error;
        });
    }

    //create client in shopify
    async createClient(data, shopData) {
        return await new Promise(async (resolve, reject) => {
            try {
                const session = new Session(shopData);
                const client = new shopifyCommonJS.api.clients.Graphql({ session });
                const oneTimePurchaseResponse = await client.query({
                    data: {
                        "query": `mutation customerCreate($input: CustomerInput!) {
                            customerCreate(input: $input) {
                              userErrors {
                                field
                                message
                              }
                              customer {
                                id
                                email
                                phone
                                firstName
                                lastName
                                addresses {
                                  address1
                                  city
                                  country
                                  phone
                                  zip
                                }
                              }
                            }
                          }`,
                          "variables": {
                            "input": {
                              "email": data?.email,
                              "phone": data?.phone,
                              "firstName": data?.firstname,
                              "lastName": data?.lastname
                            }
                          },
                        },
                });
                userLogger.info(__filename, 'Start processing agent ' + JSON.stringify(oneTimePurchaseResponse, null, 4));
                resolve({ "status": "resolve", "response": oneTimePurchaseResponse });
            } catch (error) {
                userLogger.info(__filename, `createClient Error` + error.stack);
                if (error instanceof GraphqlQueryError) {
                    userLogger.info(__filename, `createClient Error` + `${error.message}\n${JSON.stringify(error.response, null, 2)}`);
                    reject({ "status": "reject" })
                } else {
                    userLogger.info(__filename, `createClient Error` + error.stack);
                    reject({ "status": "reject" })
                }
            } finally {

            }
        }).then((data) => {
            userLogger.info(__filename, 'then function logs ' + JSON.stringify(data, null, 4));
            return data;
        }).catch((error) => {
            userLogger.info(__filename, 'catch function logs ' + JSON.stringify(error.stack, null, 4));
            return error;
        });
    }

    //create client in shopify

    //send invitation to created client

    async sendInvitationToClient(email, customerId, shopData) {
        return await new Promise(async (resolve, reject) => {
            try {
                const session = new Session(shopData);
                //const client = new shopifyCommonJS.api.clients.Graphql({ session });
                // Session is built by the OAuth process

            const customer = new shopifyCommonJS.api.rest.Customer({session: session});
            customer.id = customerId;
            let sendInvitationResponse = await customer.send_invite({
            body: {
                    "customer_invite": {
                        "to": email,
                        "from": "anu.k@qodequaytech.com",
                        "bcc": ["anu.k@qodequaytech.com"],
                        "subject": "Welcome to my new shop",
                        "custom_message": "My awesome new store"
                    }
                },
            });

                userLogger.info(__filename, 'send invitation success ' + JSON.stringify(sendInvitationResponse, null, 4));
                resolve({ "status": "resolve", "response": sendInvitationResponse });
            } catch (error) {
                userLogger.info(__filename, `send invitation Error` + error.stack);
                if (error instanceof GraphqlQueryError) {
                    userLogger.info(__filename, `send invitation Error` + `${error.message}\n${JSON.stringify(error.response, null, 2)}`);
                    reject({ "status": "reject" })
                } else {
                    userLogger.info(__filename, `send invitation Error` + error.stack);
                    reject({ "status": "reject" })
                }
            } finally {

            }
        }).then((data) => {
            userLogger.info(__filename, 'then function logs ' + JSON.stringify(data, null, 4));
            return data;
        }).catch((error) => {
            userLogger.info(__filename, 'catch function logs ' + JSON.stringify(error.stack, null, 4));
            return error;
        });
    }

    //send invitation to created client
    
    async getAppID(session) {
        return new Promise(async (resolve, reject) => {
            try {
                const appid = '';
                resolve({ "status": "resolve", "response": appid });
            } catch (error) {
                userLogger.info(__filename, `onTimePurchase(name, returnUrl, amount, currencyCode) Error` + error.stack);
                if (error instanceof GraphqlQueryError) {
                    userLogger.info(__filename, `onTimePurchase(name, returnUrl, amount, currencyCode) Error` + `${error.message}\n${JSON.stringify(error.response, null, 2)}`);
                    reject({ "status": "reject" })
                } else {
                    userLogger.info(__filename, `onTimePurchase(name, returnUrl, amount, currencyCode) Error` + error.stack);
                    reject({ "status": "reject" })
                }
            } finally {

            }
        }).then((data) => {
            return data;
        }).catch((error) => {
            return error;
        });
    }

    async oneTimePurchaseVerify(session, checkId) {
        return new Promise(async (resolve, reject) => {
            try {
                // const client = new shopifyCommonJS.api.rest.ApplicationCharge;
                if (checkId.includes("Free")) {
                    
                    const response = {
                        "status": "active",
                        "return_url": "#"
                    };
                    userLogger.info(__filename, 'Start Resoponse accessToken free' + JSON.stringify(response, null, 4));
                    resolve({ "status": "resolve", "response": response });
                } else {
                    const response = await shopifyCommonJS.api.rest.ApplicationCharge.find({
                        session: session,
                        id: checkId,
                    });
                    userLogger.info(__filename, 'Start Resoponse accessToken 2' + JSON.stringify(response, null, 4));
                    resolve({ "status": "resolve", "response": response });
                }
            } catch (error) {
                userLogger.info(__filename, `onTimePurchaseVerify 1 Error` + error.stack);
                if (error instanceof GraphqlQueryError) {
                    userLogger.info(__filename, `onTimePurchaseVerify 2 Error` + `${error.message}\n${JSON.stringify(error.response, null, 2)}`);
                    reject({ "status": "reject" })
                } else {
                    userLogger.info(__filename, `onTimePurchaseVerify 3 Error` + error.stack);
                    reject({ "status": "reject" });
                }
            } finally {

            }
        }).then((data) => {
            return data;
        }).catch((error) => {
            return error;
        });
    }

    async storeThemeList(session) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await shopifyCommonJS.api.rest.Theme.all({
                    session: session,
                });
                userLogger.info(__filename, 'storeThemeList 2' + JSON.stringify(response, null, 4));
                resolve({ "status": "resolve", "response": response });
            } catch (error) {
                userLogger.info(__filename, `storeThemeList 1 Error` + error.stack);
                if (error instanceof GraphqlQueryError) {
                    userLogger.info(__filename, `storeThemeList 2 Error` + `${error.message}\n${JSON.stringify(error.response, null, 2)}`);
                    reject({ "status": "reject" })
                } else {
                    userLogger.info(__filename, `storeThemeList 3 Error` + error.stack);
                    reject({ "status": "reject" });
                }
            } finally {

            }
        }).then((data) => {
            return data;
        }).catch((error) => {
            return error;
        });
    }

    async fileInjectionInTheme(session, fileName, srcUrl, locationSrc, themeId) {//this function for insert and update theme files
        return new Promise(async (resolve, reject) => {
            try {
                const asset = await new shopifyCommonJS.api.rest.Asset({ session: session });
                asset.theme_id = themeId;//139140759855;
                asset.key = locationSrc + "/" + fileName;
                asset.src = srcUrl;
                asset.public_url=srcUrl;
                userLogger.info(__filename, 'fileInjectionInTheme 0' + JSON.stringify(asset, null, 4));
                const response = await asset.save({
                    update: true,
                });
                
                userLogger.info(__filename, 'fileInjectionInTheme 2' + JSON.stringify(response, null, 4));
                resolve({ "status": "resolve", "response": response });
            } catch (error) {
                userLogger.info(__filename, `fileInjectionInTheme 1 Error` + error.stack);
                if (error instanceof GraphqlQueryError) {
                    userLogger.error(__filename, `fileInjectionInTheme 2 Error` + `${error.message}\n${JSON.stringify(error.response, null, 2)}`);
                    reject({ "status": "reject" })
                } else {
                    userLogger.error(__filename, `fileInjectionInTheme 3 Error` + error.stack);
                    reject({ "status": "reject" });
                }
            } finally {

            }
        }).then((data) => {
            return data;
        }).catch((error) => {
            return error;
        });
    }

    async fileDeletedInTheme(session, fileName, srcUrl, locationSrc, themeId) {//this function for insert and update theme files
        return new Promise(async (resolve, reject) => {
            try {
                const key = locationSrc + "/" + fileName;
                const response = await shopify.rest.Asset.delete({
                    session: session,
                    theme_id: themeId,
                    asset: { "key": `${key}` },
                });
                userLogger.info(__filename, 'fileDeletedInTheme 2' + JSON.stringify(response, null, 4));
                resolve({ "status": "resolve", "response": response });
            } catch (error) {
                userLogger.info(__filename, `fileDeletedInTheme 1 Error` + error.stack);
                if (error instanceof GraphqlQueryError) {
                    userLogger.info(__filename, `fileDeletedInTheme 2 Error` + `${error.message}\n${JSON.stringify(error.response, null, 2)}`);
                    reject({ "status": "reject" })
                } else {
                    userLogger.info(__filename, `fileDeletedInTheme 3 Error` + error.stack);
                    reject({ "status": "reject" });
                }
            } finally {

            }
        }).then((data) => {
            return data;
        }).catch((error) => {
            return error;
        });
    }
}
module.exports = shopifyImpl;