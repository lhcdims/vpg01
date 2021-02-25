// Constant Global Variables
import Vue from 'vue';

// Is Debug or Production?
Vue.prototype.$gbolDebug = true;

// Default Web Site Address
if (Vue.prototype.$gbolDebug) {
  Vue.prototype.$gstrUrlApi = "https://bc01.bigaibot.com:8866/";
  Vue.prototype.$gstrUrlSio = "https://bc01.bigaibot.com:8863/";
} else {
  Vue.prototype.$gstrUrlApi = "https://bc01.bigaibot.com:8866/";
  Vue.prototype.$gstrUrlSio = "https://bc01.bigaibot.com:8863/";  
}

// Time in milliseconds for HeartBeat
Vue.prototype.$gcIntHeartBeatInterval = 10000;
Vue.prototype.$gcIntHeartBeatExpiry = 30000;

// Length of Activation Code
Vue.prototype.$gcIntActCode_MinLength = 6;
Vue.prototype.$gcIntActCode_MaxLength = 6;

// Length of User Code
Vue.prototype.$gcIntUserID_MinLength = 3;
Vue.prototype.$gcIntUserID_MaxLength = 16;

// Length of User Name
Vue.prototype.$gcIntUserName_MinLength = 2;
Vue.prototype.$gcIntUserName_MaxLength = 32;

// Default Parent User ID, also need to change in /store/index.js
Vue.prototype.$gcStrDefaultUserID_Parent = "sys             ";

// Screen Portion for Landscape
Vue.prototype.$gcIntScreenRatioL = 16;
Vue.prototype.$gcIntScreenRatioS = 9;

// Image Slice Related
// No. of Images
Vue.prototype.$gcIntMaxSlice = 4;
// No. of Seconds each image show
Vue.prototype.$gcIntImageSecond = 6;


export default class VclsStreamInfo {
  intStreamHeight;
  intStreamWidth;
  intFrameRate;
  intAspectRatio;
  constructor() {
    this.intStreamHeight = 0;
    this.intStreamWidth = 0;
    this.intFrameRate = 0;
    this.intAspectRatio = 0;
  }
}
