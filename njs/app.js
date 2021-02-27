// IB Note.JS Server Backend Program
// Author: Li Hong Zephan

// Section A. Variable Declaration

// Is this the Master Process among ALL processes inside this app.js ?
global.bolMasterProcess = false;

// Server Name
global.strServerName = "";

// Global intStep, this value is set ONLY by MAIN PROGRAM Master Process, 
// and READONLY for all other process
// Main Program will increment this value when the Redis Data is read from DB,
// and ready to be retrieved by other processes
global.intStep = 1;

// Global Base port
global.intBasePort = 7500;

// Global certs
global.bolHaveCerts = false;
global.filePrivKey = '';
global.fileCert = '';
global.fileChain = '';

// Global aryChild
global.aryChild = [];
global.intIndexAryChild = 0;


// Section B. Get Program Arguments
const argNodes = process.argv.slice(2);



// A. Import/Require Files

// A1. 3rd Party Files
const fs = require('fs');

// A2. Config Files
const config = require('./apijs/config.js');

// A3. Utilities Files (Same for all project)
const mUT = require('./apijs/utils.js');
const mRU = require('./apijs/redisUtil.js');
const DB = require('./apijs/db');
const db = new DB();

// A4. Utilities Files (For this project only)
// var mEmail = require('./utils/email.js');

// A5. Other Program Files (For this project only)
// const mSoc = require('./thisjs/socket_io.js');

// A6. Socket.IO

global.socketAll = "";

// Socket.IO Server for Client to connect
const ioClient = require('socket.io');
const httpClient = require('http');
const httpsClient = require('https');



// Before next section

// Get Argument
if (argNodes.length != 0 || true) {
  let bolArgGotBasePort = false;
  let bolArgGotServerName = false;
  for (let i = 0; i < argNodes.length; i++) {
    if (argNodes[i].indexOf('BasePort') >= 0) {
      bolArgGotBasePort = true;
      global.intBasePort = parseInt(argNodes[i].substr(8));
    } else if (argNodes[i].indexOf('ServerName') >= 0) {
      bolArgGotServerName = true;
      // Suppose argument = "ServerNameMain", then global.strServerName = "Main"
      global.strServerName = argNodes[i].substr(10);
    } else {
      // pass
    }
  }
  if (!bolArgGotBasePort || !bolArgGotServerName) {
    mUT.funUpdateConsole("Program exit: Required BasePort or ServerName, e.g. node app.js BasePort7500 ServerNameServer1", false);
    process.exit();
  }
}



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

// B3. Global Error, must exit application
global.bolGlobalError = false;



// *** Clustering Start Here *** //
const cluster = require('cluster');
const { rootCertificates } = require('tls');
const { moveCursor } = require('readline');
const numCPUs = Math.min(require('os').cpus().length, config.cintMaxCpu);

// Clients Connected to this process
global.aryClients = [];

// Clients Connected to all processes
global.aryAllClients = [];



// Timer for All Processes, run every second
function funTimerAll() {

  try {
    // Increment Counter
    global.intCounter += 1;

    // Check Exit Program?
    if (global.bolGlobalError) {
      process.exit();
    }

    if (global.bolMasterProcess) {
      // Master Timer
      if (global.intStep == 1) {
        // create socket io, connect to main
        funMasterCreateWorker();
      } else if (global.intStep == 2) {
        funMasterConnectMain();
        // Send global.aryChild to all childs thru Redis
        let objMsg = {
          aryChild: global.aryChild,
        };
        let strMsg = JSON.stringify(objMsg);
        mRU.funRedisPublish(global.strServerName + "::" + config.cstrRCN_MACAryChild, strMsg);
      } else {
        // Pass
      }
    } else {
      // Child Timer
      if (global.intStep == 1) {
        // Get certs for creating socket server
        mRU.redisSubChan(global.strServerName + "::" + config.cstrRCN_MACCert);
        mRU.redisSubChan(global.strServerName + "::" + config.cstrRCN_MACAryChild);
        global.intStep = 2;
      } else if (global.intStep == 2) {
        // Create socket server
        if (global.bolHaveCerts) {
          funChildCreateServer();
        }
      }
    }

    // Re-run timer
    setTimeout(funTimerAll, 1000);
  } catch (err) {
    mUT.funUpdateConsole("timerAll error: " + err.message, false);
    process.exit();
  }
}



// Master and Child Process
if (cluster.isMaster) {
  // Master Process
  global.bolMasterProcess = true;

  // This is Master
  mUT.funUpdateConsole(`Server Name: ${global.strServerName} - Master Process: ${process.pid} Started`, false);
  mRU.funUpdateServerMonitor(`Server Name: ${global.strServerName} - Master Process: ${process.pid} Started`, false);

  // End for Master Cluster
} else {
  // Child Process
  // Not Doing it here until child Process get the Child Number from Redis, do this in cluster.fork
  // mUT.funUpdateConsole(`Server Name: ${global.strServerName} - Child Process: ${process.pid} Started`, false);
  // mRU.funUpdateServerMonitor(`Server Name: ${global.strServerName} - Child Process: ${process.pid} Started`, false);

  // Declare variables for Child Process
  var serverClient, serverClientHTTPS;
  // var socketAll;

  // End for Child Cluster
}
// *** Clustering End *** //





// Master functions

function funMasterCreateWorker() {
  // Create Worker
  if (!global.bolGlobalError) {
    for (let i = 0; i < numCPUs; i++) {
      let worker = cluster.fork();
      // The Following worker.process.pid is the Child Process process.pid
      // so i + 1 means the Child Number!!!!!!!!!!
      global.aryChild.push({
        intPid: worker.process.pid,
        intChildNo: i+1,
      });
      mUT.funUpdateConsole(`Server Name: ${global.strServerName} - Child No: ${i+1} Process ID: ${worker.process.pid} Started`, false);
      mRU.funUpdateServerMonitor(`Server Name: ${global.strServerName} - Child No: ${i+1} Process ID: ${worker.process.pid} Started`, false);
    }
  }

  // Cluster Events
  cluster.on('exit', (worker, code, signal) => {
    // mUT.funUpdateConsole(`Worker Process: ${worker.process.pid} exited`, false);
    // mUT.funUpdateConsole('Master Process will now exit as well', false);
    global.bolGlobalError = true;
  });

  global.intStep = 2;
}

function funMasterConnectMain() {
  // Change intStep to 3
  // in order to make sure that funMassterConnectMain will not be called more than once
  global.intStep = 3;

  // Socket IO client connect to Main
  let strDomain = "https://" + config.cstrMainIP + ":" + config.cintMainPort;
  var io = require("socket.io-client");
  var socketMaster = io(strDomain, { transports: ["websocket"] });
  // console.log("Master will connect to Main: " + strDomain);

  // Connected
  socketMaster.on("connect", () => {
    mUT.funUpdateConsole("Server Name: " + global.strServerName + " Master Process connected to Main Program, server socket.id: " + socketMaster.id, false);
    mRU.funUpdateServerMonitor("Server Name: " + global.strServerName + " Master Process connected to Main Program, server socket.id: " + socketMaster.id, false);
    let objMasterInfo = {
      strServerName: global.strServerName,
      intChildNo: numCPUs,
      strUrl: config.cstrMyUrl,
      intPortSocketIO: global.intBasePort + config.cintPortSocketIO,
      intPortSocketIOS: global.intBasePort + config.cintPortSocketIOS,
      intPortWebHTTP: global.intBasePort + config.cintPortWebHTTP,
      intPortWebHTTPS: global.intBasePort + config.cintPortWebHTTPS,
    };
    socketMaster.emit("MainGetMasterInfo", [objMasterInfo]);
  });

  // Connection Error exists
  socketMaster.on("connect_error", (err) => {
    mUT.funUpdateConsole("Socket connection error: " + err, false);
    // Must leave process
    process.exit();
  });

  socketMaster.on("MainReturnMasterLogin", (data) => {
    let strCode = data[0].strCode;
    mUT.funUpdateConsole("Server Name: " + global.strServerName + " Master Process Get Login Status from Main, code: " + strCode, false);
    if (strCode == "0000") {
      // success
      mUT.funUpdateConsole("Server Name: " + global.strServerName + " Master Process Login Main Program SUCCESS", false);
      // Get cert from Main Program (main.js)
      global.filePrivKey = data[0].key;
      global.fileCert = data[0].cert;
      global.fileChain = data[0].ca;

      // TODO: Send certs to all childs
      let objMsg = {
        key: global.filePrivKey,
        cert: global.fileCert,
        ca: global.fileChain,
      };
      let strMsg = JSON.stringify(objMsg);
      mRU.funRedisPublish(global.strServerName + "::" + config.cstrRCN_MACCert, strMsg);
    } else {
      if (strCode == "9001") {
        // duplicate
        mUT.funUpdateConsole("Login failed because duplicated master exists", false);
      } else if (strCode == "9002") {
        // system error
        mUT.funUpdateConsole("Login failed because system error occurs", false);
      } else {
        // unknown error code
        mUT.funUpdateConsole("Login failed because of unknown error code", false);
      }
      socketMaster.disconnect();
      process.exit();
    }
  });

  // Disconnected
  socketMaster.on("disconnect", () => {
    mUT.funUpdateConsole("Fatal Error!!! Master Process Socket.io Disconnected by Main (e.g. Main Program Exit)", false);
    process.exit();
  });
}



// Child functions

function funChildCreateServer() {
  try {
    // Go to next step, make sure this step won't be called more than once
    global.intStep = 3;

    // Socket IO
    funChildCreateServer_Socket();

    // API HTTP & HTTPS Server
    funChildCreateServer_API();
  } catch (err) {
    mUT.funUpdateConsole("funChildCreateServer Error: " + err, false);
    process.exit();
  }
}

function funChildCreateServer_Socket() {
  // Socket.IO Server

  serverClient = httpClient.createServer(function (req, res) {
    let headers = {};
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    //    headers["Access-Control-Allow-Credentials"] = true;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept";
    res.writeHead(200, headers);
    res.end();
  });
  serverClientHTTPS = httpsClient.createServer({
    key: global.filePrivKey,
    cert: global.fileCert,
    ca: global.fileChain,
    // key: fs.readFileSync("./certs/privkey.pem"),
    // cert: fs.readFileSync("./certs/cert.pem"),
    // ca: fs.readFileSync("./certs/chain.pem"),
    // ca: fs.readFileSync("./certs/fullchain.pem"),
    requestCert: false,
    // requestCert: true,
    rejectUnauthorized: false
  },
  function (req, res) {
    let headers = {};
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    //    headers["Access-Control-Allow-Credentials"] = true;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept";
    res.writeHead(200, headers);
    res.end();
  });
  let httpSocketPort = global.intBasePort + config.cintPortSocketIO;
  let httpsSocketPort = global.intBasePort + config.cintPortSocketIOS;
  serverClient.listen(httpSocketPort, '');
  serverClientHTTPS.listen(httpsSocketPort, '');
  mUT.funUpdateConsole('Server Name: ' + global.strServerName + 
                       ' Child No: ' + global.aryChild[global.intIndexAryChild].intChildNo +
                       ' Child Process: ' + process.pid + 
                       ' Socket.IO HTTP Server running at port: ' + httpSocketPort);
  mUT.funUpdateConsole('Server Name: ' + global.strServerName + 
                       ' Child No: ' + global.aryChild[global.intIndexAryChild].intChildNo +
                       ' Child Process: ' + process.pid + 
                       ' Socket.IO HTTPS Server running at port: ' + httpsSocketPort);
  funChildCreateServer_SocketListen();
}

function funChildCreateServer_SocketListen() {
  // Socket IO Listen

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
      // Update console
      mRU.funUpdateServerMonitor('Server Name: ' + global.strServerName + 
                                 ' Child No: ' + global.aryChild[global.intIndexAryChild].intChildNo +
                                 ' Child Process: ' + process.pid + 
                                 " Uniapp Client connected with socket ID: " + socket.id, false);

      global.aryClients.push({
        strSocketID: socket.id,
        strUserType: '',
        strUserId: '',
        lastHB: Date.now(),
        token: '',
        socket: socket,
      });

      // *** Send aryClients to All connection user ***
      // funSendAryClients();
      global.socketAll.emit('Test',{'type': "Hello"});


      // Client request get coins
      socket.on("clientGetCoins", function (aryData) {
        funReturnGameCoins(socket);
      });

      // Below on other message
      socket.on('message', function (objData) {
        mRU.funUpdateServerMonitor('Server Name: ' + global.strServerName + 
                                   ' Child No: ' + global.aryChild[global.intIndexAryChild].intChildNo +
                                   ' Child Process: ' + process.pid + 
                                   " SOcket.IO Server received a message from Uniapp Client: " + objData, false);
      });


      socket.on('IAmUniapp', function (objData) {
        console.log("IAmUniapp objData: ");
        console.log(objData);
        for (let i=0;i<global.aryClients.length;i++) {
            if (global.aryClients[i].strSocketID == socket.id) {
              global.aryClients[i].strUserId = objData.strUserId;
              global.aryClients[i].strUserType = "Uniapp";
            }
        }
        // Subscribe
        mRU.redisSubChan("IAmUniapp" + "::" + objData.strUserId);
      });

      // From External Js to UniApp
      socket.on('FromExternalJsToUniapp', function (objData) {
        console.log("FromExternalJsToUniapp objData: ");
        console.log(objData);
        switch(objData.type) {
          case "StartGame":
            let strMsg = JSON.stringify(objData);
            mRU.funRedisPublish("IAmUniapp" + "::" + objData.strUserId, strMsg);
            break;
          default:
            break;
        }
      });


      // On Heartbeat
      socket.on('HB', function (objData) {
        // mSoc.funHeartBeat(socket, objData);
      });

      // On disconnect
      socket.on('disconnect', function () {
        mRU.funUpdateServerMonitor('Server Name: ' + global.strServerName + 
                                   ' Child No: ' + global.aryChild[global.intIndexAryChild].intChildNo +
                                   ' Child Process: ' + process.pid + 
                                   " Uniapp Client Disconnected, Socket ID: " + socket.id, false);
        for (let i = 0; i < global.aryClients.length; i++) {
          if (global.aryClients[i].strSocketID === socket.id) {
            // Remove the connectionCode from the Array
            global.aryClients.splice(i, 1);
            break;
          }
        }
      });

      // Catch any unexpected error, to avoid system hangs
      socket.on('error', function () {
        mRU.funUpdateServerMonitor('Server Name: ' + global.strServerName + 
                                   ' Child No: ' + global.aryChild[global.intIndexAryChild].intChildNo +
                                   ' Child Process: ' + process.pid + 
                                   " Uniapp Socket.IO Server Unknown Error, Socket ID: " + socket.id, false);
      });
  });

  // Show clients
  funShowClients();

  // Check Heart Beat
  // funCheckHB();

  // console.log("Socket IO Listen succeed");
}

function funChildCreateServer_API() {
  // Allow CORS
  const cors = require('cors');
  const express = require('express');
  // const DB = require('./apijs/db');
  const bodyParser = require('body-parser');
  // const db = new DB();

  const appAPI = express();
  appAPI.use(cors());

  appAPI.options('/*', (req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
      res.sendStatus(200);
      next();
  });

  const appIB = express.Router();
  appIB.use(bodyParser.urlencoded({
      extended: false
  }));
  appIB.use(bodyParser.json());

  // Read all Routers here
  require('./routes/index.js')(appIB);

  appAPI.use(appIB);

  // http & https listening
  var httpServer = require('http').Server(appAPI);

  var httpsServer = httpsClient.createServer({
    key: global.filePrivKey,
    cert: global.fileCert,
    ca: global.fileChain,
    // key: fs.readFileSync("./certs/privkey.pem"),
    // cert: fs.readFileSync("./certs/cert.pem"),
    // ca: fs.readFileSync("./certs/chain.pem"),
    // ca: fs.readFileSync("./certs/fullchain.pem"),
    requestCert: false,
    // requestCert: true,
    rejectUnauthorized: false
  }, appAPI);

  let httpWebPort = global.intBasePort + config.cintPortWebHTTP;
  let httpsWebPort = global.intBasePort + config.cintPortWebHTTPS;

  // http & https listen
  httpServer.listen(httpWebPort, function () {
    mUT.funUpdateConsole("Server Name: " + global.strServerName + 
                         " Child No: " + global.aryChild[global.intIndexAryChild].intChildNo +
                         " Child Process: " + process.pid + 
                         " Web HTTP Server listening on *: " + httpWebPort, false);
  });
  httpsServer.listen(httpsWebPort, function () {
    mUT.funUpdateConsole("Server Name: " + global.strServerName + 
                         " Child No: " + global.aryChild[global.intIndexAryChild].intChildNo +
                         " Child Process: " + process.pid + 
                         " Web HTTPS Server listening on *: " + httpsWebPort, false);
  });
}

// Timer for showing all connected clients to each child
function funShowClients() {
  for (let i = 0; i < global.aryClients.length; i++) {
      try {
          mRU.funUpdateServerMonitor("Server Name: " + global.strServerName + 
                                     " Child No: " + global.aryChild[global.intIndexAryChild].intChildNo +
                                     " Child Process: " + process.pid + 
                                     " Connected SocketID: " + global.aryClients[i].strSocketID, false);
      } catch (err) {
          //
      }
  }
  mRU.funUpdateServerMonitor("Server Name: " + global.strServerName + 
                             " Child No: " + global.aryChild[global.intIndexAryChild].intChildNo +
                             " Child Process: " + process.pid + 
                             " Total No. of Clients Connected: " + global.aryClients.length, true);

  setTimeout(funShowClients, config.cintFunShowClients);
}

// Timer for Disconnect clients without HB
function funCheckHB() {
  //   try {
  //     for (let i = 0; i < global.aryClients.length; i++) {
  //       // If current time > (last HB received + timeout e.g. 30 seconds)
  //       if (Date.now() > global.aryClients[i].lastHB + config.cintHBTimeout) {
  //         // mRU.funUpdateServerMonitor("No HB Disconnect: " + global.aryClients[i].connectionCode, true);
  //         // Disconnect That Client
  //         global.aryClients[i].socket.disconnect();
  //       }
  //     }
  //   } catch (err) {
  //     // If someone disconnect, there will be an error because aryClients.length changes
  //     // mRU.funUpdateServerMonitor("No HB Disconnect Error: " + err, true);
  //   }
  
  //   // Check Every (Timeout / 3) Milliseconds
  //   setTimeout(funCheckHB, Math.floor(config.cintHBTimeout / 3));
}

// Child socket server functions

function funReturnGameCoins(socket) {
  mRU.funUpdateServerMonitor("Client requests get gaem coins");

  // mRU.funUpdateServerMonitor(db.funGS('usrs', 'usrs_getCoins', 'usr_id = "sys            "'));

  db.tst([
    db.funGS('usrs', 'usrs_getCoins', 'usr_id = "sys            "'),
  ], [
      [],
  ]).then((result) => {
      let objData = result[0][0][0];
      socket.emit("clientGetCoins_return", objData);
      mRU.funUpdateServerMonitor("Return game coins to client: " + JSON.stringify(objData));
      // console.log("usr_coins_g: " + objData.usr_coins_g);
  });
}



// Timer for all processes, run every second
funTimerAll();



// app.js End