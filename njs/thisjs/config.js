module.exports = {
  'secret': 'Vpo$1051',           // Key for Token Encrypt
  'gbolDebug': true,              // Debug or Production, true for debug
  'cstrAppName': "nbc01",         // app name
  'cintPortSocketIO': 62,       // http socket io port
  'cintPortSocketIOS': 63,      // https socket io port
  'cintPortWeb': 64,            // Web Server Monitor port
  'cintPortWebHTTP': 65,        // http restful api port
  'cintPortWebHTTPS': 66,       // https restful api port
  'cintHBTimeout': 30000,         // HeartBeat Timeout milliseconds
  'cintTokenExpiryS': 604800,     // Token Expiry Second
  'cintEmailCPWExpiryM': 60,      // Change Password by Email, Code Expiry Minute
  'cintFunShowServers': 30000,    // Milliseconds to update Web Server Monitor

  // Redis Host & Port
  'redisHost': '192.168.123.10',
  'redisPort': 10079,
  'redisPw': 'Zephan915',
  'redisDb': 0,

  // Redis Channel Names
  // Name for Web Server Monitor
  'cstrRCN_WSM': 'rcnWebServerMonitor',


  // Max. Number of CPU Allowed for node.js Clustering
  'cintMaxCpu': 2,


  // Game Result api url
  'caryGameResultApi': 
  [
    // index 0: Get Game Result from 1632014.com
    // https://www.1632014.com/api/complex/selDataByGameIdAndCount?iGameId=9&count=1
    {
      '10001': [
        {
          'bolHttps': true,
          'intType': 0,
          'strHost': 'www.1632014.com',
          'strPath': '/api/complex/selDataByGameIdAndCount',
          'strGameIDVar': "?iGameId=",
          'strGameID': "9",
          'strCountVar': "&count=",
          'intNotGetWaitSecond': 30,   // Wait 30 seconds since 1632014.com USUALLY get this game result 10 mins after game Real Open Date Time.
          'intDuration': 1200,
        }
      ],
      '10002': [
        {
          'bolHttps': true,
          'intType': 0,
          'strHost': 'www.1632014.com',
          'strPath': '/api/complex/selDataByGameIdAndCount',
          'strGameIDVar': "?iGameId=",
          'strGameID': "5",
          'strCountVar': "&count=",
          'intNotGetWaitSecond': 30,   // Wait 30 seconds since 1632014.com USUALLY get this game result 10 mins after game Real Open Date Time.
          'intDuration': 1200,
        }
      ],
      '10003': [
        {
          'bolHttps': true,
          'intType': 0,
          'strHost': 'www.1632014.com',
          'strPath': '/api/complex/selDataByGameIdAndCount',
          'strGameIDVar': "?iGameId=",
          'strGameID': "33",
          'strCountVar': "&count=",
          'intNotGetWaitSecond': 10,   // Wait 10 seconds, this game duration is 300 seconds
          'intDuration': 300,
        }
      ],
      '10004': [
        {
          'bolHttps': true,
          'intType': 0,
          'strHost': 'www.1632014.com',
          'strPath': '/api/complex/selDataByGameIdAndCount',
          'strGameIDVar': "?iGameId=",
          'strGameID': "31",
          'strCountVar': "&count=",
          'intNotGetWaitSecond': 10,   // Wait 10 seconds, this game duration is 300 seconds
          'intDuration': 300,
        }
      ],
      '10005': [
        {
          'bolHttps': true,
          'intType': 0,
          'strHost': 'www.1632014.com',
          'strPath': '/api/complex/selDataByGameIdAndCount',
          'strGameIDVar': "?iGameId=",
          'strGameID': "38",
          'strCountVar': "&count=",
          'intNotGetWaitSecond': 10,   // Wait 10 seconds, this game duration is 300 seconds
          'intDuration': 300,
        }
      ],
      '10006': [
        {
          'bolHttps': true,
          'intType': 0,
          'strHost': 'www.1632014.com',
          'strPath': '/api/complex/selDataByGameIdAndCount',
          'strGameIDVar': "?iGameId=",
          'strGameID': "56",
          'strCountVar': "&count=",
          'intNotGetWaitSecond': 1, // Wait 1 second only since 1632014.com get this game quite fast after game Real Open Date Time
          'intDuration': 75,
        }
      ],
      '10007': [
        {
          'bolHttps': true,
          'intType': 0,
          'strHost': 'www.1632014.com',
          'strPath': '/api/complex/selDataByGameIdAndCount',
          'strGameIDVar': "?iGameId=",
          'strGameID': "55",
          'strCountVar': "&count=",
          'intNotGetWaitSecond': 1, // Wait 1 second only since 1632014.com get this game quite fast after game Real Open Date Time
          'intDuration': 75,
        }
      ],
      // https://api.api861861.com/pks/getLotteryPksInfo.do?lotCode=10035
      '10008': [
        {
          'bolHttps': true,
          'intType': 1,
          'strHost': 'api.api861861.com',
          'strPath': '/pks/getLotteryPksInfo.do',
          'strGameIDVar': "?lotCode=",
          'strGameID': "10035",
          'intNotGetWaitSecond': 1, // Wait 1 second only since api861861.com get this game quite fast after game Real Open Date Time
          'intDuration': 75,
        }
      ],
    }

    // https://api.api861861.com/pks/getLotteryPksInfo.do?lotCode=10035

    // index 1: Get Game Result from ????
  ],
  


  // No use
  'Temp': 123
};
