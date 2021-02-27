// IB Note.JS Server Back Program - Main Program
// Author: Li Hong Zephan
// This main.js monitors all node.js servers, and send the server list to client for a round robin server call


// Section A. Variable Declaration


// Game List Array from Redis
global.aryServerList = [];


// Global Base Port
global.intBasePort = 10000;




// B. Import/Require Files



// A1. 3rd Party Files
const fs = require('fs');



// A2. Config Files
const config = require('./configMain');



// A3. Utilities Files (Same for all project)
const mUT = require('./apijs/utils.js');
const mRU = require('./apijs/redisUtil.js');



// A4. Utilities Files (For this project only)
const mUTMain = require('./mainjs/utilMain.js');



// A5. Other Program Files (For this project only)
const mSoc = require('./mainjs/socket_io.js');



// A6. Web Server Monitor and Socket.IO

// Socket.IO Server for Server Monitor to connect

// Original http version
// const WebServerMonitor = require('express')();
// const httpWebServerMonitor = require('http').Server(WebServerMonitor);
// global.ioServer = require('socket.io')(httpWebServerMonitor);
// global.ioServer.origins('*:*');



// B0. SSL
global.filePrivKey = fs.readFileSync("/www/server/panel/vhost/ssl/" + config.cstrUrl + "/privkey.pem").toString();
let fullChain = fs.readFileSync("/www/server/panel/vhost/ssl/" + config.cstrUrl + "/fullchain.pem");
let objTemp = mUTMain.funSSLReadCertAndChainFromFullChain(fullChain);
global.fileCert = objTemp.strCert;
global.fileChain = objTemp.strChain;


// Socket.IO Server for Client to connect
const ioClient = require('socket.io');
const httpClient = require('http');
const httpsClient = require('https');


// New https version
const WebServerMonitor = require('express');
const WebServerMonitorApp = WebServerMonitor();
const credentials = {key: global.filePrivKey, cert: global.fileCert, ca: global.fileChain};
const httpsWebServerMonitor = httpsClient.createServer(credentials, WebServerMonitorApp);
global.ioServer = require('socket.io')(httpsWebServerMonitor);
global.ioServer.origins('*:*');



// B. Global Vars for all project




// B1. global.gbolDebug = true means Debug Mode, Some console.log only appears in Debug Mode
global.gbolDebug = true;



// B2. Date Format
Date.prototype.Format = function (fmt) { //author: meizz
  let o = {
      "M+": this.getMonth() + 1, // Month
      "d+": this.getDate(), // Day
      "h+": this.getHours(), // Hour
      "m+": this.getMinutes(), // Minute
      "s+": this.getSeconds(), // Seconds
      "q+": Math.floor((this.getMonth() + 3) / 3), // Quarter
      "S": this.getMilliseconds() // Milliseconds
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (let k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
};






// C. Debug Console Related

// C1. Console








WebServerMonitorApp.get('/', function (req, res) {
  res.sendFile(__dirname + '/server.html');
});
httpsWebServerMonitor.listen(global.intBasePort + config.cintPortWeb, function () {
  mUTMain.funPrint(config.cstrAppName + ' WebServer Monitor listening on *: ' + (global.intBasePort + config.cintPortWeb), false);
});

global.ioServer.on('connection', function (socket) {
    mUTMain.funPrint(config.cstrAppName + ' WebServer Monitor Initialized', false);
    socket.on('disconnect', function () {
      mUTMain.funPrint(config.cstrAppName + ' WebServer Monitor Disconnected', false);
    });
});
// ***** End - Codes for Web Server Monitor



// F2. Debug Info to WebServerMonitor and/or console, if any
function funShowServers() {
  for (let i = 0; i < global.aryServerList.length; i++) {
      try {
          mUTMain.funUpdateServerMonitor("Socket ID: " + global.aryServerList[i].strSocketID + 
              ", Server Name: " + global.aryServerList[i].strServerName + 
              ", No. of Child: " + global.aryServerList[i].intChildNo, true);
      } catch (err) {
          //
      }
  }
  mUTMain.funUpdateServerMonitor("Total No. of Node.js Server Master Connected: " + global.aryServerList.length, true);

  setTimeout(funShowServers, config.cintFunShowServers);
}

// Show Servers in Web Server Monitor Every ? seconds defined in config.db
funShowServers();




// Timer for Disconnect clients (in main.js clients means node.js application servers) without HB
function funCheckHB() {
  try {
    for (let i = 0; i < global.aryServerList.length; i++) {
      // If current time > (last HB received + timeout e.g. 30 seconds)
      if (Date.now() > global.aryServerList.lastHB + config.cintHBTimeout) {
        // mRU.funUpdateServerMonitor("No HB Disconnect: " + global.aryClients[i].connectionCode, true);
        // Disconnect That Client
        global.aryServerList[i].socket.disconnect();
      }
    }
  } catch (err) {
    // If someone disconnect, there will be an error because aryClients.length changes
    // mRU.funUpdateServerMonitor("No HB Disconnect Error: " + err, true);
  }

  // Check Every (Timeout / 3) Milliseconds
  setTimeout(funCheckHB, Math.floor(config.cintHBTimeout / 3));
}



// D. Socket.IO Server Related

// Socket.IO Server for Client to connect
const serverClient = httpClient.createServer(function (req, res) {
    let headers = {};
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    //    headers["Access-Control-Allow-Credentials"] = true;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept";
    res.writeHead(200, headers);
    res.end();
});
const serverClientHTTPS = httpsClient.createServer({
    key: global.filePrivKey,
    cert: global.fileCert,
    ca: global.fileChain,
    // ca: fs.readFileSync("./certs/fullchain.pem"),
    requestCert: false,
    // requestCert: true,
    rejectUnauthorized: false
  },
  function (req, res) {
    let headers = {};
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    //     headers["Access-Control-Allow-Credentials"] = true;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept";
    res.writeHead(200, headers);
    res.end();
});
serverClient.listen(global.intBasePort + config.cintPortSocketIO, '');
serverClientHTTPS.listen(global.intBasePort + config.cintPortSocketIOS, '');
mUTMain.funPrint(config.cstrAppName + ' Socket.IO Server running at port: ' + (global.intBasePort + config.cintPortSocketIO), false);
mUTMain.funPrint(config.cstrAppName + ' Socket.IO HTTPS Server running at port: ' + (global.intBasePort + config.cintPortSocketIOS), false);



// E. HTTP & HTTPS Server for API

// Allow CORS
const cors = require('cors');
const express = require('express');
const DB = require('./apijs/db');
const bodyParser = require('body-parser');
const db = new DB();

const appAPI = express();
appAPI.use(cors());

appAPI.options('/*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.sendStatus(200);
    next();
});

const appNBC = express.Router();
appNBC.use(bodyParser.urlencoded({
    extended: false
}));
appNBC.use(bodyParser.json());

// Read all Routers here
require('./mainroutes/index.js')(appNBC);

appAPI.use(appNBC);

// http & https listening
const httpServer = require('http').Server(appAPI);


const httpsServer = httpsClient.createServer({
    // fullchain = cert + chain
    // bt fullchain position: /www/server/panel/vhost/ssl/www.yoururl.com
    key: global.filePrivKey,
    cert: global.fileCert,
    ca: global.fileChain,
    // ca: fs.readFileSync("./certs/fullchain.pem"),
    requestCert: false,
    // requestCert: true,
    rejectUnauthorized: false
}, appAPI);

// http listen
httpServer.listen(global.intBasePort + config.cintPortWebHTTP, function () {
  mUTMain.funPrint(config.cstrAppName + ' HTTP Server listening on *: ' + (global.intBasePort + config.cintPortWebHTTP), false);
});

// https listen
httpsServer.listen(global.intBasePort + config.cintPortWebHTTPS, function () {
  mUTMain.funPrint(config.cstrAppName + ' HTTPS Server listening on *: ' + (global.intBasePort + config.cintPortWebHTTPS), false);
});



// Listen to socket old method
// var socketAll = ioClient.listen(serverClient);

// Listen to socket New method, allow http & https together
global.socketAll = new ioClient();
global.socketAll.attach(serverClient, {
    // pingInterval: 60000,
    // pingTimeout: 180000,
       transports: ['websocket'],
});
global.socketAll.attach(serverClientHTTPS, {
    // pingInterval: 60000,
    // pingTimeout: 180000,
       transports: ['websocket'],
});

// Attach socket.io to Redis
const redisAdapter = require('socket.io-redis');
global.socketAll.adapter(redisAdapter({ host: config.redisHost, port: config.redisPort, password: config.redisPw}));

global.socketAll.on('connection', function (socket) {
    // Update Web Monitor
    mUTMain.funUpdateServerMonitor("Node.js Server Connected, Socket ID: " + socket.id + "   Connection Type: " + socket.conn.transport.name, false);

    // Add Connection to Array with Empty User ID
    mSoc.funAddServerList(socket);

    // Send aryClients to All connection user
    // funSendAryClients();

    // 
    socket.on('MainGetMasterInfo', function (data) {
      mUTMain.funUpdateServerMonitor("Data from Node.js Server: " + data[0], true);
      mSoc.funMainGetMasterInfo(socket, data[0]);
    });


    // On disconnect
    socket.on('disconnect', function () {
      mUTMain.funUpdateServerMonitor("Node.js Server Disconnected, Socket ID: " + socket.id, false);
      mSoc.funDisconnect(socket);
    });

    // Catch any unexpected error, to avoid system hangs
    socket.on('error', function () {
      mUTMain.funUpdateServerMonitor("Unexpected Socket.IO Error, Socket ID: " + socket.id, false);
    });

    // On Heartbeat
    // socket.on('HB', function (objData) {
    //   mSoc.funHeartBeat(socket, objData);
    // });



    // Below on other message
    // socket.on('message', function (objData) {
    //   mSoc.funOnMessage(socket, objData);
    // });
    


    // On test message
    socket.on('test', function (strTemp) {
      mUTMain.funPrint('test: ' + strTemp, true);
    });

});


// Main Subscribe Channel Web Server Monitor
mRU.redisSubChan(config.cstrRCN_WSM);

// Check Heart Beat
funCheckHB();