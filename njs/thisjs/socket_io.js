const config = require('./config');
const { funUpdateServerMonitor } = require('../apijs/redisUtil.js');
var mRU = require('../apijs/redisUtil.js');
const mGR = require('./getGameRelated.js');

// Initialize aryClients when a connection is just established
const funInitAryClient = (socket) => {
  let datTemp = Date.now();

  // TODO: New Client Connected, what should we do???



  // global.aryClients.push({
  //     connectionCode: socket.id,
  //     userId: '',
  //     lastHB: datTemp,
  //     token: '',
  //     socket: socket,
  // });
}



// Socket Disconnected
const funDisconnect = (socket) => {
  for (let i = 0; i < global.aryClients.length; i++) {
    if (global.aryClients[i].connectionCode === socket.id) {
      // Remove the connectionCode from the Array
      global.aryClients.splice(i, 1);
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
  funDisconnect,
  funHeartBeat,
  funInitAryClient,
  funOnMessage,
}
