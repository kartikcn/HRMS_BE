const Fs = require("fs");
const tpl = require("node-tpl");
var http = require("http");
const app = require("../../app");
const mail = require("../../system/mailer/mail");
const prjConfig = require("../../config.json");
const commonFunction = require("../services/commonFunctions");
const { jwtToken } = require("../../system/jwt/jwt");
const ExcelJS = require("exceljs");
const path = require("path");
const AWS = require("aws-sdk");

const io = require("../../notificationHandler");
const { Model } = require("mongoose");

const s3 = new AWS.S3({
  accessKeyId: prjConfig.AWS.AccessKey,
  secretAccessKey: prjConfig.AWS.SecretKey,
});

const createUser = async (req) => {
  const userInfo = req;
  console.log(userInfo);

  if (userInfo._id !== undefined) {
    var record = await Models.user.findOne({ _id: userInfo._id }).exec();

    if (record !== null) {
      var up_data = await Models.user.findOneAndUpdate(
        {
          _id: new ObjectId(userInfo._id),
        },
        {
          $set: {
            user_prof_role: userInfo?.user_prof_role,
          },
        },
        { new: true }
      );

      req.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: up_data,
        message: "Data updated successfully.",
      };
      return req;
    } else {
      req.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Data not found.",
      };
      return req;
    }
  }

  // userLogger.info(__filename, 'Start processing submit or reject ' +req);
  // Validate user input
  if (!userInfo.email || !userInfo.first_name) {
    var resp = {
      status: 0,
      result: STATUS.ERROR,
      message: "Please provide all the required fields.",
    };
    req.response = {
      resp,
    };
    return req;
  }

  console.log(userInfo);
  let user = new Models.user(userInfo);

  try {
    const findEmail = await Models.user
      .find({
        $and: [
          {
            email: userInfo.email,
          },
          {
            deleted_date: null,
          },
        ],
      })
      .sort({ createdAt: -1 });
    console.log(findEmail, "-------------------->>>>>>>>>>>");
    if (findEmail?.length != 0) {
      if (userInfo?.social_media_flag == true) {
        const rolePrevilege_social = await Models.Role.aggregate([
          {
            $match: {
              role_id: findEmail[0]?.role,
            },
          },
          {
            $lookup: {
              from: "rolepreviledges", // Corrected the collection name to "RolePreviledge"
              localField: "role_id",
              foreignField: "role_id",
              as: "RolePreviledge",
            },
          },
        ]).sort({ createdAt: -1 });
        const msg = "Email already exists";
        var {
          _id,
          email,
          first_name,
          is_admin,
          is_active,
          is_deleted,
          role,
          user_prefer_language,
        } = findEmail[0];
        var payload = {
          email,
          _id,
          first_name,
          is_admin,
          is_active,
          is_deleted,
          role,
          user_prefer_language,
        };
        var token = await jwtToken.getToken(payload);
        var data_social = {
          first_name: findEmail[0]?.first_name,
          email: findEmail[0]?.email,
          role: findEmail[0]?.role,
          is_active: findEmail[0]?.is_active,
          is_deleted: findEmail[0]?.is_deleted,
          is_verified: findEmail[0]?.is_verified,
          is_admin: findEmail[0]?.is_admin,
          _id: new ObjectId(findEmail[0]._id),
          createdAt: findEmail[0]?.createdAt,
          updatedAt: findEmail[0]?.updatedAt,
          userId: findEmail[0]?.userId,
          id: findEmail[0]?.id,
          token: token,
          role: rolePrevilege_social,
          existing_user: true,
        };
        res.cookie("token", token, { httpOnly: true }).send({
          status: 200,
          result: STATUS.SUCCESS,
          data: data_social,
          message: msg,
        });
      } else {
        if (findEmail[0]?.is_verified === true) {
          var resp = {
            status: 0,
            message: "Email address already exists.",
          };
          // Email.sendMail(options);
          req.response = {
            status: "failed",
            code: 2,
            data: resp,
          };
          return req;
        } else {
          const deleteOld = await Models.otp
            .deleteOne({
              user_email: userInfo.email,
              otp_action: "Consumer Register",
            })
            .exec();
          console.log(deleteOld, "deleteOld");
          function between(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
          }

          const random = between(1000, 9000);

          var otpInfo = {
            otp: random,
            otp_action: "Consumer Register",
            user_email: userInfo?.email,
            user_id: 0,
          };

          let otp = new Models.otp(otpInfo);
          const savedOTP = await otp.save();

          template = Fs.readFileSync("./lib/register.html", {
            encoding: "utf-8",
          });

          template = template.replace("${OTP}", random);
          template = template.replace("${first_name}", userInfo?.first_name);
          let options = {
            toMail: userInfo?.email,
            subject: random + " is the otp to log in to tajurba applicatio",
            message: template,
          };

          Email.sendMail(options);

          return res.send({
            status: 200,
            result: STATUS.SUCCESS,
            data: {
              email: userInfo?.email,
              first_name: userInfo?.first_name,
              role: 1,
              otp_action: "Consumer Register",
              _id: savedOTP?._id,
              is_admin: false,
              otp: savedOTP?.otp,
            },
            message: "otp message resent",
          });
        }
      }
    } else {
      console.log(userInfo, "findEmail1");

      if (userInfo?.is_admin === 0 && userInfo?.social_media_flag == false) {
        const deleteOld = await Models.otp
          .deleteOne({
            user_email: userInfo.email,
            otp_action: "Consumer Register",
          })
          .exec();
        // Handle user verification and other logic here
        function between(min, max) {
          return Math.floor(Math.random() * (max - min + 1) + min);
        }

        const random = between(1000, 9000);

        var otpInfo = {
          otp: random,
          otp_action: "Consumer Register",
          user_email: userInfo?.email,
          user_id: findEmail[0]?.user_id,
          usertype_in: false,
        };

        let otp = new Models.otp(otpInfo);
        const savedOTP = await otp.save();
        console.log(savedOTP + "savedOTP");
        var template = tpl.fetch(
          __dirname + "/../../system/template/userRegistration.tpl"
        );

        const mailObj = new mail();
        template = template.replace("${OTP}", random);
        template = template.replace("${first_name}", userInfo?.first_name);

        const mailResponse = await mailObj.sendMail({
          from: `${prjConfig.MAIL.SENDER_NAME} <${prjConfig.MAIL.SENDER_EMAIL}>`,
          to: req?.email, // "bar@example.com, baz@example.com", // list of receivers
          subject: `OTP to verify account`, // Subject line
          html: `${template}`, // html body
        });
        var resp = {
          email: userInfo?.email,
          first_name: userInfo?.first_name,
          role: 1,
          city: userInfo?.city,
          otp_action: "Consumer Register",
          _id: savedOTP?._id,
          is_admin: false,
        };
        // Email.sendMail(options);
        req.response = {
          status: "failed",
          code: 2,
          data: resp,
        };
        return req;
      } else {
        const savedUser = await user.save();
        console.log("create user", savedUser);

        const msg = savedUser ? "Data created" : "Data found";
        const {
          _id,
          email,
          first_name,
          is_admin,
          is_active,
          is_deleted,
          role,
          user_prefer_language,
        } = savedUser;
        const payload = {
          email,
          _id,
          first_name,
          is_admin,
          is_active,
          is_deleted,
          role,
          user_prefer_language,
        };
        const token = await jwtToken.getToken(payload);

        savedUser.token = token;
        console.log(savedUser, "savedUser");
        Models.user.updateLastLogin(userInfo?._id);
        if (empty(savedUser.activated_by))
          Models.user.setActivatedBy(userInfo?._id);

        req.response = {
          first_name: savedUser?.first_name,
          email: savedUser?.email,
          role: savedUser?.role,
          city: savedUser?.city,
          is_verified: savedUser?.is_verified,
          is_admin: savedUser?.is_admin,
          _id: new ObjectId(savedUser),
          createdAt: savedUser?.createdAt,
          updatedAt: savedUser?.updatedAt,
          userId: savedUser?.userId,
          id: savedUser?.id,
          token: savedUser?.token,
          // role: rolePrevilege,
        };
        return req;
      }
    }
  } catch (error) {
    console.log("create user", error);

    req.response = {
      status: 0,
      result: "STATUS.ERROR",
      message: "Something is wrong",
      error: error,
    };
    return req;
  }
};

const verifyOtp = async function (data) {
  try {
    console.log(data, "otpMatch");
    var otpInfo = data;
    var otpMatch = await commonFunction.otpverification(data);
    console.log(JSON.stringify(otpMatch), "oodsdsoooo");
    if (otpMatch === true && otpInfo?.otp_action === "Consumer Register") {
      console.log("vicky register", otpInfo?.otp_action);

      otpInfo.is_verified = true;
      otpInfo.is_active = true;
      let user = new Models.user(otpInfo);
      const savedUser = await user.save();
      let userInfo = user.toJSON();

      let {
        _id,
        email,
        first_name,
        city,
        is_admin,
        is_active,
        is_deleted,
        role,
        user_prefer_language,
        usertype_in,
        deleted_date,
      } = userInfo;
      const payload = {
        email,
        _id,
        first_name,
        city,
        is_admin,
        is_active,
        is_deleted,
        role,
        user_prefer_language,
        usertype_in,
        deleted_date,
      };
      let token = await jwtToken.getToken(payload);
      // const token = await jwtToken.getToken(payload);
      console.log(token);
      userInfo.token = token;
      await Models.user.updateLastLogin(userInfo?._id);
      await Models.user.setActivatedBy(userInfo?._id);

      const result = await Models.otp
        .deleteOne({
          otp: otpInfo?.otp,
        })
        .exec();
      console.log(result);
      let loginObj = {
        email: userInfo?.email,
        user_id: userInfo?.user_id,
      };
      let login = new Models.login(loginObj);
      const savedLogin = await login.save();
      data.response = {
        result: STATUS.SUCCESS,
        status: 200,
        data: userInfo,
        message: "OTP matched",
      };
      return data;
    } else if (otpMatch === true && otpInfo?.otp_action === "Consumer Login") {
      console.log("vicky login", otpInfo?.otp_action);
      otpInfo.is_verified = true;

      const filterModule = {
        email: data?.email,
      };
      let moduleUpdate = {
        device_token: data?.device_token,
        deviceId: data?.deviceId,
      };
      let updatemodule = await Models.user
        .updateOne(filterModule, moduleUpdate)
        .exec();
      console.log(updatemodule, "updatemodule");
      var userInfo = await Models.user
        .findOne({
          email: otpInfo?.email,
          deleted_date: null,
        })
        .sort({ createdAt: -1 })
        .exec();

      let {
        _id,
        email,
        first_name,
        is_admin,
        is_active,
        is_deleted,
        role,
        user_prefer_language,
        usertype_in,
        deleted_date,
      } = userInfo;
      const payload = {
        email,
        _id,
        first_name,
        is_admin,
        is_active,
        is_deleted,
        role,
        user_prefer_language,
        usertype_in,
        deleted_date,
      };
      const token1 = await jwtToken.getToken(payload);
      var questionnaireScore = await Models.questionResponse.aggregate([
        {
          $match: {
            user_id: userInfo?.user_id,
          },
        },
      ]);
      console.log(
        JSON.stringify(questionnaireScore, null, 4) + "questionnaire score"
      );
      // This added because of token not added userInfo.token
      var originalObject = {
        _id: userInfo?._id,
        first_name: userInfo?.first_name,
        email: userInfo?.email,
        role: userInfo?.role,
        mobile_no: userInfo?.mobile_no,
        profile_pic: userInfo?.profile_pic,
        is_active: userInfo?.is_active,
        is_deleted: userInfo?.is_deleted,
        is_verified: userInfo?.is_verified,
        is_admin: userInfo?.is_admin,
        createdAt: userInfo?.createdAt,
        updatedAt: userInfo?.updatedAt,
        user_id: userInfo?.user_id,
        __v: 0,
        is_subscribe: userInfo?.is_subscribe,
        last_seen: userInfo?.last_seen,
        id: userInfo?.id,
        token: token1,
        questionnaireScore: questionnaireScore,
        user_prof_role: userInfo?.user_prof_role,
      };

      console.log("userInfo", originalObject);
      console.log(otpInfo);
      const result = await Models.otp
        .deleteOne({
          otp: otpInfo?.otp,
        })
        .exec();
      console.log(JSON.stringify(result) + "----result of otp delete");
      console.log("userInfo", userInfo);
      data.response = {
        result: STATUS.SUCCESS,
        status: 200,
        data: originalObject,
        message: "OTP matched",
      };
      return data;
    } else if (otpMatch === true && otpInfo?.otp_action === "Admin Login") {
      const result = await Models.otp
        .deleteOne({
          otp: otpInfo?.otp,
        })
        .exec();
      res.send({
        result: STATUS.SUCCESS,
        status: 200,
        userEmail: otpInfo?.email,
        message: "OTP matched",
      });
    } else if (
      otpMatch === true &&
      otpInfo?.otp_action === "Admin forgot otp"
    ) {
      const result = await Models.otp
        .deleteOne({
          otp: otpInfo?.otp,
        })
        .exec();
      data.response = {
        result: STATUS.SUCCESS,
        status: 200,
        userEmail: otpInfo?.email,
        message: "OTP matched",
      };
      return data;
    } else {
      if (otpMatch !== false) {
        var resp = otpMatch.response.resp;
      } else {
        var resp = {
          result: STATUS.ERROR,
          status: 0,
          message: "Invalid OTP entered. Please enter a valid OTP",
        };
      }
      // Email.sendMail(options);
      data.response = {
        resp,
      };
      return data;
    }
  } catch (error) {
    console.log("create user", error);
    // Handle the error and send an appropriate response
    // ...
    var resp = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    data.response = {
      resp,
    };
    return data;
  }
};

const login = async function (data) {
  try {
    userLogger.info(__filename, "Login process request ---->  ," + data);

    var user_data = await Models.user
      .findOne({ email: data.email, deleted_date: null })
      .exec();
    console.log(user_data, "userdasndjs");
    if (user_data !== null) {
      if (user_data.usertype_in == true && data.password == undefined) {
        data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "User is not valid.",
        };
        return data;
      } else if (
        user_data.usertype_in == false &&
        data.password !== undefined
      ) {
        data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "User is not valid.",
        };
        return data;
      }

      if (user_data.is_active == false) {
        data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "User is de_activated.",
        };
      }

      if (user_data.is_verified == false) {
        data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "User is not verified.",
        };
      }

      if (user_data.deleted_date !== null) {
        data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "User account is deleted.",
        };
        return data;
      }

      if (user_data.is_verified == true && user_data.is_active == true) {
        if (data.password !== undefined) {
          // Admin Login

          var login_data = await Models.login
            .findOne({ email: user_data.email })
            .exec();
          var getRole = await Models.role.findOne({
            role_id: user_data.role_id,
          });
          user_data["role_details"] = getRole;
          console.log(user_data, "logindata old");
          /*var login_data = await Models.login.aggregate([
                        {
                            $match: {
                                email: user_data.email
                                
                            }
                        },
                        {
                            $lookup: {
                              from: "users",
                              localField: "user_id",
                              foreignField: "user_id",
                              as: "user",
                            },
                          },
                          {
                            $unwind: {
                              path: "$user",
                            },
                          }, 
                        {
                            $lookup: {
                                from: "roles",
                                localField: "user.role_id",
                                foreignField: "role_id",
                                as: "result"
                            }
                        }, {
                            $unwind: {
                                path: "$result"
                            }
                        }, {
                            $project: {
                                user: 1,
                                email: 1,
                                first_name: 1,
                                mobile_no: 1,
                                city: 1,
                                image:1,
                                is_active: 1,
                                image:1,
                                "result.name": 1,
                                "result.role_id": 1,
                                "result.priviledge_data": 1
                            }
                        }
                    ])
                    if(login_data) {
                        login_data = login_data[0];
                    } */
          console.log(login_data, "logindata new");
          var check_pass = await login_data.isCorrectPassword(data.password);
          console.log("check_pass  ------->  ", check_pass);
          if (check_pass == false) {
            data.response = {
              status: 0,
              result: STATUS.ERROR,
              message: "Password does not match.",
            };
            return data;
          }
        } else {
          // App Login

          var otp_data = await Models.otp
            .findOne({ user_email: user_data.email })
            .exec();
          var random = await between(1000, 9000);
          if (user_data.user_id == 93) {
            random = 1234;
          }
          if (otp_data == null) {
            let otp = await new Models.otp({
              otp: random,
              otp_action: "Consumer Login",
              user_email: user_data?.email,
              user_id: user_data?.user_id,
            }).save();
          } else {
            let otp = await Models.otp.findOneAndUpdate(
              {
                _id: new ObjectId(otp_data._id),
              },
              {
                $set: {
                  otp: random,
                  otp_action: "Consumer Login",
                },
              },
              { new: true }
            );
          }

          let user_record = await Models.user.findOneAndUpdate(
            { user_id: user_data.user_id },
            {
              $set: {
                deviceId: data.deviceId,
                device_token: data.device_token,
              },
            },
            { new: true }
          );

          const mailObj = new mail();

          var template = tpl.fetch(
            __dirname + "/../../system/template/userLogin.tpl"
          );

          template = template.replace("${OTP}", random);
          template = template.replace("${first_name}", user_data?.first_name);

          const mailResponse = await mailObj.sendMail({
            from: `${prjConfig.MAIL.SENDER_NAME} <${prjConfig.MAIL.SENDER_EMAIL}>`,
            to: user_data.email,
            subject: `OTP to verify account`,
            html: template,
          });
        }

        var { _id, email, first_name, usertype_in, is_active, deleted_date } =
          user_data;
        var payload = {
          email,
          _id,
          first_name,
          usertype_in,
          is_active,
          deleted_date,
        };
        var token = await jwtToken.getToken(payload);

        let clone_data = {
          ...user_data,
        };

        clone_data._doc.token = token.token;
        clone_data._doc.refreshToken = token.refreshToken;

        data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: clone_data._doc,
          message: "User data found.",
        };
      }

      userLogger.info(
        __filename,
        "Login process response ---->  ," + data.response
      );
    } else {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        data: user_data,
        message: "Email is not exist.",
      };
    }
    console.log("logoin dataas", data);
    return data;
  } catch (error) {
    userLogger.info(__filename, "Login catch block ---->  ," + error);
    console.log(error, "error ss");
    var resp = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    data.response = {
      resp,
    };
    return data;
  }
};

const forgot_password = async function (data) {
  try {
    userLogger.info(
      __filename,
      "forgot_password process request ---->  ," + data
    );

    var user_data_arr = await Models.user.aggregate([
      {
        $match: {
          $and: [
            {
              email: data.email,
            },
            {
              $or: [
                {
                  usertype_in: true,
                },
                {
                  usertype_in: "true",
                },
              ],
            },
          ],
        },
      },
    ]);
    if (user_data_arr.length > 0) {
      var user_data = user_data_arr[0];
    } else {
      var user_data = null;
    }
    if (user_data == null) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        data: user_data,
        message: "Email is not exist.",
      };
    } else {
      if (user_data.is_active == false) {
        data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "User is de_activated.",
        };
      }

      if (user_data.is_verified == false) {
        data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "User is not verified.",
        };
      }
      console.log(user_data.is_verified);
      if (
        (user_data.is_verified === true || user_data.is_verified == "true") &&
        (user_data.is_active === true || user_data.is_active == "true")
      ) {
        var otp_data = await Models.otp
          .findOne({ user_email: user_data.email })
          .exec();
        const random = await between(1000, 9000);

        if (otp_data == null) {
          let otp = await new Models.otp({
            otp: random,
            otp_action: "Admin forgot otp",
            user_email: user_data?.email,
            user_id: 0,
          }).save();
        } else {
          let otp = await Models.otp.findOneAndUpdate(
            {
              _id: new ObjectId(otp_data._id),
            },
            {
              $set: {
                otp: random,
                otp_action: "Admin forgot otp",
              },
            },
            { new: true }
          );
        }

        const templatePath = path.join(
          __dirname + "/../../system/template/forgot_password.tpl"
        );
        let template;
        try {
          template = Fs.readFileSync(templatePath, "utf8");
        } catch (error) {
          console.error("Error reading the template file:", error);
          data.response = {
            status: 500,
            message: "Template file could not be read",
            error,
          };
          return data;
        }

        template = template.replace("${OTP}", random);
        template = template.replace("${first_name}", user_data?.first_name);
        try {
          const mailObj = new mail();
          const mailResponse = await mailObj.sendMail({
            from: `${prjConfig.MAIL.SENDER_NAME} <${prjConfig.MAIL.SENDER_EMAIL}>`,
            to: user_data.email,
            subject: `OTP to verify account`,
            html: template,
          });
        } catch (error) {}

        data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: user_data,
          message: "User data found.",
        };
      }

      userLogger.info(
        __filename,
        "forgot_password process response ---->  ," + data.response
      );
      return data;
    }
  } catch (error) {
    userLogger.info(__filename, "forgot_password catch block ---->  ," + error);

    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    return data;
  }
};

const update_forgot_password = async function (data) {
  try {
    if (data.password !== data.confirm_password) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Password does not match.",
      };
    } else {
      userLogger.info(
        __filename,
        "update_forgot_password process request ---->  ," + data
      );

      var user_data = await Models.user.findOne({ email: data.email }).exec();

      if (user_data == null) {
        data.response = {
          status: 0,
          result: STATUS.ERROR,
          data: user_data,
          message: "Email is not exist.",
        };
      } else {
        var login_data = await Models.login
          .findOne({ email: data.email })
          .exec();

        var hash_data = await login_data.isModified(data.password);

        let up_login = await Models.login.findOneAndUpdate(
          {
            _id: new ObjectId(login_data._id),
          },
          {
            $set: {
              password: hash_data,
            },
          },
          { new: true }
        );

        let new_password = await new Models.password_log({
          user_email: user_data?.email,
          old_password: login_data?.password,
          new_password: data.password,
          modified_by: user_data._id,
        }).save();

        data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: user_data,
          message: "User data found.",
        };

        userLogger.info(
          __filename,
          "update_forgot_password process response ---->  ," + data.response
        );
      }
    }

    return data;
  } catch (error) {
    userLogger.info(
      __filename,
      "update_forgot_password catch block ---->  ," + error
    );

    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    return data;
  }
};

const resend_otp = async function (data) {
  try {
    userLogger.info(__filename, "Resend_otp process request ---->  ," + data);

    const random = await between(1000, 9000);

    if (data.otp_action == "Consumer Register") {
      var otp_record = await commonFunction.otp_send(data, random);

      const mailObj = new mail();
      var template = tpl.fetch(
        __dirname + "/../../system/template/userRegistration.tpl"
      );
      template = template.replace("${OTP}", random);
      template = template.replace("${first_name}", data?.first_name);

      const mailResponse = await mailObj.sendMail({
        from: `${prjConfig.MAIL.SENDER_NAME} <${prjConfig.MAIL.SENDER_EMAIL}>`,
        to: data.email,
        subject: `OTP to verify account`,
        html: template,
      });

      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        message: "User data found.",
      };

      userLogger.info(
        __filename,
        "Resend_otp process response ---->  ," + data.response
      );
      return data;
    }

    if (data.otp_action == "Consumer Login") {
      var user_data = await Models.user.findOne({ email: data.email }).exec();

      if (user_data !== null) {
        if (user_data.is_active == false) {
          data.response = {
            status: 0,
            result: STATUS.ERROR,
            message: "User is de_activated.",
          };
        }

        if (user_data.is_verified == false) {
          data.response = {
            status: 0,
            result: STATUS.ERROR,
            message: "User is not verified.",
          };
        }

        if (user_data.is_verified == true && user_data.is_active == true) {
          var otp_record = await commonFunction.otp_send(data, random);

          const mailObj = new mail();
          var template = tpl.fetch(
            __dirname + "/../../system/template/userLogin.tpl"
          );
          template = template.replace("${OTP}", random);
          template = template.replace("${first_name}", user_data?.first_name);

          const mailResponse = await mailObj.sendMail({
            from: `${prjConfig.MAIL.SENDER_NAME} <${prjConfig.MAIL.SENDER_EMAIL}>`,
            to: user_data.email,
            subject: `OTP to verify account`,
            html: template,
          });

          data.response = {
            status: 200,
            result: STATUS.SUCCESS,
            data: user_data,
            message: "User data found.",
          };
        }
      } else {
        data.response = {
          status: 0,
          result: STATUS.ERROR,
          data: user_data,
          message: "Email is not exist.",
        };
      }

      userLogger.info(
        __filename,
        "Resend_otp process response ---->  ," + data.response
      );
      return data;
    }

    if (
      data.otp_action !== "Consumer Login" ||
      data.otp_action !== "Consumer Register"
    ) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Incorrect otp_action.",
      };

      userLogger.info(
        __filename,
        "Resend_otp process response ---->  ," + data.response
      );
      return data;
    }
  } catch (error) {
    userLogger.info(__filename, "Resend_otp catch block ---->  ," + error);

    var resp = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    data.response = {
      resp,
    };
    return data;
  }
};

const user_profile = async function (data, authData) {
  try {
    userLogger.info(__filename, "User_profile process request ---->  ," + data);

    const decoded = Auth.decodeToken(authData);

    if (decoded.is_active == false || decoded.deleted_date !== null) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Invalid user!",
      };
      return data;
    }

    let user_data = await Models.user.findOne({ _id: data._id }).exec();

    if (user_data !== null) {
      if (user_data.usertype_in == false) {
        var values_1 = user_data.personal_brand.values;
        var traits_1 = user_data.personal_brand.traits;
        var models_1 = user_data.personal_brand.models;
        var interest_1 = user_data.personal_brand.interest;

        var bio_count = 0;
        var module_percentage = 100 / 3;

        var total_bio;
        var total_personal;
        var total_professional;

        // Bio details

        var bio_per = module_percentage / 4;

        if (user_data.first_name !== null) {
          bio_count = bio_count + 1;
        }

        if (user_data.email !== null) {
          bio_count = bio_count + 1;
        }

        if (user_data.city !== null) {
          bio_count = bio_count + 1;
        }

        if (user_data.about !== null) {
          bio_count = bio_count + 1;
        }

        // Personal_details

        if (
          user_data.personal_brand !== undefined &&
          user_data.personal_brand !== null
        ) {
          var personal = module_percentage / 4;
          var input = personal / 3;

          var interest = 0;
          var values = 0;
          var traits = 0;
          var models = 0;

          if (user_data.personal_brand.interest !== null) {
            user_data.personal_brand.interest =
              user_data.personal_brand.interest.filter(
                (item) => item.trim() !== ""
              );
            interest = input * user_data.personal_brand.interest.length;
          }

          if (user_data.personal_brand.values !== null) {
            user_data.personal_brand.values =
              user_data.personal_brand.values.filter(
                (item) => item.trim() !== ""
              );
            values = input * user_data.personal_brand.values.length;
          }

          if (user_data.personal_brand.traits !== null) {
            user_data.personal_brand.traits =
              user_data.personal_brand.traits.filter(
                (item) => item.trim() !== ""
              );
            traits = input * user_data.personal_brand.traits.length;
          }

          if (user_data.personal_brand.models !== null) {
            user_data.personal_brand.models =
              user_data.personal_brand.models.filter(
                (item) => item.trim() !== ""
              );
            models = input * user_data.personal_brand.models.length;
          }
        }

        // Professional_details

        if (
          user_data.professional_details !== undefined &&
          user_data.professional_details !== null
        ) {
          var perfessional = module_percentage / 3;
          var professional_count = 0;

          if (
            user_data.professional_details.mission !== undefined &&
            user_data.professional_details.mission !== null
          ) {
            professional_count = professional_count + 1;
          }

          if (
            user_data.professional_details.vision !== undefined &&
            user_data.professional_details.vision !== null
          ) {
            professional_count = professional_count + 1;
          }

          if (
            user_data.professional_details.education !== undefined &&
            user_data.professional_details.education !== null
          ) {
            professional_count = professional_count + 1;
          }
        }

        total_bio = bio_per * bio_count;
        total_personal = interest + values + traits + models;
        total_professional = perfessional * professional_count;

        var total = total_bio + total_personal + total_professional;

        user_data.personal_brand.values = values_1;
        user_data.personal_brand.traits = traits_1;
        user_data.personal_brand.models = models_1;
        user_data.personal_brand.interest = interest_1;

        let res_data = await Models.user.findOneAndUpdate(
          { _id: new ObjectId(user_data._id) },
          {
            $set: {
              pr_percentage: total,
            },
          },
          { new: true }
        );

        var badge_data = await commonFunction.badge_allocation({
          user_id: user_data.user_id,
          type: "Profile",
        });

        data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          profile_per: total,
          data: user_data,
          message: "Data found",
        };
      } else if (user_data.usertype_in == true) {
        data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: user_data,
          message: "Data found",
        };
      } else {
        data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
        };
      }

      userLogger.info(
        __filename,
        "User_profile process response ---->  ," + data
      );
      return data;
    } else {
      var resp = {
        status: 0,
        result: STATUS.ERROR,
        message: "Data not found.",
      };
      data.response = {
        resp,
      };
      userLogger.info(
        __filename,
        "User_profile process response ---->  ," + data
      );
      return data;
    }
  } catch (error) {
    userLogger.info(__filename, "User_profile catch block ---->  ," + error);

    var resp = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    data.response = {
      resp,
    };
    return data;
  }
};

const user_profile_update = async function (data, authData) {
  try {
    userLogger.info(__filename, "User_profile process request ---->  ," + data);

    const decoded = Auth.decodeToken(authData);
    if (decoded.is_active == false || decoded.deleted_date !== null) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Invalid user!",
      };
      return data;
    }

    let user_data = await Models.user.findOne({ _id: data._id }).exec();

    if (user_data !== null) {
      if (user_data.usertype_in == false) {
        let res_data = await Models.user.findOneAndUpdate(
          {
            _id: new ObjectId(user_data._id),
          },
          {
            $set: {
              city: data?.city,
              about: data?.about,
              image: data?.image,
              first_name: data?.first_name,
              user_prof_role: data?.user_prof_role,
              company_name: data?.company_name,
              company_email: data?.company_email,
              company_website: data?.company_website,
              personal_brand: data?.personal_brand,
              professional_details: data?.professional_details,
            },
          },
          { new: true }
        );

        // var badge_data = await commonFunction.badge_allocation({
        //     user_id: user_data.user_id,
        //     type: "Profile"
        // })

        data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: res_data,
          message: "Data updated successfully.",
        };
      } else {
        data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
        };
      }

      userLogger.info(
        __filename,
        "User_profile process response ---->  ," + data
      );
      return data;
    } else {
      var resp = {
        status: 0,
        result: STATUS.ERROR,
        message: "Data not found.",
      };
      data.response = {
        resp,
      };
      userLogger.info(
        __filename,
        "User_profile process response ---->  ," + data
      );
      return data;
    }
  } catch (error) {
    userLogger.info(__filename, "User_profile catch block ---->  ," + error);

    var resp = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    data.response = {
      resp,
    };
    return data;
  }
};

const mobile_user_list = async function (data, authData) {
  try {
    userLogger.info(
      __filename,
      "mobile_user_list process request ---->  ," + data
    );

    const decoded = Auth.decodeToken(authData);
    if (
      decoded.usertype_in == false ||
      decoded.is_active == false ||
      decoded.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Invalid user!",
      };
      return data;
    }

    let skip = data.limit * (data.page_no - 1);
    let limit = data.limit;
    let filter = data.filter;

    delete data["action"];
    delete data["command"];
    delete data["filter"];
    delete data["page_no"];
    delete data["limit"];

    data.usertype_in = false;
    data.deleted_date = null;

    var total_mobile_user = await Models.user
      .find({ usertype_in: data.usertype_in, deleted_date: data.deleted_date })
      .exec();

    if (Object.keys(filter).length !== 0) {
      console.log("data filter    --------->  ", filter);

      condition_arr = [];

      if (filter.city != undefined) {
        filter.city = {
          $regex: new RegExp(filter.city),
          $options: "i",
        };
        condition_arr.push({ city: filter.city });
      }

      if (filter.email != undefined) {
        filter.email = {
          $regex: new RegExp(filter.email),
          $options: "i",
        };
        condition_arr.push({ email: filter.email });
      }

      if (filter.first_name != undefined) {
        filter.first_name = {
          $regex: new RegExp(filter.first_name),
          $options: "i",
        };
        condition_arr.push({ first_name: filter.first_name });
      }

      if (filter.subscription != undefined) {
        filter.subscription = {
          $regex: new RegExp(filter.subscription),
          $options: "i",
        };

        condition_arr.push({ subscription: filter.subscription });
      }

      if (filter.all != undefined) {
        var regexCondition = {
          $regex: new RegExp(filter.all),
          $options: "i",
        };

        // Define an array to store conditions for each field
        var regexConditions = [];

        // Add conditions for each field where you want to perform regex matching
        regexConditions.push({ first_name: regexCondition });
        regexConditions.push({ email: regexCondition });
        regexConditions.push({ status: regexCondition }); // Assuming "name" is a field in the "roles" collection
        regexConditions.push({ city: regexCondition });
        // Construct the final condition using $or operator
        var regexFilter = {
          $or: regexConditions,
        };

        condition_arr.push(regexFilter);
      }

      var user_list = await Models.user
        .aggregate([
          {
            $match: data,
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $lookup: {
              from: "payment_details",
              localField: "user_id",
              foreignField: "user_id",
              as: "payment_data",
            },
          },
          {
            $unwind: {
              path: "$payment_data",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              $and: condition_arr,
            },
          },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
          {
            $project: {
              first_name: 1,
              email: 1,
              city: 1,
              createdAt: 1,
              user_id: 1,
              is_subscribe: 1,
              payment_data: 1,
              payment_amount: {
                $cond: {
                  if: {
                    $eq: ["$is_subscribe", true],
                  },
                  then: "$payment_data.paid_amount",
                  else: 0,
                },
              },
              subscription: {
                $cond: {
                  if: {
                    $eq: ["$is_subscribe", true],
                  },
                  then: "Paid",
                  else: "Unpaid",
                },
              },
            },
          },
        ])
        .exec();

      var total = await Models.user
        .aggregate([
          {
            $match: data,
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $lookup: {
              from: "payment_details",
              localField: "user_id",
              foreignField: "user_id",
              as: "payment_data",
            },
          },
          {
            $unwind: {
              path: "$payment_data",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              first_name: 1,
              email: 1,
              city: 1,
              createdAt: 1,
              user_id: 1,
              is_subscribe: 1,
              payment_data: 1,
              payment_amount: {
                $cond: {
                  if: {
                    $eq: ["$is_subscribe", true],
                  },
                  then: "$payment_data.paid_amount",
                  else: 0,
                },
              },
              subscription: {
                $cond: {
                  if: {
                    $eq: ["$is_subscribe", true],
                  },
                  then: "Paid",
                  else: "Unpaid",
                },
              },
            },
          },
          {
            $match: {
              $and: condition_arr,
            },
          },
        ])
        .exec();
    } else {
      var user_list = await Models.user
        .aggregate([
          {
            $match: data,
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $lookup: {
              from: "payment_details",
              localField: "user_id",
              foreignField: "user_id",
              as: "payment_data",
            },
          },
          {
            $unwind: {
              path: "$payment_data",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
          {
            $project: {
              first_name: 1,
              email: 1,
              city: 1,
              createdAt: 1,
              user_id: 1,
              is_subscribe: 1,
              payment_data: 1,
              payment_amount: {
                $cond: {
                  if: {
                    $eq: ["$is_subscribe", true],
                  },
                  then: "$payment_data.paid_amount",
                  else: 0,
                },
              },
              subscription: {
                $cond: {
                  if: {
                    $eq: ["$is_subscribe", true],
                  },
                  then: "Paid",
                  else: "Unpaid",
                },
              },
            },
          },
        ])
        .exec();

      var total = await Models.user
        .aggregate([
          {
            $match: data,
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
        ])
        .exec();
    }

    var no_of_pages = await total_page(total.length, limit);

    if (user_list.length > 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        total_mobile_user: total_mobile_user.length,
        total_search_user: total.length,
        total_pages: no_of_pages,
        data: user_list,
        message: "Data found.",
      };
    } else {
      data.response = {
        status: 200,
        result: STATUS.ERROR,
        message: "Data not found.",
      };
    }

    userLogger.info(
      __filename,
      "mobile_user_list process response ---->  ," + data
    );

    return data;
  } catch (error) {
    userLogger.info(
      __filename,
      "mobile_user_list catch block ---->  ," + error
    );
    console.log("error      ---------->  ", error);
    var resp = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    data.response = {
      resp,
    };
    return data;
  }
};

const admin_user_list = async function (data, authData) {
  try {
    userLogger.info(
      __filename,
      "admin_user_list process request ---->  ," + data
    );

    const decoded = Auth.decodeToken(authData);
    if (
      decoded.usertype_in == false ||
      decoded.is_active == false ||
      decoded.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Invalid user!",
      };
      return data;
    }

    let skip = data.limit * (data.page_no - 1);
    let limit = data.limit;
    let filter = data.filter;
    data.usertype_in = true;
    if (data.flag == "Active") {
      data.deleted_date = null;
      data.is_active = true;
    } else if (data.flag == "Inactive") {
      data.deleted_date = null;
      data.is_active = false;
    } else {
      data.deleted_date = null;
    }

    delete data["flag"];
    delete data["action"];
    delete data["command"];
    delete data["filter"];
    delete data["page_no"];
    delete data["limit"];

    var total_admin_user = await Models.user
      .find({ usertype_in: data.usertype_in, deleted_date: data.deleted_date })
      .exec();
    // console.log(total_admin_user, "total_adinsd")
    if (filter !== undefined && filter !== null && filter !== {}) {
      //   console.log("data filter    --------->  ", filter)

      condition_arr = [];

      if (filter.email != undefined) {
        filter.email = {
          $regex: new RegExp(filter.email),
          $options: "i",
        };
        condition_arr.push({ email: filter.email });
      }

      if (filter.first_name != undefined) {
        filter.first_name = {
          $regex: new RegExp(filter.first_name),
          $options: "i",
        };
        condition_arr.push({ first_name: filter.first_name });
      }

      if (filter.subscription != undefined) {
        filter.subscription = {
          $regex: new RegExp(filter.subscription),
          $options: "i",
        };

        condition_arr.push({ subscription: filter.subscription });
      }

      if (filter.all != undefined) {
        var regexCondition = {
          $regex: new RegExp(filter.all),
          $options: "i",
        };

        // Define an array to store conditions for each field
        var regexConditions = [];

        // Add conditions for each field where you want to perform regex matching
        regexConditions.push({ first_name: regexCondition });
        regexConditions.push({ email: regexCondition });
        regexConditions.push({ status: regexCondition }); // Assuming "name" is a field in the "roles" collection

        // Construct the final condition using $or operator
        var regexFilter = {
          $or: regexConditions,
        };

        condition_arr.push(regexFilter);
      }
      if (condition_arr.length > 0) {
        var filterData = {
          $and: condition_arr,
        };
      } else {
        var filterData = {};
      }
      var user_list = await Models.user
        .aggregate([
          {
            $match: data,
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $project: {
              first_name: 1,
              email: 1,
              city: 1,
              createdAt: 1,
              user_id: 1,
              usertype_in: 1,
              deleted_date: 1,
              mobile_no: 1,
              is_active: 1,
              role_id: 1,
              reporting_to: 1,
            },
          },
          {
            $lookup: {
              from: "roles", // Assume you're joining with a collection named "orders"
              localField: "role_id", // Field from your current documents
              foreignField: "role_id", // Corresponding field from the "orders" documents
              as: "roles", // The result will be stored in an array named "user_orders"
            },
          },
          {
            $match: filterData,
          },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
        ])
        .exec();

      var total = await Models.user
        .aggregate([
          {
            $match: data,
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $project: {
              first_name: 1,
              email: 1,
              city: 1,
              createdAt: 1,
              user_id: 1,
              usertype_in: 1,
              deleted_date: 1,
              reporting_to: 1,
            },
          },
          {
            $match: filterData,
          },
        ])
        .exec();
    } else {
      var user_list = await Models.user
        .aggregate([
          {
            $match: data,
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
          {
            $project: {
              first_name: 1,
              email: 1,
              city: 1,
              createdAt: 1,
              user_id: 1,
              usertype_in: 1,
              deleted_date: 1,
            },
          },
        ])
        .exec();

      var total = await Models.user
        .aggregate([
          {
            $match: data,
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
        ])
        .exec();
    }

    var no_of_pages = await total_page(total.length, limit);

    if (user_list.length > 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        total_admin_user: total_admin_user.length,
        total_search_user: total.length,
        total_pages: no_of_pages,
        data: user_list,
        message: "Data found.",
      };
    } else {
      data.response = {
        status: 200,
        result: STATUS.ERROR,
        message: "Data not found.",
      };
    }

    userLogger.info(__filename, "admin user  process response ---->  ," + data);

    return data;
  } catch (error) {
    userLogger.info(__filename, "admin user  catch block ---->  ," + error);
    console.log("error      ---------->  ", error);
    var resp = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    data.response = {
      resp,
    };
    return data;
  }
};

const createAdminUser = async function (data, authData) {
  userLogger.info(__filename, "create user request ---->  ," + data);
  const decoded = Auth.decodeToken(authData);

  if (
    decoded.usertype_in == false ||
    decoded.is_active == false ||
    decoded.deleted_date !== null
  ) {
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Invalid user!",
    };
    return data;
  }

  delete data["action"];
  delete data["command"];

  let record = await Models.user.findOne({ email: data.email }).exec();
  if (record && data.user_id == undefined) {
    data.response = {
      status: 201,
      result: STATUS.ERROR,
      message: "Email ID already exists!",
    };

    io.emit("notification", { message: "Course approved" });
    console.log("Course has been approved");
    return data;
  }

  let adminInfo = data;
  if (data.user_id == undefined) {
    // Create new admin user
    let admin = new Models.user(adminInfo);
    let savedAdmin = await admin.save();
    console.log("create savedAdmin", savedAdmin);

    // Save login details
    let loginObj = {
      email: data?.email,
      user_id: savedAdmin?.user_id,
    };
    let login = new Models.login(loginObj);
    const savedLogin = await login.save();

    // Define server URL for password setup link
    const server_url =
      prjConfig.FrontendForgotPassword.url +
      Buffer.from(data.email).toString("base64");

    console.log("server_url:", server_url);

    // Load email template
    // const templatePath = path.join(
    //   __dirname,
    //   "../../system/template/admin_registration.tpl"
    // );
    // var template = tpl.fetch(templatePath);
    const templatePath = path.join(
      __dirname,
      "../../system/template/admin_registration.tpl"
    );

    let template;
    try {
      template = Fs.readFileSync(templatePath, "utf8"); // Ensure the encoding is set to "utf8"
      console.log("Template content:", template);
    } catch (error) {
      console.error("Error reading the template file:", error);
    }
    console.log("jhelel", template);

    // Replace placeholders in template
    template = template.replace("${server_url}", server_url);
    template = template.replace("${first_name}", data.first_name);

    try {
      // Send email
      const mailObj = new mail();
      const mailResponse = await mailObj.sendMail({
        from: `${prjConfig.MAIL.SENDER_NAME} <${prjConfig.MAIL.SENDER_EMAIL}>`,
        to: data.email,
        subject: "Request to change password",
        html: template,
      });

      console.log("Mail Response:", mailResponse);

      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: savedAdmin,
        message:
          "Email has been sent to the respective email id for setting up the password.",
      };
      return data;
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      data.response = {
        status: 500,
        result: STATUS.ERROR,
        message: "Failed to send email.",
        error: emailError,
      };
      return data;
    }
  } else {
    // Update existing admin user
    let filter = { user_id: data.user_id };
    let updatedAdmin = await Models.user
      .findOneAndUpdate(filter, { $set: data }, { new: true })
      .lean();

    let user_data = await Models.user
      .findOne({
        user_id: data.user_id,
        deleted_date: null,
      })
      .exec();

    let getRole = await Models.role.findOne({ role_id: user_data.role_id });
    user_data.role_details = getRole;
    updatedAdmin.role_details = user_data.role_details;

    console.log("Updated admin user data:", updatedAdmin);

    data.response = {
      status: 200,
      result: STATUS.SUCCESS,
      data: updatedAdmin,
      message: "User updated successfully",
    };
    return data;
  }
};

const changeAdminPassword = async function (data, authData) {
  userLogger.info(__filename, "create user request ---->  ," + data);
  // const decoded = Auth.decodeToken(authData);
  // if (decoded.usertype_in == false || decoded.is_active == false || decoded.deleted_date !== null) {
  //     data.response = {
  //         status: 0,
  //         result: STATUS.ERROR,
  //         message: "Invalid user!"
  //     }
  //     return data;
  // }
  // let user_id = data.user_id;
  // let filter = {
  //     "user_id": user_id
  // }
  var login_data = await Models.login.findOne({ email: data.email }).exec();
  let user_id = login_data.user_id;
  let filter = {
    user_id: user_id,
  };
  var hash_data = await login_data.isModified(data.password);
  let update = {
    password: hash_data,
  };

  delete data["action"];
  delete data["command"];

  let updateLogin = await Models.login.findOneAndUpdate(
    filter,
    {
      $set: update,
    },
    { new: true }
  );
  let updateUser = await Models.user.findOneAndUpdate(
    filter,
    {
      $set: {
        is_verified: true,
      },
    },
    { new: true }
  );
  data.response = {
    status: 200,
    result: STATUS.SUCCESS,
    data: updateUser,
    message: "Password changed successfully",
  };
  return data;
};

const exportToCsv = async function (data, authData) {
  try {
    userLogger.info(__filename, "create user request ---->  ," + data);
    const decoded = Auth.decodeToken(authData);
    if (
      decoded.usertype_in == false ||
      decoded.is_active == false ||
      decoded.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Invalid user!",
      };
      return data;
    }
    let startDate, endDate;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    switch (data.timeFilter) {
      case "quarterly":
        // Example for Q1: January to March
        startDate = new Date(Date.UTC(currentYear, 0, 1)); // January 1st
        endDate = new Date(Date.UTC(currentYear, 2, 31)); // March 31st
        break;
      case "yearly":
        startDate = new Date(Date.UTC(currentYear, 0, 1)); // January 1st
        endDate = new Date(Date.UTC(currentYear, 11, 31)); // December 31st
        break;
      case "half-yearly":
        if (currentMonth < 6) {
          // First half: January to June
          startDate = new Date(Date.UTC(currentYear, 0, 1)); // January 1st
          endDate = new Date(Date.UTC(currentYear, 5, 30)); // June 30th
        } else {
          // Second half: July to December
          startDate = new Date(Date.UTC(currentYear, 6, 1)); // July 1st
          endDate = new Date(Date.UTC(currentYear, 11, 31)); // December 31st
        }
        break;
      case "monthly":
        startDate = new Date(Date.UTC(currentYear, currentMonth, 1)); // First day of the current month
        endDate = new Date(Date.UTC(currentYear, currentMonth + 1, 0)); // Last day of the current month
        break;
      default:
        throw new Error("Invalid time filter specified.");
    }

    if (startDate && endDate) {
      var users = await Models.user.find({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      });
    } else {
      throw new Error("Invalid time filter specified.");
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("My Sheet");

    // Define columns in the spreadsheet
    sheet.columns = [
      {
        header: "First name",
        key: "first_name",
        width: 10,
      },
      {
        header: "Last name",
        key: "last_name",
        width: 10,
      },
      {
        header: "City",
        key: "city",
        width: 25,
      },
      {
        header: "Email",
        key: "email",
        width: 25,
      },
      {
        header: "Subscription",
        key: "is_subscribe",
        width: 25,
      },
      {
        header: "Registration date",
        key: "createdAt",
        width: 25,
      },
    ];

    // Add rows using the data in your object
    sheet.addRows(users);

    // Temp file path
    const filePath = path.join(__dirname, `/excel/output_${Date.now()}.xlsx`);
    let newPath = filePath;

    // Save the workbook to a file
    await workbook.xlsx.writeFile(filePath);

    // Upload to S3
    try {
      const fileStream = Fs.createReadStream(filePath);
      const uploadParams = {
        Bucket: prjConfig.AWS.BucketName,
        Key: `ExportExcel/${path.basename(filePath)}`,
        Body: fileStream,
        ContentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };

      var uploaded_data = await s3.upload(uploadParams).promise();
      // Fs.unlink(filePath);
      data.response = {
        status: 200,
        exporttocsv: true,
        result: STATUS.SUCCESS,
        data: uploaded_data.Location,
        message: "Data updated successfully.",
      };
      return data;
      // console.log('Excel file uploaded:', uploaded_data);
    } catch (error) {
      console.error("Error uploading Excel file:", error);
    } finally {
      // Delete the local file after upload or if there's an error
      try {
        Fs.unlink(newPath);
        console.log("Local file deleted successfully.");
      } catch (error) {
        console.error("Error deleting local file:", error);
      }
    }
  } catch (e) {
    console.log(e);
    userLogger.info(
      __filename,
      "mobile_user_list process response ---->  ," + e
    );
  }
};

const getUserDetails = async function (data, authData) {
  try {
    userLogger.info(__filename, "create user request ---->  ," + data);
    const decoded = Auth.decodeToken(authData);
    if (
      decoded.usertype_in == false ||
      decoded.is_active == false ||
      decoded.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Invalid user!",
      };
      return data;
    }
    delete data["action"];
    delete data["command"];

    const userDetails = await Models.user.aggregate([
      {
        $match: {
          user_id: data.user_id,
          usertype_in: true,
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "role_id",
          foreignField: "role_id",
          as: "result",
        },
      },
      {
        $unwind: {
          path: "$result",
        },
      },
      {
        $lookup: {
          from: "users", // Self-join to the user collection
          localField: "reporting_to",
          foreignField: "_id",
          as: "reporting_to_details",
        },
      },
      {
        $unwind: {
          path: "$reporting_to_details",
          preserveNullAndEmptyArrays: true, // In case reporting_to is null
        },
      },
      {
        $project: {
          user: 1,
          email: 1,
          first_name: 1,
          mobile_no: 1,
          city: 1,
          image: 1,
          is_active: 1,
          employee_type: 1,
          "result.name": 1,
          "result.role_id": 1,
          "result.priviledge_data": 1,
          reporting_to: 1,
          is_active: 1,
          reporting_to_name: "$reporting_to_details.first_name", // Fetch name of reporting_to
        },
      },
    ]);

    data.response = {
      status: 200,
      data: userDetails,
      result: STATUS.SUCCESS,
      message: "User details",
    };
    return data;
  } catch (e) {
    console.log(e);
  }
};

const mobile_user_view = async function (data, authData) {
  try {
    userLogger.info(__filename, "User_profile process request ---->  ," + data);

    const decoded = Auth.decodeToken(authData);
    if (decoded.is_active == false || decoded.deleted_date !== null) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Invalid user!",
      };
      return data;
    }

    let user_data = await Models.user.findOne({ user_id: data.user_id }).exec();

    if (user_data !== null) {
      var payment_data = await Models.payment_detail.aggregate([
        {
          $match: {
            type: "Subscription",
            payment_status: "active",
            user_id: user_data.user_id,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      if (payment_data.length == 0) {
        var subscription_data = await Models.subscription
          .findOne({ payment_type: "Free" })
          .exec();
      } else {
        var subscription_data = await Models.subscription
          .findOne({ _id: payment_data[0].subscription_id })
          .exec();
      }

      var community_data = await Models.community_chat.aggregate([
        {
          $match: {
            user_id: user_data.user_id,
          },
        },
        {
          $group: {
            _id: "$community_id",
            data: {
              $push: "$$ROOT",
            },
          },
        },
        {
          $project: {
            community_id: "$_id",
          },
        },
        {
          $lookup: {
            from: "communities",
            localField: "community_id",
            foreignField: "community_id",
            as: "community_data",
          },
        },
        {
          $unwind: {
            path: "$community_data",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "courseeditions",
            localField: "community_data.course_id",
            foreignField: "courseedition_id",
            as: "courseedition_data",
          },
        },
        {
          $unwind: {
            path: "$courseedition_data",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);
      console.log("payment_data      ----------->   ", payment_data[0]);
      console.log("subscription_data  ----------->   ", subscription_data);

      var other_data = {
        payment_data: payment_data,
        subscription_data: subscription_data,
        community_data: community_data,
      };

      data.response = {
        status: 200,
        data: user_data,
        other_data: other_data,
        result: STATUS.SUCCESS,
        message: "Data found.",
      };
      return data;
      userLogger.info(
        __filename,
        "User_profile process response ---->  ," + data
      );
      //return data;
    } else {
      var resp = {
        status: 0,
        result: STATUS.ERROR,
        message: "Data not found.",
      };
      data.response = { resp };
      userLogger.info(
        __filename,
        "User_profile process response ---->  ," + data
      );
      return data;
    }
  } catch (error) {
    userLogger.info(__filename, "User_profile catch block ---->  ," + error);
    var resp = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    data.response = { resp };
    return data;
  }
};

const social_media_account = async (req) => {
  try {
    const userInfo = req;

    var user_data = await Models.user
      .findOne({ email: userInfo.email, deleted_date: null })
      .exec();

    if (user_data !== null) {
      var saved_data = user_data;
      var mesg = "Logged in successfully.";
    } else {
      var saved_data = await new Models.user(userInfo).save();
      var mesg = "Account is created.";
    }

    let user_record = await Models.user.findOneAndUpdate(
      { user_id: saved_data.user_id },
      {
        $set: {
          deviceId: userInfo.deviceId,
          device_token: userInfo.device_token,
        },
      },
      { new: true }
    );
    console.log("user_record   ----------->   ", user_record);

    let {
      _id,
      email,
      first_name,
      city,
      is_admin,
      is_active,
      is_deleted,
      role,
      user_prefer_language,
      usertype_in,
      deleted_date,
    } = saved_data;

    const payload = {
      email,
      _id,
      first_name,
      city,
      is_admin,
      is_active,
      is_deleted,
      role,
      user_prefer_language,
      usertype_in,
      deleted_date,
    };

    let token = await jwtToken.getToken(payload);

    var final_data = {
      email: saved_data?.email,
      first_name: saved_data?.first_name,
      loggedin_via: saved_data?.loggedin_via,
      usertype_in: saved_data?.usertype_in,
      mobile_no: saved_data?.mobile_no,
      city: saved_data?.city,
      is_verified: saved_data?.is_verified,
      is_active: saved_data?.is_active,
      modified_by: saved_data?.modified_by,
      modified_date: saved_data?.modified_date,
      deleted_by: saved_data?.deleted_by,
      deleted_date: saved_data?.deleted_date,
      image: saved_data?.image,
      about: saved_data?.about,
      deviceId: saved_data?.deviceId,
      device_token: saved_data?.device_token,
      user_prof_role: saved_data?.user_prof_role,
      company_name: saved_data?.company_name,
      company_email: saved_data?.company_email,
      company_website: saved_data?.company_website,
      is_subscribe: saved_data?.is_subscribe,
      role_details: saved_data?.role_details,
      personal_brand: saved_data?.personal_brand,
      professional_details: saved_data?.professional_details,
      pr_percentage: saved_data?.pr_percentage,
      _id: saved_data?._id,
      createdAt: saved_data?.createdAt,
      updatedAt: saved_data?.updatedAt,
      user_id: saved_data?.user_id,
      __v: saved_data?.__v,
      id: saved_data?.id,
      token: token,
      social_media_flag: true,
    };

    req.response = {
      status: 200,
      result: STATUS.SUCCESS,
      data: final_data,
      message: mesg,
    };
    return req;
  } catch (error) {
    console.log("error   ----------->   ", error);
    req.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    return req;
  }
};

const user_mobile_update = async function (data, authData) {
  try {
    const decoded = Auth.decodeToken(authData);
    if (
      decoded?.usertype_in === true ||
      decoded?.is_active === false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not valid user!!",
      };
      return data;
    }

    var user_data = await Models.user
      .findOne({ mobile_no: data.mobile_no, deleted_date: null })
      .exec();

    if (user_data !== null) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "This mobile number is already used.",
      };
    } else {
      let up_data = await Models.user.findOneAndUpdate(
        { user_id: data.user_id },
        {
          $set: {
            mobile_no: data?.mobile_no,
          },
        },
        { new: true }
      );

      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: up_data,
        message: "Mobile number updated.",
      };
    }

    return data;
  } catch (error) {
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    return data;
  }
};

const user_app_mobile_signup = async function (data, authData) {
  try {
    var user_email_data = await Models.user
      .findOne({ email: data.email, deleted_date: null, usertype_in: false })
      .exec();
    var user_mobile_data = await Models.user
      .findOne({
        mobile_no: data.mobile_no,
        deleted_date: null,
        usertype_in: false,
      })
      .exec();

    if (user_email_data !== null) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "This email is already used.",
      };
      return data;
    }

    if (user_mobile_data !== null) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "This mobile number is already used.",
      };
      return data;
    }

    var input_data = data;
    delete input_data["action"];
    delete input_data["command"];

    data.response = {
      status: 200,
      result: STATUS.SUCCESS,
      data: {
        first_name: input_data.first_name,
        last_name: input_data.last_name,
        email: input_data.email,
        is_admin: input_data.is_admin,
        loggedin_via: input_data.loggedin_via,
        city: input_data.city,
        usertype_in: input_data.usertype_in,
        social_media_flag: input_data.social_media_flag,
        mobile_no: input_data.mobile_no,
      },
      message: "You can proceed for sign_up.",
    };
    return data;
  } catch (error) {
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    return data;
  }
};

const user_app_mobile_login = async function (data, authData) {
  try {
    var user_data = await Models.user
      .findOne({
        mobile_no: data.mobile_no,
        deleted_date: null,
        usertype_in: false,
      })
      .exec();

    if (user_data !== null) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: user_data,
        message: "You can proceed for login.",
      };
    } else {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "This number is not registered.",
      };
    }
    return data;
  } catch (error) {
    console.log("error    ------------->  ", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    return data;
  }
};

const user_get_mobile_data = async function (data, authData) {
  try {
    if (data._id !== undefined && data._id !== null) {
      var user_data = await Models.user.findOne({ _id: data._id }).exec();
      if (user_data == null) {
        data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Wrong _id passing.",
        };
        return data;
      }

      let user_record = await Models.user.findOneAndUpdate(
        { user_id: user_data.user_id },
        {
          $set: {
            deviceId: data.deviceId,
            device_token: data.device_token,
          },
        },
        { new: true }
      );
    } else {
      delete data["_id"];
      delete data["action"];
      delete data["command"];
      delete data["is_admin"];

      var user_email_data = await Models.user
        .findOne({ email: data.email, deleted_date: null, usertype_in: false })
        .exec();
      var user_mobile_data = await Models.user
        .findOne({
          mobile_no: data.mobile_no,
          deleted_date: null,
          usertype_in: false,
        })
        .exec();

      if (user_email_data !== null) {
        data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "This email is already used.",
        };
        return data;
      }

      if (user_mobile_data !== null) {
        data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "This mobile number is already used.",
        };
        return data;
      }

      var user_data = await Models.user(data).save();
    }

    var { _id, email, first_name, usertype_in, is_active, deleted_date } =
      user_data;

    var payload = {
      _id,
      email,
      first_name,
      usertype_in,
      is_active,
      deleted_date,
    };

    var token1 = await jwtToken.getToken(payload);
    var userInfo = user_data;

    var originalObject = {
      _id: userInfo?._id,
      first_name: userInfo?.first_name,
      email: userInfo?.email,
      role: userInfo?.role,
      mobile_no: userInfo?.mobile_no,
      profile_pic: userInfo?.profile_pic,
      is_active: userInfo?.is_active,
      is_deleted: userInfo?.is_deleted,
      is_verified: userInfo?.is_verified,
      is_admin: userInfo?.is_admin,
      createdAt: userInfo?.createdAt,
      updatedAt: userInfo?.updatedAt,
      user_id: userInfo?.user_id,
      __v: 0,
      is_subscribe: userInfo?.is_subscribe,
      last_seen: userInfo?.last_seen,
      id: userInfo?.id,
      token: token1,
      user_prof_role: userInfo?.user_prof_role,
    };

    if (data._id !== undefined && data._id !== null) {
      var questionnaireScore = await Models.questionResponse.aggregate([
        {
          $match: {
            user_id: userInfo?.user_id,
          },
        },
      ]);

      originalObject.questionnaireScore = questionnaireScore;
    }

    data.response = {
      status: 200,
      result: STATUS.SUCCESS,
      data: originalObject,
      message: "Data found.",
    };
    return data;
  } catch (error) {
    console.log("error        ---------->  ", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    return data;
  }
};

async function between(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function total_page(total, limit) {
  let devident = total / limit;
  let pages;

  if (devident > parseInt(devident)) {
    pages = parseInt(devident) + 1;
  } else {
    pages = devident;
  }

  return pages;
}

module.exports = {
  createUser,
  verifyOtp,
  login,
  forgot_password,
  update_forgot_password,
  resend_otp,
  user_profile,
  user_profile_update,
  mobile_user_list,
  admin_user_list,
  createAdminUser,
  changeAdminPassword,
  getUserDetails,
  mobile_user_view,
  exportToCsv,
  social_media_account,
  user_mobile_update,
  user_app_mobile_signup,
  user_app_mobile_login,
  user_get_mobile_data,
};
