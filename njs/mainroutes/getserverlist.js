module.exports = function(appNBC) {
  // Get Server List
  appNBC.get('/getserverlist', (req, res) => {
    // Send Server List
    try {
      let intMaxIndex = -1;
      let intMinCount = 999999999;
      for (let i = 0; i < global.aryServerList.length; i++) {
        let intAvg = global.aryServerList[i].intClientCount / global.aryServerList[i].intChildNo;
        if (intAvg < intMinCount) {
          intMinCount = intAvg;
          intMaxIndex = i;
        }
      };
      if (intMaxIndex != -1) {
        global.aryServerList[intMaxIndex].intClientCount += 1;
        let objTemp = {
            strUrl: global.aryServerList[intMaxIndex].strUrl,
            intPortSocketIO: global.aryServerList[intMaxIndex].intPortSocketIO,
            intPortSocketIOS: global.aryServerList[intMaxIndex].intPortSocketIOS,
            intPortWebHTTP: global.aryServerList[intMaxIndex].intPortWebHTTP,
            intPortWebHTTPS: global.aryServerList[intMaxIndex].intPortWebHTTPS,
          };
        res.status(200).send({
          errCode: "0000",
          objServerList: objTemp,
        });
      } else {
        res.status(200).send({
          errCode: "9000",  // No Node.js Server Available
        });
      }
    } catch (err) {
      return res.status(500).send('500'+ err); // System Error
    }
  })
}
