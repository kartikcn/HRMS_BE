//let secret = Config.get('App.secret');
let tokenExpiresTime = Config.get('App.tokenExpiresTime');
let User = Models.User;
console.log(tokenExpiresTime, "tokenExpiresTime")
module.exports = {
    check: async function (req, res, next) {
        try {
            const bearerHeader = req.headers['authorization'];
            if (!bearerHeader) {
                return next(setError(MSG.AUTH_TOKEN_EMPTY, 403));
            }

            const bearer = bearerHeader.split(' ');
            if (bearer.length == 1) {
                req.headers['authorization'] = bearer[0];
            } else {
                req.headers['authorization'] = bearer[1];
            }

            const token =
                req.body.token || req.query.token || req.headers['authorization'] || req.cookies.authorization;
            console.log("req.cookies==>", req.cookies)

            if (!token) {
                return next(setError(MSG.AUTH_TOKEN_EMPTY, 403));
            } else {
                const decoded = jwt.verify(token, secret);
                console.log("req.cookies==>", req.cookies)

                const user = await Models.User.findById(decoded._id, { password: 0 });
                if (!user) {
                    return next(setError(MSG.USER_NOT_EXIST, 403));
                } else if (user.is_deleted) {
                    return next(setError(MSG.LOGIN_DELETED, 403));
                } else if (
                    user.status == USER_STATUS.IN_ACTIVE &&
                    user.activation_key == '' &&
                    ![ROLES.CLIENT_USER, ROLES.CLIENT_ADMIN, ROLES.CANDIDATE, ROLES.INTERVIEWER].includes(user.role)
                ) {
                    return next(setError(MSG.LOGIN_DEACTIVE, 403));
                } else {
                    req.user = user;
                    const sessionDiff = Moment().diff(Moment.unix(decoded.iat), 'minutes');
                    if (!empty(decoded.company_id)) {
                        await Auth.checkMsa(req, decoded.company_id);
                        req.user.company_id = ObjectId(decoded.company_id);
                        if (sessionDiff > 3000) {
                            const { email, _id, name, company_id } = req.user;
                            const new_token = Auth.getToken({ email, _id, name, company_id });
                            res.setHeader('authorization', new_token);
                        } else {
                            res.setHeader('authorization', token);
                        }
                        global.AuthUser = req.user;
                        next();
                    } else {
                        if (sessionDiff > 30) {
                            const { email, _id, name } = req.user;
                            const new_token = Auth.getToken({ email, _id, name });
                            res.setHeader('authorization', new_token);
                        } else {
                            res.setHeader('authorization', token);
                        }
                        next();
                    }
                }
            }
        } catch (err) {
            console.log("dsdcd", err);
            next(err);
        }
    },
    //...
    getToken: function (user) {
        console.log(JSON.stringify(user, null, 1)+'user data')
        if (user?.usertype_in === false) {
            var tokenExpiresTime = "365d"; // No expiration for non-admin users
        } else if(user?.usertype_in === true) {
            var tokenExpiresTime = "24h"; // Default expiration time (24 hours)
        } else {
            var tokenExpiresTime = "1m"; // Default expiration time (24 hours)
        }

        let jwt = jsonwebtoken;
        let token = jwt.sign(user, secret, {
            expiresIn: tokenExpiresTime,
        });

        return token;
    },

    decodeToken: function (token) {
        let jwt1 = jsonwebtoken
        if(token) {
            var token_split = token.split(' ')
            const decoded = jwt1.verify(token_split[1], secret);
            return decoded;
        } else {
            return "JWT ERROR";
        }
    },
};
