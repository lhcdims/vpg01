// const config = require('../configMain.js');

// Add to ServerList when a connection is just established
const funAddServerList = (socket) => {
  global.aryServerList.push({
    strSocketID: socket.id,
    strServerName: '',
    intChildNo: 0,
    strUrl: '',
    intPortSocketIO: 0,
    intPortSocketIOS: 0,
    intPortWebHTTP: 0,
    intPortWebHTTPS: 0,
    intClientCount: 0,
    intLastHB: Date.now(),
    socket: socket,
  });
}



// Socket Disconnected
const funDisconnect = (socket) => {
  for (let i = 0; i < global.aryServerList.length; i++) {
    if (global.aryServerList[i].strSocketID === socket.id) {
      // Remove the connectionCode from the Array
      global.aryServerList.splice(i, 1);
    }
  }
}



// Main Get Master Info from Node.js Application Servers' Cluster
const funMainGetMasterInfo = (socket, data) => {
  let bolFound = false;
  let bolDuplicate = false;
  if (data.intChildNo <= 0) {
    socket.emit('MainReturnMasterLogin', [{strCode: '9003'}]); // intChildNo Cannot be Zero
  } else {
    for (let i = 0; i < global.aryServerList.length; i++) {
      if (global.aryServerList[i].strServerName === data.strServerName && global.aryServerList[i].strSocketID != socket.id) {
        bolDuplicate = true;
        socket.emit('MainReturnMasterLogin', [{strCode: '9001'}]); // Duplicate Master Program Name Already Exist
        break;
      };
    };
    if (!bolDuplicate) {
      for (let i = 0; i < global.aryServerList.length; i++) {
        if (global.aryServerList[i].strSocketID === socket.id) {
          global.aryServerList[i].strServerName = data.strServerName;
          global.aryServerList[i].intChildNo = data.intChildNo;
          global.aryServerList[i].strUrl = data.strUrl,
          global.aryServerList[i].intPortSocketIO = data.intPortSocketIO,
          global.aryServerList[i].intPortSocketIOS = data.intPortSocketIOS,
          global.aryServerList[i].intPortWebHTTP = data.intPortWebHTTP,
          global.aryServerList[i].intPortWebHTTPS = data.intPortWebHTTPS,
          bolFound = true;
        }
      };
      if (!bolFound) {
        socket.emit('MainReturnMasterLogin', [{strCode: '9002'}]); // System Error, that node.js Already Disconnected
      } else {
        socket.emit('MainReturnMasterLogin', [{
          strCode: '0000',
          key: global.filePrivKey,
          cert: global.fileCert,
          ca: global.fileChain,
        }]); // Master Process Added
      }
    }  
  }
}







// HeartBeat
const funHeartBeat = (socket, objData) => {
  for (let i = 0; i < global.aryClients.length; i++) {
      if (global.aryClients[i].connectionCode === socket.id) {
        // Change Last HB Time
        global.aryClients[i].lastHB = Date.now();
        if (global.aryClients[i].userId != objData[0] || global.aryClients[i].token != objData[1]) {
          // Change User ID & Token
          global.aryClients[i].userId = objData[0];
          global.aryClients[i].token = objData[1];
        }
      }
  }
  mGR.funGetGameLastResult(function(err, res) {
    // Emit HB Return
    socket.emit('HBReturn', [Date.now(), config.cintTokenExpiryS, socket.id, res]);
  });
}



// Other Message Function





// funOnMessage For All Messages
const funOnMessage = (socket, objData) => {
  // Classify And Call Message Function
  try {
    switch (objData[0]) {
      case "SomeMessage":
        break;
      default:
        // Do Nothing for Unknown Message
        break;
    }
  } catch (err) {
    mRU.funUpdateServerMonitor("funOnMessage Error: " + err, false);
  }
}



// Export Modules
module.exports = {
  funAddServerList,
  funDisconnect,
  funHeartBeat,
  funMainGetMasterInfo,
  funOnMessage,
}
