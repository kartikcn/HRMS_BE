const { Console } = require("console");
const Fs = require("fs-extra");
const Path = require("path");
global.Mongoose = require("mongoose");
global.ObjectId = Mongoose.Types.ObjectId;
const dbConfig = Config.get("Database");
console.log(JSON.stringify(dbConfig) + "dbconfig");
let options = {
  //useCreateIndex: true,
  useNewUrlParser: true,
  dbName: dbConfig.dbName,
  // poolSize: 25,
  //reconnectTries: 60,
  //reconnectInterval: 1000,
  //bufferMaxEntries: 0,

  useUnifiedTopology: true,
  // useFindAndModify: false,
};
if (dbConfig.Type === "CERT") {
  const credentials = Fs.readFileSync("./config/" + dbConfig.SSL_CERT);
  options = {
    ...options,
    sslCert: credentials,
    sslKey: credentials,
    authSource: "$external",
    authMechanism: "MONGODB-X509",
  };
}

Mongoose.connect(dbConfig.URL, options);

var mongodb = Mongoose.connection;

mongodb.on("error", console.error.bind(console, "connection error:"));
mongodb.once("open", function () {});
//Mongoose.set("useFindAndModify", false);
Mongoose.set("debug", dbConfig.Debug);

var db = {};

Fs.readdirSync(__dirname)
  .filter(function (file) {
    return file.indexOf(".") !== 0 && file !== "index.js";
  })
  .forEach(function (file) {
    var filename = file.split(".")[0];
    var model = require(Path.join(__dirname, file));
    db[filename] = model;
  });
//Mongoose.set('useFindAndModify', false);
db.mongoose = Mongoose;
module.exports = db;
