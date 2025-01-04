#!/usr/bin/env node

/**
 * Module dependencies.
 */
 console.log("ddddvf")
 const app = require("../app");
 var debug = require("debug")("teacher-api:server");
 var http = require("http");
 var https = require("http");
 const appport = Config.get("App"); // TO access port uncomment this
 const config = require('../config.json');
 

 
 /**
  * Create HTTP server.
  */
  console.log(appport)
  console.log(appport.PORT)
  /**
   * Get port from environment and store in Express. 
   */
  //console.log(config.port, "process.env.PORT", "dev")
  // var port = normalizePort(appport.PORT || "1205");
  // app.set("port", port);
  // console.log(port, "port")
  
  var port = normalizePort(1602);
  app.set('port', port);
 console.log('port---'+port)
 var server = https.createServer(app);
 
 const io = require("socket.io")(server, {
   cors: {
     origin: ["http://localhost:3000", ""],
     methods: ["GET", "POST"],
   },
 });
 io.on("connection", (socket) => {
   socket.on("name", (data) => {
     io.emit("name", data);
   });
   socket.on("action", (data) => {
     io.emit("action", data);
   });
   console.log("socket.io connected");
 });
 /**
  * Listen on provided port, on all network interfaces.
  */
 
 server.listen(port);
 server.on("error", onError);
 server.on("listening", onListening);
 
 /**
  * Normalize a port into a number, string, or false.
  */
 
 function normalizePort(val) {
   var port = parseInt(val, 10);
 
   if (isNaN(port)) {
     // named pipe
     return val;
   }
 
   if (port >= 0) {
     // port number
     return port;
   }
 
   return false;
 }
 
 /**
  * Event listener for HTTP server "error" event.
  */
 
 function onError(error) {
   if (error.syscall !== "listen") {
     throw error;
   }
 
   var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
 
   // handle specific listen errors with friendly messages
   switch (error.code) {
     case "EACCES":
       console.error(bind + " requires elevated privileges");
       process.exit(1);
       break;
     case "EADDRINUSE":
       console.error(bind + " is already in use");
       process.exit(1);
       break;
     default:
       throw error;
   }
 }
 
 /**
  * Event listener for HTTP server "listening" event.
  */
 
 function onListening() {
   var addr = server.address();
   var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
   debug("Listening on " + bind);
 }
 