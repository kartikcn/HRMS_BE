const jwt = require('jsonwebtoken')
const config = require('../../config.json')
const userLogger = require('../../logger');
const tokenList = {}
const tokenLists = {}

class jwtToken {
    constructor() {

    }
    async getToken(user) {
        return new Promise(async (resolve, reject) => {
            if(user.usertype_in === true) {
                var tokenLife = config.adminTokenLife;
            } else if(user.usertype_in === false) {
                var tokenLife = config.tokenLife;
            }
            const token = jwt.sign(user, config.secret, { expiresIn: tokenLife })
            const refreshToken = jwt.sign(user, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife })
            const response = {
                "status": "Logged in",
                "token": token,
                "refreshToken": refreshToken,
                "currencyCode": user?.currencyCode,
                "code": user?.code
            }
            // tokenLists[refreshToken] = response;
            // tokenLists["data"] = response;
            if (Object.keys(response).length === 0) {
                reject(`Error on toket generation....`);
            } else {
                resolve(response);
            }
        }).then((tokens) => { return tokens }).catch((err) => { return err });

    }



    async getTokenData(req) {
        try {
            const postData = req.body;
            const token = req.body.token || req.query.token || req.headers['x-access-token']
            // decode token
            if (token) {
                // verifies secret and checks exp
                jwt.verify(token, config.secret, function (err, decoded) {
                    if (err) {
                        console.log("error", err);
                    }
                    req.decoded = decoded;
                });
            }
            return req.decoded;
        } catch (error) {

        }
    }

}

module.exports = { jwtToken: new jwtToken() };