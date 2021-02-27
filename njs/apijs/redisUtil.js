const config = require('./config');
const mUT = require('./utils.js');
const cG = require('../thisjs/clsGlobal.js');

const redis = require("redis");
const rC = redis.createClient({host: config.redisHost, port: config.redisPort, password: config.redisPw, db: config.redisDb});
const rSub = redis.createClient({host: config.redisHost, port: config.redisPort, password: config.redisPw, db: config.redisDb});



// rC On Message
rC.on("error", function(error) {
  console.log('The Redis Error: ' + error.toString());
  global.bolGlobalError = true;
});


// rSub On Message
rSub.on("message", function(strChannel, strMsg) {
  let objMsg = {};
  try {
    objMsg = JSON.parse(strMsg);
  } catch {

  }
  switch (strChannel) {
    case config.cstrRCN_WSM:
      // Update To Web Server Monitor
      let strTempDate = new Date().Format("yyyy-MM-dd hh:mm:ss");
      global.ioServer.emit('chat message', strTempDate + " : " + strMsg);
      break;
    case global.strServerName + "::" + config.cstrRCN_MACCert:
      // Childs Receive Certs from Master
      try {
        if (!global.bolHaveCerts) {
          objMsg = JSON.parse(strMsg);
          global.filePrivKey = objMsg.key;
          global.fileCert = objMsg.cert;
          global.fileChain = objMsg.ca;
          global.bolHaveCerts = true;
          mUT.funUpdateConsole("Child Process ID: " + process.pid + " Get Certs from Master thru Redis SUCCESS", false);  
        }
      } catch (err) {
        mUT.funUpdateConsole("Child Process ID: " + process.pid + " Get Certs from Master thru Redis error: " + err, false);
        global.bolGlobalError = true;
      }
      break;
    case global.strServerName + "::" + config.cstrRCN_MACAryChild:
      // Childs Receive global.aryChild from Master
      try {
        objMsg = JSON.parse(strMsg);
        global.aryChild = objMsg.aryChild;
        for (let i=0;i<global.aryChild.length;i++) {
          if (global.aryChild[i].intPid == process.pid) {
            global.intIndexAryChild = i;
          }
        }
        mUT.funUpdateConsole("Child Process ID: " + process.pid + " Get aryChild from Master thru Redis SUCCESS", false);
      } catch (err) {
        mUT.funUpdateConsole("Child Process ID: " + process.pid + " Get aryChild from Master thru Redis error: " + err, false);
        global.bolGlobalError = true;
      }
      break;
    case "IAmUniapp" + "::" + objMsg.strUserId:
      // objMsg = JSON.parse(strMsg);
      for (let i=0;i<global.aryClients.length;i++) {
        if (global.aryClients[i].strUserId == objMsg.strUserId && global.aryClients[i].strUserType == "Uniapp") {
          global.aryClients[i].socket.emit('FromExternalJsToUniapp', {'type': "StartGame"});
        }
      }
      break;
    default:
      break;
  }
});


// C2. Web Server Monitor Function
function funUpdateServerMonitor(strMsg, bolDebugOnly) {
  let bolShouldShow = false;
  try {
      if (bolDebugOnly) {
          if (global.gbolDebug) {
              bolShouldShow = true;
          }
      } else {
          bolShouldShow = true;
      }
      if (bolShouldShow) {
        // Publish to Redis
        rC.PUBLISH(config.cstrRCN_WSM, strMsg);
      }
  } catch (err) {
      //
  }
}


// Publish Message
function funRedisPublish(strChannel, objMsg) {
  rC.PUBLISH(strChannel, objMsg);
}


// Clear Whole Redis Database
const funClearRedis = (callback) => {
  rC.flushdb(function (err, res) {
    callback(err, res);
  });
}



// Get/Set the value of the key strKey, and return it in callback
function redisGet(strKey, callback){
  rC.get(strKey, function(err, res){ 
    if (err) {
      global.bolGlobalError = true;
    }
    callback(err, res);
  })
}
// bolQuit = true means CRITICAL SYSTEM ERROR
function redisSet(strKey, objValue, bolQuit, callback){
  rC.set(strKey, objValue, function(err, res){ 
    if (err) {
      console.log('RedisSet Error: ');
      console.log(err);
      if (bolQuit) {
        global.bolGlobalError = true;
      }
    }
    callback(err, res);
  })
}



// hmget / hmset
// bolQuit = true means CRITICAL SYSTEM ERROR, will stop all server programs in 1 seconds
function redisHmSet(strKey, aryValue, bolQuit, callback) {
  // aryValue length should be even
  let intLength = aryValue.length;
  if (intLength == 0) {
    // Should Not Happen
    callback("0001", "redisHmSet aryValue length should not be zero");
    if (bolQuit) {
      global.bolGlobalError = true;
    }
  } else if ((intLength / 2) != Math.floor(intLength / 2)) {
    // Should Not Happen
    callback("0002", "redisHmSet aryValue length should not be odd");
    if (bolQuit) {
      global.bolGlobalError = true;
    }
  } else {
    for (let i=0; i<Math.floor(intLength / 2); i++) {
      rC.hset(strKey, aryValue[i*2], aryValue[i*2+1], function(err, res){ 
        if (err) {
          // Should Not Happen
          console.log('Unable to hset Key: ' + strKey);
          console.log(err);
          if (bolQuit) {
            global.bolGlobalError = true;
          }
          callback("0003", "redisHmSet key failed: " + strKey);
        }
      })
    }
    callback("0000", "redisHmSet key OK: " + strKey);
  }
}
function redisHExists(strKey, strField, bolQuit, callback){
  rC.hexists(strKey, strField, function(err, res){ 
    if (err) {
      // Should not happen
      console.log("Error in hexists: " + err);
      if (bolQuit) {
        global.bolGlobalError = true;
      }
    }
    // if res == 0 means strKey + strField not exist in Redis, otherwise Exist
    callback(err, res);
  })
}



// HGETALL, return res (An Array or Null)
// err = "0000", strKey Found
// err = "1000", strKey Not Found
// res = return Array (length is even)
function redisHGetAll(strKey, bolQuit, callback) {
  rC.hgetall(strKey, function(err, res) {
    if (err) {
      console.log('HGET Error: ' + err);
      if (bolQuit) {
        global.bolGlobalError = true;
      }
      callback("9999", err);
    } else {
      if (res == null) {
        // Not Found
        callback("1000", null);
      } else {
        // Found
        callback("0000", res);
      }
    }
  });
}



// Subscribe Channels
function redisSubChan(strChannel) {
  rSub.SUBSCRIBE(strChannel);
}


// Get All aryClients from Redis
// TODO: Need bolQuit ???
const funGetAryAllClients = () => {
  rC.keys("aryClients:*", function(err, reply) {
    if (err) {
      console.log("Error: " + err);
      global.bolGlobalError = true;
    } else {
      global.aryAllClients = [];
      if (reply.length == 0) {
        console.log('Redis aryClients is empty');
      } else {
        for (let i = 0; i < reply.length; i++) {
          //console.log('reply[i]: ' + reply[i]);
          rC.hgetall(reply[i], function(err2, reply2) {
            if (err2) {
              console.log("Error 2: " + err2);
              global.bolGlobalError = true;
            } else {
              if (reply2 == null) {
                // ignore
                console.log('Redis aryClients Details is empty');
              } else {
                // Set values in aryClients
                let objAryClients = new cG.ClsAryClients();
                for(var key in objAryClients) {
                  if (key == "strSocketID") {
                    objAryClients.strSocketID = reply[i].substr(11);
                  } else {
                    objAryClients[key] = reply2[key];
                  }
                }
                // Push into Array (Here we stringify then parse in order to remove class name)
                global.aryAllClients.push(JSON.parse(JSON.stringify(objAryClients)));
                // console.log(global.aryAllClients[global.aryAllClients.length - 1]);
              }
            }
          });
        }
      }
    }
  });
}



function redisKeys(strKeys, callback){
  rC.keys(strKeys, function(err, res){ 
    callback(err, res);
  })
}
function redisHGetAllNoRecordNeverMind(strKey, callback) {
  rC.hgetall(strKey, function(err, res) {
    callback(err, res);
  });
}




const funAddNewAryClientAndRemoveDuplicate = (objData) => {
}



const funAddNewAryClientIfNotDuplicate = (objData) => {
}



// Export Modules
module.exports = {
  funClearRedis,
  funGetAryAllClients,
  redisGet,
  redisSet,
  redisHmSet,
  redisHGetAll,
  redisSubChan,
  funUpdateServerMonitor,
  redisHExists,
  redisKeys,
  redisHGetAllNoRecordNeverMind,
  funRedisPublish,
}
