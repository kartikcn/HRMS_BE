const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
//const jwt = require('jsonwebtoken');
global.jwt = require("jsonwebtoken");
const router = express.Router();
const config = require("./config");
const tokenList = {};
global.secret = "tajurbaapp";
global.jsonwebtoken = require("jsonwebtoken");
const {
  DEFAULT_USER_IMAGE,
  ROLES,
  USER_STATUS,
  ACTIVATED_BY,
  STATUS,
} = require("./constants");
// const userLogger = require('./logger');
const { encrypt, decrypt, compaire } = require("./crypto/EcryAndDcry");
const { mysql } = require("./system/database/mysql/mysqlConnection");
const { jwtToken } = require("./system/jwt/jwt");
const cors = require("cors");
const userRoute = require("./controller/user/user");
const pipeline = require("./controller/pipeline/pipeline");
const apppipeline = require("./controller/apppipeline/apppipeline");
const file = require("./controller/file/file");
const fileview = require("./controller/fileview/fileview");
const tpl = require("node-tpl");
const cron = require("node-cron");
const { Model } = require("mongoose");
const Mongoose = require("mongoose");
global.Auth = require("./module/middleware/auth");
const mail = require("./system/mailer/mail");
const { userLogger } = require("./loggerFile");
// const log = new loggerFile();
//const __filename = module.filename.split('/').slice(-1);
const moment = require("moment");

const app = express();

global.userLogger = userLogger;
app.use(
  cors({
    origin: "*",
  })
);
const autoLogoutJob = async () => {
  const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));
  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));

  try {
    const result = await Models.Attendance.updateMany(
      {
        createdAt: { $gte: startOfToday, $lte: endOfDay },
        status: "logged_in",
      },
      {
        $set: {
          status: "logged_out",
          logout_time: endOfDay,
          reason: "automatic",
        },
      }
    );

    console.log(`${result.modifiedCount} users logged out automatically.`);
  } catch (error) {
    console.error("Error in midnight auto-logout cron job:", error);
  }
};
async function updateCreditLeave() {
  try {
    const currentDate = moment().format("YYYY-MM-DD");

    const users = await Models.user.find({});
    if (users.length === 0) {
      console.log("No users found.");
      return;
    }

    const creditLeaves = await Models.creditLeave.find({});

    for (const user of users) {
      const existingLeave = creditLeaves.find(
        (leave) => leave.user_id.toString() === user._id.toString()
      );

      if (!existingLeave) {
        const newCreditLeave = new Models.creditLeave({
          user_id: user._id,
          user_name: user.first_name,
          assigned_leaves: 1,
          assigned_by: "658d616aaab868cac6542f55",
          assigned_date: currentDate,
          leaveType: "credit",
          leave_code: "CL",
        });

        // Save the new credit leave document
        await newCreditLeave.save();
        console.log(
          `Credit leave assigned to ${user.first_name} (${user.email})`
        );
      } else {
        console.log(
          `User ${user.first_name} already has credit leave for this month.`
        );
      }
    }

    console.log("Credit leave update completed.");
  } catch (err) {
    console.error("Error in updateCreditLeave:", err);
  }
}

cron.schedule("0 0 1 * *", () => {
  console.log("Running cron job to update credit leave...");
  updateCreditLeave();
});
cron.schedule("0 0 * * *", autoLogoutJob);
router.get("/", async (req, res) => {
  try {
    // for (let i = 0; i <= 200; i++) {
    //     console.log(i);
    //     const pool = null;
    //     await mysql.getSelectQueryData("SELECT * FROM qq_user ", [], pool);
    //
    // }
    res.send("Ok");
  } catch (error) {
    userLogger.error(__filename, `Request Error ${JSON.stringify(error)}`);
    res.status(404).send("Invalid request");
  }
});
router.use("/files", file);
router.use("/fileview", fileview);
router.use("/apppipeline", apppipeline);
router.post("/forgotpassword", (req, res) => {
  const postData = req.body;
  userLogger.info(
    __filename,
    "forgot password payload data => " + { data: `${JSON.stringify(postData)}` }
  );

  const user = {
    email: postData.email,
  };
  // const mysql = new mysqli();
  const pool = null;
  const promise = new Promise(async function (resolve, reject) {
    try {
      let rows = await mysql.getSelectQueryData(
        "SELECT * FROM qq_user where email = ?",
        [postData.email],
        pool
      );
      if (Object.keys(rows).length === 0) {
        userLogger.error(
          __filename,
          `Return null SELECT * FROM qq_user where email = ${postData.email}`
        );
        reject({ status: 0, message: "Email id not found..." });
      } else {
        const temp = __dirname + "/system/template/forgotPassword.tpl";
        console.log("password changes email sending....", temp);
        tpl.assign("link", postData.baseLink + "/" + rows[0]["resetPassword"]);
        var html = tpl.fetch(temp);
        //userLogger.info(`forgot mail templete mail ${html}`);
        console.log("token", {
          name: config.MAIL.SENDER_NAME,
          email: config.MAIL.SENDER_EMAIL,
        });
        const mailObj = new mail();
        const mailResponse = await mailObj.sendMail({
          from: `${config.MAIL.SENDER_NAME} <${config.MAIL.SENDER_EMAIL}>`, //'"Fred Foo 👻" <foo@example.com>', // sender address
          to: `${rows[0]["email"]}`, //"bar@example.com, baz@example.com", // list of receivers
          subject: `Reset Password from QQ_Section APP Admin`, // Subject line
          html: `${html}`, // html body
        });
        console.log("res", mailResponse);
        resolve([
          { status: 1, message: "Reset password link has beed sent..." },
        ]);
      }
    } catch (error) {
      reject({ status: 0, message: "Unexpected exception...", errors: error });
    } finally {
    }
  });
  promise
    .then(async function (data) {
      userLogger.info(
        __filename,
        "User Data " + { data: `${JSON.stringify(data)}` }
      );
      res.status(200).json({
        status: 1,
        message: "Forgot password send success...! ",
        response: data,
      });
    })
    .catch(async function (error) {
      userLogger.info(
        __filename,
        "Forgot password send error" + { data: `${JSON.stringify(error)}` }
      );
      res.status(200).json({ status: 0, message: error });
    });
});

router.post("/login", (req, res) => {
  const postData = req.body;
  //userLogger.info(`Login payload data => ${JSON.stringify(postData)}`);
  userLogger.info(
    __filename,
    `Login payload data => ${JSON.stringify(postData)}`
  );
  const user = {
    email: postData.email,
  };
  // const mysql = new mysqli();
  const pool = null;
  const promise = new Promise(async function (resolve, reject) {
    try {
      let rows = await mysql.getSelectQueryData(
        "SELECT * FROM qq_user where email = ?",
        [postData.email],
        pool
      );
      if (Object.keys(rows).length === 0) {
        userLogger.error(
          __filename,
          `Return null SELECT * FROM qq_user where email = ${postData.email}`
        );
        reject(`Invalid Username Password ..!`);
      } else {
        let decPassword = decrypt(rows[0].password);
        if (decPassword === postData.password) {
          resolve(rows);
        } else {
          reject("Invalid Username Password ..!");
        }
      }
    } catch (error) {
      reject(error);
    }
  });
  promise
    .then(async function (data) {
      const userData = data[0];
      // userLogger.info('User Data ', { data: `${JSON.stringify(data[0])}` });
      let response = await jwtToken.getToken(userData);
      userLogger.info(__filename, `User Data 111  ${JSON.stringify(response)}`);
      res
        .status(200)
        .json({ status: 1, message: "Login success...! ", response: response });
    })
    .catch(async function (error) {
      userLogger.info(__filename, `login error ${JSON.stringify(error)}`);
      res.status(200).json({ status: 0, message: error });
    });
});

router.post("/addshop", (req, res) => {
  const postData = req.body;
  //userLogger.info(`Login payload data => ${JSON.stringify(postData)}`);
  userLogger.info(
    __filename,
    `addshop payload data => ${JSON.stringify(postData)}`
  );
  const shop = [
    postData.shopDomain,
    postData.token,
    postData.apiKey,
    postData.scope,
  ];
  // const mysql = new mysqli();
  const pool = null;
  const promise = new Promise(async function (resolve, reject) {
    try {
      let data = [];
      let rows = await mysql.getSelectQueryData(
        "SELECT * FROM qq_shop where shopDomain = ?",
        [postData.shopDomain],
        pool
      );
      userLogger.info(__filename, `rows => ${JSON.stringify(rows)}`);
      if (Object.keys(rows).length > 0) {
        userLogger.error(
          __filename,
          `Return null SELECT * FROM qq_shop where shopDomain = ${postData.shopDomain}`
        );
        // reject(`App Already installed ..!`);
        reject({
          status: "failed",
          code: 0,
          message: "App Already installed ..!",
        });
      } else {
        const query =
          "INSERT INTO `qq_shop`( `shopDomain`, `token`, `apiKey`, `scope`) VALUES (?,?,?,?)";
        userLogger.info(
          __filename,
          `${query} => ${JSON.stringify(shop, null, 4)}`
        );
        let result = await mysql.setQueryData(query, shop, pool);
        userLogger.error(__filename, `Return nresult = ${result}`);
        if (result) {
          resolve({
            status: "success",
            code: 1,
            message: "New shop added ....",
          });
        } else {
          reject({
            status: "failed",
            code: 0,
            message: "Error on adding new shop...",
          });
          // reject(data);
        }
      }
    } catch (error) {
      reject({
        status: "failed",
        code: 0,
        message: "Error on adding new shop catch...",
      });
    }
  });
  promise
    .then(async function (data) {
      userLogger.info(__filename, `User Data 111  ${JSON.stringify(data)}`);
      res.status(200).json({
        status: 1,
        message: "Shop added success...! ",
        response: data,
      });
    })
    .catch(async function (error) {
      userLogger.info(__filename, `login error ${JSON.stringify(error)}`);
      res.status(200).json({ status: 0, message: error });
    });
});
router.post("/resetPassword", (req, res) => {
  const postData = req.body;
  //userLogger.info(`Login payload data => ${JSON.stringify(postData)}`);
  userLogger.info(
    __filename,
    `addshop payload data => ${JSON.stringify(postData)}`
  );

  const pool = null;
  const data = {};
  const promise = new Promise(async function (resolve, reject) {
    try {
      if (postData?.password == postData?.confirmPassword) {
        let newPassword = encrypt(postData?.password);
        let updateQuery =
          "UPDATE qq_user SET `password`= ?, `resetPassword`=uuid()   WHERE   resetPassword= ?";
        const params = [newPassword, postData?.resetPassword];
        userLogger.info(
          __filename,
          `Change Password Query  ${updateQuery} ${params}`
        );
        let result = await mysql.setQueryData(updateQuery, params, pool);
        console.log("data", result);
        if (result?.affectedRows > 0) {
          data.response = {
            status: "success",
            code: 1,
            message: "password changed..",
          };
          resolve(data);
        } else {
          data.response = {
            status: "failed",
            code: 0,
            message: "Link is expired please generate new link.",
          };
          reject(data);
        }
      } else {
        data.response = {
          status: "failed",
          code: 0,
          message: "Password not match...",
        };
        reject(data);
      }
    } catch (error) {
      reject({
        status: "failed",
        code: 0,
        message: "Error on changeing password ...",
      });
    }
  });
  promise
    .then(async function (data) {
      userLogger.info(__filename, `User Data 111  ${JSON.stringify(data)}`);
      res
        .status(200)
        .json({ status: 1, message: "success...! ", response: data });
    })
    .catch(async function (error) {
      userLogger.info(__filename, `login error ${JSON.stringify(error)}`);
      res.status(200).json({ status: 0, data: error });
    });
});

router.post("/token", (req, res) => {
  // refresh the damn token
  const postData = req.body;
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, config.refreshTokenSecret, function (err, decoded) {
      if (err) {
        return res
          .status(401)
          .json({ error: true, message: "Usnauthorized access." });
      }
      req.decoded = decoded;
    });
  }
  const userData = req.decoded;
  // if refresh token exists
  if (postData.refreshToken) {
    const user = {
      userId: userData.userId,
      name: userData.name,
      email: userData.email,
    };
    const token = jwt.sign(user, config.secret, {
      expiresIn: config.tokenLife,
    });
    const response = {
      token: token,
      refreshToken: postData.refreshToken,
    };
    // update the token in the list
    tokenList[postData.refreshToken] = token;
    res.status(200).json(response);
  } else {
    res.status(404).send("Invalid request");
  }
});

router.use(require("./tokenChecker"));

router.get("/secure", (req, res) => {
  // all secured routes goes here
  res.send("I am secured...");
});

router.post("/shoplist", (req, res) => {
  // all secured routes goes here
  const postData = req.body;
  userLogger.info(
    __filename,
    "Shoplist payload data => " + { data: `${JSON.stringify(postData)}` }
  );
  const order = postData.order == "DESC" ? "DESC" : "ASC";
  const query = `SELECT * FROM \`qq_shop\` WHERE status = ? and isDeleted = ?  ORDER BY ? ${order}  limit ? , ?`;
  const param = [
    postData.status,
    postData.isDeleted,
    postData.byId,
    postData.offset,
    postData.limit,
  ];
  const pool = null;
  const promise = new Promise(async function (resolve, reject) {
    try {
      let rows = await mysql.getSelectQueryData(query, param, pool);
      if (Object.keys(rows).length === 0) {
        reject(`Return null ${query} => ${param}`);
      } else {
        resolve(rows);
      }
    } catch (error) {
      reject(error);
    }
  });
  promise
    .then(async function (data) {
      userLogger.info(
        __filename,
        "Shop Data Data " + { data: `${JSON.stringify(data)}` }
      );
      res.status(200).json(data);
    })
    .catch(async function (error) {
      userLogger.info(
        __filename,
        "Shop data error" + { data: `${JSON.stringify(error)}` }
      );
      res.status(404).send("Invalid request");
    });
  //res.send('I am secured...');
});

//controller list and
app.use(bodyParser.json());

app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: true }));

router.use("/user", userRoute);
router.use("/pipeline", pipeline);
router.use("/file", file);

app.use("/api", router);

module.exports = app;
//module.exports = {io};
// app.listen(config.port || 3000);
