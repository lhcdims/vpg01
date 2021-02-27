module.exports = {
  'secret': 'Vpo$1051',           // Key for Token Encrypt
  'gbolDebug': true,              // Debug or Production, true for debug
  'cstrAppName': "IbApp",         // app name

  'cintPortSocketIO': 72,       // http socket io port
  'cintPortSocketIOS': 73,      // https socket io port
  'cintPortWebHTTP': 75,        // http restful api port
  'cintPortWebHTTPS': 76,       // https restful api port
  'cintHBTimeout': 30000,         // HeartBeat Timeout milliseconds
  'cintTokenExpiryS': 604800,     // Token Expiry Second
  'cintEmailCPWExpiryM': 60,      // Change Password by Email, Code Expiry Minute
  'cintFunShowServers': 30000,    // Milliseconds to update Web Server Monitor
  'cintFunShowClients': 30000,

  // Redis Host & Port
  'redisHost': '192.168.123.10',
  'redisPort': 10079,
  'redisPw': 'Zephan915',
  'redisDb': 0,

  // Redis Channel Names
  // Name for Web Server Monitor
  'cstrRCN_WSM': 'rcnWebServerMonitor',
  'cstrRCN_MACCert': 'rcnMasterAndChildCert',
  'cstrRCN_MACAryChild': 'rcnMasterAndChildAryChild',


  // Max. Number of CPU Allowed for node.js Clustering
  // Minimum value for this variable is 1
  'cintMaxCpu': 2,

  // Main Server
  'cstrMainIP': 'pg01.bigaibot.com',
  'cintMainPort': 10063,

  // My Url
  'cstrMyUrl': 'pg01.bigaibot.com',
};
