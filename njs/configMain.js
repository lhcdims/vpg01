module.exports = {
  'gbolDebug': true,            // Debug or Production, true for debug
  'cstrAppName': "ib",         // app name
  'cintPortSocketIO': 62,       // http socket io port
  'cintPortSocketIOS': 63,      // https socket io port
  'cintPortWeb': 64,            // Web Server Monitor port
  'cintPortWebHTTP': 65,        // http restful api port
  'cintPortWebHTTPS': 66,       // https restful api port
  'cintHBTimeout': 30000,         // HeartBeat Timeout milliseconds
  'cintFunShowServers': 30000,    // Milliseconds to update Web Server Monitor

  'cstrUrl': "pg01.bigaibot.com",

  // Redis Host & Port
  'redisHost': '192.168.123.10',
  'redisPort': 10079,
  'redisPw': 'Zephan915',
  'redisDb': 0,

  // Redis Channel Names
  // Name for Web Server Monitor
  'cstrRCN_WSM': 'rcnWebServerMonitor',
};
