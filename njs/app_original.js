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



// Section B. Get Program Arguments
const argNodes = process.argv.slice(2);

// Get Argument
if (argNodes.length != 0) {
  let bolArgGotMain = false;
  let bolArgGotClearRedis = false;
  let bolArgGotServerName = false;
  for (let i = 0; i < argNodes.length; i++) {
    if (argNodes[i] == "Main") {
      bolArgGotMain = true;
      bolArgGotClearRedis = true;
      bolArgGotServerName = true;
      global.strServerName = "Main";
    } else if (argNodes[i] == "ClearRedis") {
      bolArgGotClearRedis = true;
    } else if (argNodes[i].indexOf('BaseIP') >= 0) {
      global.intBaseIP = parseInt(argNodes[i].substr(6));
    } else {
      if (argNodes[i].indexOf('ServerName') >= 0) {
        bolArgGotServerName = true;
        // Suppose argument = "ServerNameMain", then global.strServerName = "Main"
        global.strServerName = argNodes[i].substr(10);
        if (global.strServerName == "Main") {
          bolArgGotMain = true;
          bolArgGotClearRedis = true;
        }
      }
    }
  }
  if (bolArgGotClearRedis) {
    global.bolShouldClearRedis = true;
  } else {
    mRU.funGetAryAllClients();
  }
  if (bolArgGotMain) {
    global.bolMainProgram = true;
  }
}





// A. Import/Require Files



// A1. 3rd Party Files
const fs = require('fs');



// A2. Config Files
const config = require('./config');



// A3. Utilities Files (Same for all project)
const mUT = require('./apijs/utils.js');
const mRU = require('./apijs/redisUtil.js');



// A4. Utilities Files (For this project only)
// var mEmail = require('./utils/email.js');



// A5. Other Program Files (For this project only)
const mSoc = require('./thisjs/socket_io.js');
const mGR = require('./thisjs/getGameRelated.js');



// A6. Web Server Monitor and Socket.IO

// Socket.IO Server for Server Monitor to connect
// var WebServerMonitor = require('express')();
// var httpWebServerMonitor = require('http').Server(WebServerMonitor);
// var ioServer = require('socket.io')(httpWebServerMonitor);
global.WebServerMonitor = require('express')();
global.httpWebServerMonitor = require('http').Server(global.WebServerMonitor);
global.ioServer = require('socket.io')(global.httpWebServerMonitor);
global.ioServer.origins('*:*');

// Socket.IO Server for Client to connect
const ioClient = require('socket.io');
const httpClient = require('http');
const httpsClient = require('https');





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



// C. Debug Console Related

// C1. Console







// F2. Debug Info to WebServerMonitor and/or console, if any
function funShowClients() {
  for (let i = 0; i < global.aryClients.length; i++) {
      try {
          mRU.funUpdateServerMonitor("Connection Code: " + global.aryClients[i].strSocketID + "&nbsp;&nbsp;&nbsp;User ID: " + aryClients[i].userId, true);
      } catch (err) {
          //
      }
  }
  mRU.funUpdateServerMonitor("Total No. of Clients Connected: " + global.aryClients.length, true);

  setTimeout(funShowClients, config.cintFunShowClients);
}





// *** Clustering Start Here *** //
const cluster = require('cluster');
const { rootCertificates } = require('tls');
const numCPUs = Math.min(require('os').cpus().length, config.cintMaxCpu);



// Clients Connected to this process
global.aryClients = [];

// Clients Connected to all processes
global.aryAllClients = [];




// Timer for Disconnect clients without HB
function funCheckHB() {
  try {
    for (let i = 0; i < global.aryClients.length; i++) {
      // If current time > (last HB received + timeout e.g. 30 seconds)
      if (Date.now() > global.aryClients[i].lastHB + config.cintHBTimeout) {
        // mRU.funUpdateServerMonitor("No HB Disconnect: " + global.aryClients[i].connectionCode, true);
        // Disconnect That Client
        global.aryClients[i].socket.disconnect();
      }
    }
  } catch (err) {
    // If someone disconnect, there will be an error because aryClients.length changes
    // mRU.funUpdateServerMonitor("No HB Disconnect Error: " + err, true);
  }

  // Check Every (Timeout / 3) Milliseconds
  setTimeout(funCheckHB, Math.floor(config.cintHBTimeout / 3));
}



// Timer for All Processes, run every second
function funTimerAll() {
  try {
    // Increment Counter
    global.intCounter += 1;


    // Check Exit Program?
    if (global.bolGlobalError) {
      process.exit();
    }



    // First Time Read of all data from Redis
    if (global.intStep <= global.intStepToStart && !global.bolWorkingOnStep && !global.bolDoItOnce) {
      global.bolWorkingOnStep = true;
      // Read intStep from Redis, 
      // First Time Read should be 1
      // After Main Program Clear Redis, should be 2
      // After Main Program Read from DB and save to Redis, should be 3
      mRU.redisHGetAll("AllProgram:Main", true, function(err, res) {
        if (err == "0000") {
          // Got intStep of Main Program from Redis
          global.intStep = parseInt(res['intStep']);
          if (global.intStep >= 2) {
            // Main Program / Master Process Get Data from DB and save them to Redis for other processes
            if (global.bolMainProgram && global.bolMasterProcess && global.intStep == 2 && !global.bolDoItOnce_2) {
              // Set Do it Once
              global.bolDoItOnce_2 = true;

              // Get aryGameList from DB and save to Redis
              mGR.funGetGameListFromDB(function(err, result) {
                if (err.code == "0000") {
                  // Set Do it Once
                  global.bolDoItOnce_21 = true;
                  global.bolDoItOnce_22 = true;

                  // Check All Step 2 Finished
                  if (global.bolDoItOnce_21 && global.bolDoItOnce_22) {
                    // Set intStep = 3 to Redis
                    mRU.redisHmSet('AllProgram:Main', ["intProcessID", process.pid, "intLastHB", Date.now(), "intStep", 3], true, function(err2, res2) {
                      // Nothing to do
                      // mUT.funUpdateConsole('Set intStep OK?', false);
                      // mUT.funUpdateConsole(err2, false);
                      // mUT.funUpdateConsole(res2, false);
                    });
                  }
                } else {
                  // GlobalError already = 1, so exit!
                  mUT.funUpdateConsole('err.code: ', err.code);
                }
              });

              // TODO: Get Others from DB and save them to Redis
              global.bolDoItOnce_22 = true;
            }



            // Get Data from Redis After Main Program store everying to Redis
            if (global.intStep >= 3 && !global.bolDoItOnce_3) {
              // Set bolDoItOnce
              global.bolDoItOnce_3 = true;

              // Get aryGameList
              mRU.redisGet('aryGameList', function(err2, res2) {
                // Check Exist
                if (res2 == null) {
                  mUT.funUpdateConsole("aryGameList Not Found in Redis, but intStep = 2, Impossible!  Quit", false);
                  global.bolGlobalError = true;
                } else {
                  global.aryGameList = JSON.parse(res2);
  
                  // Set global.intStep to start all programs
                  global.bolDoItOnce_31 = true;

                  // Check All Step3 Finished
                  if (global.bolDoItOnce_31 && global.bolDoItOnce_32) {
                    global.intStep = global.intStepToStart + 1;
                    global.bolDoItOnce = true;
                  }

                  // for Each element, init Game Result Last Update Date & Time
                  for (let i=0;i<global.aryGameList.length;i++) {
                    global.aryGameResultLastUpdateDT.push(0);
                    global.aryGameResultLastUpdateWorking.push(false);
                    global.aryGameResultNotGetWaitSecond.push(config.caryGameResultApi[0][global.aryGameList[i]["gli_id"]][0].intNotGetWaitSecond);
                    global.aryGameResultFirstLoad.push(false);
                  }
                }
              });

              // Get Other
              global.bolDoItOnce_32 = true;
            }
          }
        }
        global.bolWorkingOnStep = false;
      })
    }



    // If Main Program and Master Process,
    if (global.bolMainProgram && global.bolMasterProcess && global.intStep >= global.intStepToStart) {
      // Loop for aryGameList, and Check if need to get New Game Results
      for (let i=0; i<global.aryGameList.length; i++) {
        if (global.aryGameList[i]["gli_status"] == "E") {
          // This Game is Enabled in mysql, should check to get new game result

          // Check Currect Time > (Last Record Real Open Time Time + Duration + intNotGetWaitSecond)
          // AND, Check Time within this game Day Start & End Time
          if ((Date.now() > global.aryGameResultLastUpdateDT[i] + (global.aryGameList[i]["gli_duration"] + global.aryGameResultNotGetWaitSecond[i]) * 1000 &&
              !global.aryGameResultLastUpdateWorking[i] && mGR.funIsGameWithinTime(i)) 
              || !global.aryGameResultFirstLoad[i]) {
            // Must Load Once
            global.aryGameResultFirstLoad[i] = true;

            // Wait Long Enough, should get new Game Result
            // mUT.funUpdateConsole("i: " + i + " | Date.now: " + Date.now() + " | LastUpdate DT + (duration + WaitSecond) * 1000: " + (global.aryGameResultLastUpdateDT[i] + (global.aryGameList[i]["gli_duration"] + global.aryGameResultNotGetWaitSecond[i]) * 1000), false);

            // Set Working Flag
            global.aryGameResultLastUpdateWorking[i] = true;

            // Set Host and Path
            let strPathTemp = "";
            if (config.caryGameResultApi[0][global.aryGameList[i]["gli_id"]][0].intType == 0) {
              // Type 0:
              strPathTemp = config.caryGameResultApi[0][global.aryGameList[i]["gli_id"]][0].strPath +
                            config.caryGameResultApi[0][global.aryGameList[i]["gli_id"]][0].strGameIDVar +
                            config.caryGameResultApi[0][global.aryGameList[i]["gli_id"]][0].strGameID +
                            config.caryGameResultApi[0][global.aryGameList[i]["gli_id"]][0].strCountVar +
                            "1"
            } else {
              // Type 1:
              strPathTemp = config.caryGameResultApi[0][global.aryGameList[i]["gli_id"]][0].strPath +
                            config.caryGameResultApi[0][global.aryGameList[i]["gli_id"]][0].strGameIDVar +
                            config.caryGameResultApi[0][global.aryGameList[i]["gli_id"]][0].strGameID
            }
            let options = {
              host: config.caryGameResultApi[0][global.aryGameList[i]["gli_id"]][0].strHost, 
              path: strPathTemp,
              // Without the headers, the api won't work in some urls
              headers: {'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'}
            };
            mGR.funGetHtml(options, function(res) {
              try {
                // The Try here avoid problems in JSON.parse
                let objTempResult = JSON.parse(res)["result"];
                mGR.funSaveGameResult(i, objTempResult, function(err) {
                  global.aryGameResultLastUpdateWorking[i] = false;
                  if (err.code == "0000") {
                    mRU.funUpdateServerMonitor("Game Result Save to DB and Redis");
                  } else {
                    mRU.funUpdateServerMonitor("Game Result Save to DB and Redis Error: " + err.code);
                  }
                });
              } catch (err) {
                global.aryGameResultLastUpdateWorking[i] = false;
                mUT.funUpdateConsole("Error Should Not Happen: " + err, false);
              }
            });
   
          } else {
            // Do Nothing, Wait Another One Second
          }
        }
      }
    }



    // Global Counter Testing
    if (global.intCounter == 10) {
      mRU.funUpdateServerMonitor("Program Name: " + global.strServerName + 
        " | Is Master: " + global.bolMasterProcess + 
        " | Process ID: " + process.pid, false);
    }
  } catch (err) {
    //
  }

  // Check Every 1 second
  setTimeout(funTimerAll, 1000);
}





// Master Process
if (cluster.isMaster) {
  mUT.funUpdateConsole(`Master Process: ${process.pid} Started`, false);

  global.bolMasterProcess = true;

  if (global.bolMainProgram) {
    // This is the SINGLE MAIN process, ALL UNIQUE JOBS should be run here!

    // Check whether Redis already has MainProcessID
    mRU.redisHGetAll('AllProgram:Main', true, function(err, res) {
      if (err == "0000") {
        // Already Has another Main Program
        mUT.funUpdateConsole("Another Main Program already run, that MainProcessID is: " + res.toString(), false);
        global.bolGlobalError = true;
      } else {
        // Register this program as the Main Program in Redis
        mRU.redisHmSet('AllProgram:Main', ["intProcessID", process.pid, "intLastHB", Date.now(), "intStep", global.intStep], true, function(err2, res2) {
          // Nothing to do

          // Try to Clear Redis
          if (global.bolShouldClearRedis) {
            // Clear Redis Database
            mRU.funClearRedis(function(err, res) {
              mUT.funUpdateConsole("Redis Cleared", false);
              mRU.funGetAryAllClients();

              // Set intStep = 2 to Redis
              mRU.redisHmSet('AllProgram:Main', ["intProcessID", process.pid, "intLastHB", Date.now(), "intStep", 2], true, function(err2, res2) {
              });
            });
          } else {
            // Set intStep = 2 to Redis
            mRU.redisHmSet('AllProgram:Main', ["intProcessID", process.pid, "intLastHB", Date.now(), "intStep", 2], true, function(err2, res2) {
            });
          }
        });

        // Register this process
        mRU.redisHmSet('AllProcess:' + global.strServerName + ":" + process.pid, ["intLastHB", Date.now()], true, function(err3, res3) {
          // Nothing to do
        });
      }
    });
  } else {
    // This is Master, but not the main program

    // Check whether Redis already has MainProcessID
    if (global.strServerName == "") {
      mUT.funUpdateConsole("Pls. set your server name by running: node app.js ServerNameYourServerName", false);
      global.bolGlobalError = true;
    } else {
      mRU.redisHGetAll('AllProgram:Main', true, function(err, res) {
        if (err != "0000") {
          // Main Program not yet run, this program should NOT run
          mUT.funUpdateConsole("Main Program not yet run, pls. run it first, exiting!", false);
          global.bolGlobalError = true;
        } else {
          // Check this Program Name Already Exist?
          mRU.redisHGetAll('AllProgram:' + global.strServerName, true, function(err2, res2) {
            if (err2 == "0000") {
              // This Program Name Already Exist, quit
              mUT.funUpdateConsole("This Program Name already exist, pls. use another name.", false);
              global.bolGlobalError = true;
            } else {
              // Not Exist, Continue!

              // Register this Program
              mRU.redisHmSet('AllProgram:' + global.strServerName, ["intProcessID", process.pid, "intLastHB", Date.now(), "intStep", global.intStep], true, function(err2, res2) {
                // Nothing to do
              });

              // Register this process
              mRU.redisHmSet('AllProcess:' + global.strServerName + ":" + process.pid, ["intLastHB", Date.now()], true, function(err3, res3) {
                // Nothing to do
              });
            }
          });
        }
      });
    }
  }


  // Create Worker
  if (!global.bolGlobalError) {
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
  }

  // Cluster Events
  cluster.on('exit', (worker, code, signal) => {
    mUT.funUpdateConsole(`Worker Process: ${worker.process.pid} exited`, false);
    mUT.funUpdateConsole('Master Process will now exit as well', false);
    global.bolGlobalError = true;
  });





  // Do something for Master Cluster



  // C3. Web Server Monitor

  if (global.bolMainProgram) {
    global.WebServerMonitor.get('/', function (req, res) {
      res.sendFile(__dirname + '/server.html');
    });
    global.httpWebServerMonitor.listen(global.intBaseIP + config.cintPortWeb, function () {
      mUT.funUpdateConsole(config.cstrAppName + ' WebServer Monitor listening on *: ' + (global.intBaseIP + config.cintPortWeb), false);
    });
  
    global.ioServer.on('connection', function (socket) {
      mUT.funUpdateConsole(config.cstrAppName + ' WebServer Monitor Initialized', false);
      socket.on('disconnect', function () {
        mUT.funUpdateConsole(config.cstrAppName + ' WebServer Monitor Disconnected', false);
      });
    });
    // ***** End - Codes for Web Server Monitor
  
    // Show Clients in Web Server Monitor Every ? seconds defined in config.db
    funShowClients();

    // Subscribe to Redis Web Server Monitor Channel
    mRU.redisSubChan(config.cstrRCN_WSM);
  }





  // End for Master Cluster
} else {



  // Worker Process
  mUT.funUpdateConsole(`Worker Process: ${process.pid} Started`, false);



  // Register this process in Redis
  if (global.bolMainProgram) {
    mRU.redisHmSet('AllProcess:' + global.strServerName + ":" + process.pid, ["intLastHB", Date.now()], true, function(err3, res3) {
      // Nothing to do
    });
  } else {
    mRU.redisHmSet('AllProcess:' + global.strServerName + ":" + process.pid, ["intLastHB", Date.now()], true, function(err3, res3) {
      // Nothing to do
    });
  }



  // Do something for Worker Cluster



  // D. Socket.IO Server Related

  // Socket.IO Server for Client to connect
  var serverClient = httpClient.createServer(function (req, res) {
    let headers = {};
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    //    headers["Access-Control-Allow-Credentials"] = true;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept";
    res.writeHead(200, headers);
    res.end();
  });
  var serverClientHTTPS = httpsClient.createServer({
    key: fs.readFileSync("./certs/privkey.pem"),
    cert: fs.readFileSync("./certs/cert.pem"),
    ca: fs.readFileSync("./certs/chain.pem"),
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
  serverClient.listen(global.intBaseIP + config.cintPortSocketIO, '');
  serverClientHTTPS.listen(global.intBaseIP + config.cintPortSocketIOS, '');
  mUT.funUpdateConsole(config.cstrAppName + ' Socket.IO Server running at port: ' + (global.intBaseIP + config.cintPortSocketIO), false);
  mUT.funUpdateConsole(config.cstrAppName + ' Socket.IO HTTPS Server running at port: ' + (global.intBaseIP + config.cintPortSocketIOS), false);



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
  require('./routes/index.js')(appNBC);

  appAPI.use(appNBC);

  // http & https listening
  var httpServer = require('http').Server(appAPI);

  var httpsServer = httpsClient.createServer({
      key: fs.readFileSync("./certs/privkey.pem"),
      cert: fs.readFileSync("./certs/cert.pem"),
      ca: fs.readFileSync("./certs/chain.pem"),
      // ca: fs.readFileSync("./certs/fullchain.pem"),
      requestCert: false,
      // requestCert: true,
      rejectUnauthorized: false
  }, appAPI);

  // http listen
  httpServer.listen(global.intBaseIP + config.cintPortWebHTTP, function () {
    mUT.funUpdateConsole(config.cstrAppName + ' HTTP Server listening on *: ' + (global.intBaseIP + config.cintPortWebHTTP), false);
  });

  // https listen
  httpsServer.listen(global.intBaseIP + config.cintPortWebHTTPS, function () {
    mUT.funUpdateConsole(config.cstrAppName + ' HTTPS Server listening on *: ' + (global.intBaseIP + config.cintPortWebHTTPS), false);
  });



  // Listen to socket old method
  // var socketAll = ioClient.listen(serverClient);

  // Listen to socket New method, allow http & https together
  var socketAll = new ioClient();
  socketAll.attach(serverClient, {
      // pingInterval: 60000,
      // pingTimeout: 180000,
          transports: ['websocket'],
  });
  socketAll.attach(serverClientHTTPS, {
      // pingInterval: 60000,
      // pingTimeout: 180000,
          transports: ['websocket'],
  });

  // Attach socket.io to Redis
  const redisAdapter = require('socket.io-redis');
  socketAll.adapter(redisAdapter({ host: config.redisHost, port: config.redisPort, password: config.redisPw}));

  socketAll.on('connection', function (socket) {
      // Update Web Monitor
      mRU.funUpdateServerMonitor("Client Connected, Socket ID: " + socket.id + "   Connection Type: " + socket.conn.transport.name, false);

      // Add Connection to Array with Empty User ID
      mSoc.funInitAryClient(socket);

      // Send aryClients to All connection user
      // funSendAryClients();

      // On disconnect
      socket.on('disconnect', function () {
        mSoc.funDisconnect(socket);
        mRU.funUpdateServerMonitor("Client Disconnected, Socket ID: " + socket.id, false);
      });

      // Catch any unexpected error, to avoid system hangs
      socket.on('error', function () {
        mRU.funUpdateServerMonitor("Unexpected Socket.IO Error, Socket ID: " + socket.id, false);
      });

      // On Heartbeat
      socket.on('HB', function (objData) {
        mSoc.funHeartBeat(socket, objData);
      });



      // Below on other message
      socket.on('message', function (objData) {
        mSoc.funOnMessage(socket, objData);
      });
      


      // On test message
      socket.on('test', function (strTemp) {
        mUT.funUpdateConsole('test: ' + strTemp, true);
      });

  });



  // Check Heart Beat
  funCheckHB();





  // End for Worker Cluster
}
// *** Clustering End *** //



// Timer for all processes, run every second
funTimerAll();

















// F. Core Programs for this project Only


// F1. Vars for this js






// app.js End