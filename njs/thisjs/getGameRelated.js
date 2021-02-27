// Import config
const config = require('./config.js');
const cG = require('./clsGlobal.js');

// Import Http Related
const http = require('http');
const https = require('https');

// Import DB Related
const DB = require('../apijs/db.js');
const db = new DB();

// Import Redis Related
const mRU = require('../apijs/redisUtil.js');
const mUT = require('../apijs/utils.js');

// const { funUpdateServerMonitor } = require('../utils/redisUtil.js');

// Set bolHttps
const bolHttps = config.caryGameResultApi[0]['10006'][0].bolHttps;


// Html Get and callback(strResult)
function funGetHtml(options, callback) {
  if (bolHttps) {
    https.request(options, function(response) {
      let str = '';

      //another chunk of data has been received, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });
    
      //the whole response has been received, so we just print it out here
      response.on('end', function () {
        callback(str);
      });
    }).end();
  } else {
    http.request(options, function(response) {
      let str = '';

      //another chunk of data has been received, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });
    
      //the whole response has been received, so we just print it out here
      response.on('end', function () {
        callback(str);
      });
    }).end();
  }
}



// Get Game List from DB and store it to redis
function funGetGameListFromDB(callback) {
  db.funSelect(cG.funGetStruct("glist"), "glist", " ? ", 1, (err, result) => {
    if (err.code == "0000") {
      // Success

      // Store Result to Redis
      // mUT.funUpdateConsole(JSON.parse(JSON.stringify(result)), true);

      mRU.redisSet("aryGameList", JSON.stringify(result), true, function(err, res) {
      });  
    } else {
      // System Fail
      mUT.funUpdateConsole('Unable to Get Game List in Main Program, Exit', false);
      mUT.funUpdateConsole(err, false);
      global.bolGlobalError = true;
    }
    callback(err, result);
  });
}



// Save Game Result to Redis and DB
function funSaveGameResult(intIndex, res, callback) {
  try {
    let strApi_Id = ""; // Api Game Id
    let strSKey = ""; // Key to Store in DB
    let strHKey = "GR:"; // Key to Store in Redis
    let strGLRKey = "GLR:" + global.aryGameList[intIndex]["gli_id"];
    let strSOpenNum = ""; // Result to store in Redis and Db
    let intRealOpenDT = new Date().getTime();
    let strDateOpenDT = ""; // Default Open DT
    let strDateRealOpenDT = ""; // Real Open DT
  
    // 0. There are two types:
    if (config.caryGameResultApi[0][global.aryGameList[intIndex]["gli_id"]][0].intType == 0) {
      // Type 0, i.e. 163kk.com
      strApi_Id = res[0]["igameid"];
      strSKey = res[0]["sgameperiod"];
      strHKey += global.aryGameList[intIndex]["gli_id"] + "." + res[0]["sgameperiod"];
      strSOpenNum = res[0]["sopennum"];
      intRealOpenDT = new Date(res[0]["drealopen"]).getTime();
      strDateOpenDT = res[0]["dopentime"];
      strDateRealOpenDT = res[0]["drealopen"];
    } else {
      try {
        strApi_Id = res["data"]["lotCode"];
        strSKey = res["data"]["preDrawIssue"];;
        strHKey += global.aryGameList[intIndex]["gli_id"] + "." + res["data"]["preDrawIssue"];
        // Get strSOpenNum
        strSOpenNum += res["data"]["firstNum"] + "|" + 
                       res["data"]["secondNum"] + "|" + 
                       res["data"]["thirdNum"] + "|" + 
                       res["data"]["fourthNum"] + "|" + 
                       res["data"]["fifthNum"] + "|" + 
                       res["data"]["sixthNum"] + "|" + 
                       res["data"]["seventhNum"] + "|" + 
                       res["data"]["eighthNum"] + "|" + 
                       res["data"]["ninthNum"] + "|" + 
                       res["data"]["tenthNum"]
        intRealOpenDT = new Date(res["data"]["preDrawTime"]).getTime();
        strDateOpenDT = res["data"]["preDrawTime"];
        strDateRealOpenDT = res["data"]["preDrawTime"];
      } catch (err) {
        mUT.funUpdateConsole(res, false);
        mUT.funUpdateConsole("Error: " + err, false);
      }
    }
  
  
    // 1. Check res Exist in Redis
    mRU.redisHExists(strHKey, "sopennum", false, function(err2, res2) {
      if (res2 == 0) {
        // Key Not Exist in Redis
        
        // Save to Redis
        mRU.redisHmSet(strHKey, ["sopennum", strSOpenNum], false, function(err3, res3) {
          if (err3 == "0000") {
            // Save Redis Success
            mUT.funUpdateConsole("Save Key Success: " + strHKey + "   sopennum: " + strSOpenNum, true);
  
            // Set Game Result Last Update Date Time
            global.aryGameResultLastUpdateDT[intIndex] = intRealOpenDT;
  
            // Save to DB
            let aryStruct = cG.funGetStruct("gresult");
            db.funAddDb("gresult", [aryStruct[1], aryStruct[2], aryStruct[3], aryStruct[4], 
                aryStruct[5], aryStruct[6], aryStruct[7]], 
                [strSKey, strSOpenNum, strDateOpenDT, strDateRealOpenDT, 
                "[SYSDATETIME]", global.aryGameList[intIndex]["gli_id"], strApi_Id], 
            (err4, result4) => {
              // Do Nothing
              if (err4.code == "2000") {
                // Save DB Success
                // mUT.funUpdateConsole("Record Added", true);
              } else {
                // Save DB Failed (May be already saved)
                mUT.funUpdateConsole("Record Not Added", false);
              }
            });
  
          } else {
            // Save Redis Failed Should not happen!!!
            mUT.funUpdateConsole("Save Key Failed: " + strHKey, false);
          }
        });

        // Save to Redis (Last Game Result)
        mRU.redisHmSet(strGLRKey, ["sgameperiod", strSKey, "sopennum", strSOpenNum, "dopentime", strDateOpenDT, "drealopen", strDateRealOpenDT], false, function(err3, res3) {
          if (err3 == "0000") {
            // Save Redis Success
            mUT.funUpdateConsole("Save Game Last Result Key Success: " + strGLRKey + "   sopennum: " + strSOpenNum, true);
          } else {
            // Save Redis Failed Should not happen!!!
            mUT.funUpdateConsole("Save Game Last Result Key Failed: " + strGLRKey, false);
          }
        });        
  
        // Reset Wait Second for Games: 10001, 10002, 10003, 10004, 10005, ?
        global.aryGameResultNotGetWaitSecond[intIndex] = config.caryGameResultApi[0][global.aryGameList[intIndex]["gli_id"]][0].intNotGetWaitSecond;
      } else {
        // Key Exist in Redis, Do Nothing
        mUT.funUpdateConsole("Key Exist intIndex: " + intIndex + " | strHKey: " + strHKey, false);
  
        // Wait Longer for Games: 10001, 10002, 10003, 10004, 10005, ?
        // Because the game result source api takes result from this game too slow
        if (global.aryGameList[intIndex]["gli_id"] == "10001" || 
            global.aryGameList[intIndex]["gli_id"] == "10002" ||
            global.aryGameList[intIndex]["gli_id"] == "10005") {
          // If Date.now() is more than 1 hour than the last Update Record
          if (Date.now() - (global.aryGameResultLastUpdateDT[intIndex] + (global.aryGameList[intIndex]["gli_duration"] + global.aryGameResultNotGetWaitSecond[intIndex]) * 1000) > 3600) {
            // This is the first game of the day, and key exist for previous day last game, so
            global.aryGameResultNotGetWaitSecond[intIndex] = (Date.now() - global.aryGameResultLastUpdateDT[intIndex]) / 1000
                                                             - global.aryGameList[intIndex]["gli_duration"]
                                                             + config.caryGameResultApi[0][global.aryGameList[intIndex]["gli_id"]][0].intNotGetWaitSecond;
            // i.e., next run will be 30/10 seconds later from now
          } else {
            // Normal wait another 30/10 seconds
            global.aryGameResultNotGetWaitSecond[intIndex] += config.caryGameResultApi[0][global.aryGameList[intIndex]["gli_id"]][0].intNotGetWaitSecond;
          }
        } else if (global.aryGameList[intIndex]["gli_id"] == "10003" || global.aryGameList[intIndex]["gli_id"] == "10004") {
          // Normal wait another 10 seconds
          global.aryGameResultNotGetWaitSecond[intIndex] += config.caryGameResultApi[0][global.aryGameList[intIndex]["gli_id"]][0].intNotGetWaitSecond;
        } else {
          // Just wait 1 second
        }
      }
    });
  
    // 7. funUpdateServerMonitor
    mRU.funUpdateServerMonitor(JSON.stringify(res), false);
  
    // 8. Return
    callback({code: "0000"});  
  } catch (errTry) {
    callback({code: "9999", err: errTry});  
  }
}



// Is the game within Day Start & End Time?
function funIsGameWithinTime(intIndex) {
  let bolReturn = false;

  let datCurDate = new Date();
  let intDaySecond = datCurDate.getHours() * 3600 + datCurDate.getMinutes() * 60 + datCurDate.getSeconds();
  let intStartSecond = 1;
  let intEndSecond = 23 * 3600 + 59 * 3600 + 59;

  switch(global.aryGameList[intIndex]["gli_id"]) {
    case "10001":
      // PK10, Start at 9:30, ends at 23:50, 20mins each, so:
      // in between 00:15:00 && 09:29:00, should be false
      intStartSecond = 15 * 60;
      intEndSecond = 9 * 3600 + 29 * 60;
      if (intDaySecond > intStartSecond && intDaySecond < intEndSecond) {
        bolReturn = false;
      } else {
        bolReturn = true;
      }
      break;
    case "10002":
      // ChongQing 5, This game stop between 3:10 and 7:10, 20 mins each, so
      // in between 03:35:00 && 07:09:00, should be false
      intStartSecond = 3 * 3600 + 35 * 60;
      intEndSecond = 7 * 3600 + 9 * 60;
      if (intDaySecond > intStartSecond && intDaySecond < intEndSecond) {
        bolReturn = false;
      } else {
        bolReturn = true;
      }
      break;
    case "10003":
      bolReturn = true;
      break;
    case "10004":
      bolReturn = true;
      break;
    case "10005":
      // Lukcy Air Ship, This game stop between 04:04(Last of Yesterday) and 13:09 (First of Today), 5 mins each, so
      // in between 04:08:00 && 13:09:00, should be false
      intStartSecond = 4 * 3600 + 8 * 60;
      intEndSecond = 13 * 3600 + 9 * 60;
      if (intDaySecond > intStartSecond && intDaySecond < intEndSecond) {
        bolReturn = false;
      } else {
        bolReturn = true;
      }
      break;
    case "10006":
      bolReturn = true;
      break;
    case "10007":
      bolReturn = true;
      break;
    case "10008":
      bolReturn = true;
      break;
    default:
      break;
  }

  return bolReturn;
}


function funGetGameLastResult(callback) {
  mRU.redisKeys("GLR:*", function(err, reply) {
    if (err) {
      // Should Not Happen
      callback("9999",[]);
    } else {
      global.aryGLRList = [];
      if (reply.length == 0) {
        // Should Not Happen
        callback("9999",[]);
      } else {
        for (let i = 0; i < reply.length; i++) {
          mRU.redisHGetAllNoRecordNeverMind(reply[i], function(err2, reply2) {
            if (err2) {
              // Should Not Happen
              callback("9999",[]);
            } else {
              if (reply2 == null) {
                // Should Not Happen
                callback("9999",[]);
              } else {
                // Set values in aryGLRList

                // For Each Reply2
                global.aryGLRList.push(
                  {
                    "strGli_ID": reply[i].substr(4),
                    "strGre_ID": reply2["sgameperiod"],
                    "strGre_Result": reply2["sopennum"],
                    "strGre_OpenDT": reply2["dopentime"],
                    "strGre_RealOpenDT": reply2["drealopen"],
                    "intDurationSecond": config.caryGameResultApi[0][reply[i].substr(4)][0].intDuration
                  }
                )
                // let objAryGLRList = new cG.ClsAryGLRList();
                // for(var key in objAryGLRList) {
                //   if (key == "strGli_ID") {
                //     objAryGLRList.strGli_ID = ;
                //   } else {
                //     objAryGLRList[key] = reply2[key];
                //   }
                // }
                // console.log(reply2);
                // Push into Array (Here we stringify then parse in order to remove class name)
                // global.aryGLRList.push(JSON.parse(JSON.stringify(objAryGLRList)));
                // console.log(JSON.parse(JSON.stringify(objAryGLRList)));

                // If This is the Last i, return callback
                if (i == reply.length - 1) {
                  callback("0000", global.aryGLRList);
                }
              }
            }
          });
        }
      }
    }
  });
}


// Export Modules
module.exports = {
  funGetHtml,
  funGetGameListFromDB,
  funSaveGameResult,
  funIsGameWithinTime,
  funGetGameLastResult,
}
