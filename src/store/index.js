import Vue from 'vue'
import Vuex from 'vuex'
import VclsStreamInfo from '../scripts/globalvars.js';

Vue.use(Vuex)

// export const store = new Vuex.Store({
export default new Vuex.Store({
  // State
  state: {
    // Restful Api Url
    gstrUrlApi: "https://bc01.bigaibot.com:8866/",
    gstrUrl: "https://bc01.bigaibot.com",
    gstrPort: "8861",

    // Device Info
    gbolAndroid: false,
    gbolIOS: false,
    gbolWeChat: false,
    gbolQQ: false,
    gbolMobile: false,
    // Finger Print    gstrFinger: '',

    // Timer Counter
    gintCounter: 1,
    gintSliceNo: 1,
    gintGlobalCount: 0,

    // Screem Related
    gbolPortrait: true,
    gintScreenHeight: 0,  // Height of Physical Screen
    gintScreenWidth: 0,   // Width of Physical Screen
    gintWindowHeight: 0,  // Height of Browser Window
    gintWindowWidth: 0,   // Width of Browser Window
    gintActualHeight: 0,  // Height of Content Area (May > gintWindowHeight for Portrait)
    gintActualWidth: 0,   // Width of Content Area
    gintNavigateHeight: 0, // Height of NavigationBar
    gintContentHeight: 0, // gintActualHeight - gintNavigateHeight
    gintJoyWidth: 128,
    gintJoyHeight: 128,
    gintJoyHeightAbove: 0,
    gintJoyWidthLeft: 0,
    gintJoyCenterPercent: 20,
    gintJoyLeftPosPercent: 0,
    gintJoyBottomPosition: 0,


    // Is socket connected?
    gbolSIOConnected: false,
    gintServerDateFromEpoch: Date.now(),


    // Token Expiry Initial Value, can be replaced by Server Value
    // One day has 86400 secs, One week has 604800 secs
    gintTokenExpiryS: 604800,


    // Current Page of User
    gstrCurPage: "Home",



    // Home Page Array of Game Last Result
    garyGLRList: [],



    // Parent User ID
    gstrUserID_P: 'sys             ',


    // Default Current Language
    gstrLang: "sch",


    // For Input Form
    gstrInputReturnError: '',


    // For Login/Register
    gstrUserID: "",
    gToken: localStorage.getItem('strToken') || '',
    gstrUserStatus: '',
    gstrChangePasswordType: "",
    gstrEmail: "",
    gstrSocketID: "",
    gintCoins_G: 0,
    gintCoins_J: 0,
    gintCoins_D: 0,
    gintUserLevel: 0,





    // For WebRTC Game

    // Game List in mysql
    garyGameList: [],

    // List of Available Games on the socket.io Server
    garyGames: [],

    // Game Code
    gstrGameCode: '',

    // Server Got Stream? True mean I'm server and I got the Local Video Stream
    gbolGameServerGotStream: false,

    // Game Server Local Stream
    gvsGameServer: null,

    // Game Client Remote Stream
    gvsGameClient: null,

    // Client Activating?
    gbolGameClientActing: false,

    // Client Activated?  (Or Game Client WebRTC Started?)
    gbolGameClientActed: false,

    // Client Socket ID, = socket.id only if I'm the Server and this client wants to call me
    gstrClientSocketID: '',

    // Server Socket ID, = socket.id only if I'm the Client
    gstrServerSocketID: '',

    // Game Server WebRTC Started?
    gbolGameServerWebRTCStarted: false,

    // Game Client No. Total No. of Connected Times.
    // In IOS, the first call will have Freeze screen, so we need to call again
    gintGameClientNoOfConnected: 0,

    // Client Game Code for IOS Restart
    gstrClientGameCode: '',

    // Remote Stream Info
    gvclsStreamData: new VclsStreamInfo(),

    // For Game
    gstrJoyStickDir: "",
    gstrCoinType: "",

    // Time Left in the current game
    gintTimeLeft: 0,

    // Score in the current game
    gintScore: 0,




    // For WebRTC Video Chat
    garyClients: [],
    gstrRoomName: 'S0010001',

    // WebRTC Related
    gpcConfig: {
      'iceServers': [
        {
          'urls': 'stun:stun.l.google.com:19302'
        },
        {
          'urls': 'turn:thisapp.zephan.top:3307',
          'username': 'mini',
          'credential': 'game'
        },
      ]
    },
    gsdpConstraints: {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    },
    // Can this client get the Video Stream from its camera?
    gbolGotStream: false,

    // Local Stream from its own camera
    gvsLocal: null,

    // Remote Stream
    gvsRemote: null,

    //
    gbolWebRTCStarted: false,

    // Is this client click the Call Button?
    gbolWebRTCInitiator: false,

    // Is both parties Ready?
    gbolWebRTCChannelReady: false,

    // Turn???
    gbolWebRTCTurnReady: null,

    // Socket_ID of Another party
    gstrSocketID_Other: "",

  },



  // Mutations
  // Mutation only has 2 parameters, to pass more, combine all parameters 
  // except the first one, into the second parameter
  mutations: {
    mutGstrPort(state, strNewPort) {
      state.gstrPort = strNewPort;
    },

    mutDeviceInfo(state, objData) {
      state.gbolAndroid = objData[0];
      state.gbolIOS = objData[1];
      state.gbolWeChat = objData[2];
      state.gbolQQ = objData[3];
      state.gbolMobile = objData[4];
    },
    mutGstrFinger(state, strNewFinger) {
      state.gstrFinger = strNewFinger;
    },

    // GlobalCounter Related
    mutGlobalCounter(state, intNewNumber) {
      state.gintCounter = intNewNumber;
      state.gintGlobalCount += 1;
    },
    mutGintSliceNo(state, intNewNumber) {
      state.gintSliceNo = intNewNumber;
    },

    // Screen Related
    mutScreenRelated(state, objData) {
      state.gbolPortrait = objData[0];
      state.gintScreenHeight = objData[1];
      state.gintScreenWidth = objData[2];
      state.gintWindowHeight = objData[3];
      state.gintWindowWidth = objData[4];
    },
    mutActualSize(state, objData) {
      state.gintActualWidth = objData[0];
      state.gintActualHeight = objData[1];
      state.gintContentHeight = state.gintActualHeight - state.gintNavigateHeight;
    },
    mutGintNavigateHeight(state, objData) {
      state.gintNavigateHeight = objData[0];
      state.gintContentHeight = state.gintActualHeight - state.gintNavigateHeight;
    },

    // JoyStick Related
    mutJoyStick(state, objData) {
      state.gintJoyWidth = objData[0];
      state.gintJoyHeight = objData[1];
    },

    mutJoyStickWidthHeight(state, objData) {
      state.gintJoyWidthLeft = objData[0];
      state.gintJoyHeightAbove = objData[1];
    },

    // Is socket connected?
    mutGbolSIOConnected(state, bolConnect) {
      state.gbolSIOConnected = bolConnect;
    },
    mutHeartBeatFromServer(state, objData) {
      // Server Date From Epoch in MS
      state.gintServerDateFromEpoch = objData[0];
      // Server Token Expiry No. of Seconds
      state.gintTokenExpiryS = objData[1];
      state.gstrSocketID = objData[2];

      // Game Last Result List for each heartbeat
      state.garyGLRList = objData[3];
      console.log(state.garyGLRList);
    },

    // Change Password Type
    mutGstrChangePasswordType(state, strNewPasswordType) {
      state.gstrChangePasswordType = strNewPasswordType;
    },

    // Change Current Page
    mutGstrCurPage(state, strNewCurPage) {
      state.gstrCurPage = strNewCurPage;
    },

    // Change Language
    mutGstrLang(state, strNewLang) {
      state.gstrLang = strNewLang;
    },

    // Change Parent User ID
    mutGstrUserID_P(state, strNewID) {
      state.gstrUserID_P = strNewID;
    },

    // Input Form Mutations
    mutInputReturnBegin(state, strTemp) {
      // state.gstrInputReturnError = this._vm.$gl('Loading');
      // state.gstrInputReturnError = this.$gl('Loading');
      // Why inside store.mutations CANNOT use this.$  ????
      state.gstrInputReturnError = strTemp;
    },
    mutInputReturnError(state, strError) {
      state.gstrInputReturnError = strError;
    },

    // Login/Register Mutations
    mutLoginRegisterOK(state, objData) {
      // state.gstrInputReturnError = this._vm.$gl('RegisterSuccess');
      state.gToken = objData[0];
      state.gstrUserID = objData[1];
      state.gstrUserStatus = objData[2];
      state.gstrEmail = objData[3];
      state.gintCoins_G = objData[4];
      state.gintCoins_J = objData[5];
      state.gintCoins_D = objData[6];
      state.gintUserLevel = objData[7];
    },
    mutGstrUserStatus(state, strNewStatus) {
      state.gstrUserStatus = strNewStatus;
    },

    // Logout Mutations
    mutLogout(state) {
      state.gstrInputReturnError = '';
      state.gToken = '';
      state.gstrUserID = '';
      state.gstrUserStatus = '';
      state.gstrEmail = '';
      state.gintCoins_G = 0;
      state.gintCoins_J = 0;
      state.gintCoins_D = 0;
      state.gintUserLevel = 0;

      localStorage.removeItem('strToken');
      localStorage.removeItem('intTokenDate');
      localStorage.removeItem('strUserID');
      localStorage.removeItem('strUserStatus');
      localStorage.removeItem('strEmail');
    },

    // Email
    mutGstrEmail(state, strNewEmail) {
      state.gstrEmail = strNewEmail;
    },



    // Game List
    mutGaryGameList(state, objData) {
      state.garyGameList = objData[0];
    },
    


    // WebRTC Game
    mutGstrGameCode(state, strGameCode) {
      state.gstrGameCode = strGameCode;
    },
    mutGbolGameServerGotStream(state, bolServerGotStream) {
      state.gbolGameServerGotStream = bolServerGotStream;
    },
    mutGvsGameServer(state, stream) {
      state.gvsGameServer = stream;
    },
    mutGvsGameClient(state, stream) {
      state.gvsGameClient = stream;
    },
    mutGaryGames(state, objData) {
      state.garyGames = objData[0];
    },
    mutGbolGameClientActing(state, bolTemp) {
      state.gbolGameClientActing = bolTemp;
    },
    mutGbolGameClientActed(state, bolTemp) {
      state.gbolGameClientActed = bolTemp;
    },
    mutGstrClientSocketID(state, strSocketID) {
      state.gstrClientSocketID = strSocketID;
    },
    mutGstrServerSocketID(state, strSocketID) {
      state.gstrServerSocketID = strSocketID;
    },
    mutGbolGameServerWebRTCStarted(state, bolStarted) {
      state.gbolGameServerWebRTCStarted = bolStarted;
    },
    mutGintGameClientNoOfConnected(state) {
      state.gintGameClientNoOfConnected += 1;
    },
    mutGstrClientGameCode(state, strClientGameCode) {
      state.gstrClientGameCode = strClientGameCode;
    },
    mutGintCoins_G(state, intNew) {
      state.gintCoins_G = intNew;
    },
    mutGintCoins_J(state, intNew) {
      state.gintCoins_J = intNew;
    },
    mutGintCoins_D(state, intNew) {
      state.gintCoins_D = intNew;
    },
    mutGvclsStreamData(state, vclsNew) {
      state.gvclsStreamData.intStreamHeight = vclsNew.intStreamHeight;
      state.gvclsStreamData.intStreamWidth = vclsNew.intStreamWidth;
      state.gvclsStreamData.intFrameRate = vclsNew.intFrameRate;
      state.gvclsStreamData.intAspectRatio = vclsNew.intAspectRatio;
    },


    
    // WebRTC Video Chat Related
    mutGaryClients(state, objData) {
      state.garyClients = objData[0];
    },
    mutGstrSocketID(state, strNewSocketID) {
      state.gstrSocketID = strNewSocketID;
    },
    mutGbolGotStream(state, bolGotStream) {
      state.gbolGotStream = bolGotStream;
    },
    mutGvsLocal(state, stream) {
      state.gvsLocal = stream;
    },
    mutGvsRemote(state, stream) {
      state.gvsRemote = stream;
    },
    mutGbolWebRTCInitiator(state, bolNewState) {
      state.gbolWebRTCInitiator = bolNewState;
    },
    mutGbolWebRTCChannelReady(state, bolChannelReady) {
      state.gbolWebRTCChannelReady = bolChannelReady;
    },
    mutGbolWebRTCStarted(state, bolStarted) {
      state.gbolWebRTCStarted = bolStarted;
    },
    mutGstrSocketID_Other(state, strConnectionCode) {
      state.gstrSocketID_Other = strConnectionCode;
    },



    // Game Related
    mutGstrJoyStickDir(state, strDir) {
      state.gstrJoyStickDir = strDir;
    },

    mutGstrCoinType(state, strCoinType) {
      state.gstrCoinType = strCoinType;
    },

    mutGintScore(state, intScore) {
      state.gintScore = intScore;
    },

    mutGintTimeLeft(state, intTimeLeft) {
      state.gintTimeLeft = intTimeLeft;
    },
  },
  actions: {
    // Action for Activate
    actActivate({
      commit
    }, objUser) {
      return new Promise((resolve, reject) => {
        commit('mutInputReturnBegin', this._vm.$gl2('Loading', this.state.gstrLang));
        this._vm.$axios({
            url: this._vm.$gstrUrlApi + 'activate',
            data: objUser,
            method: 'POST'
          })
          .then(resp => {
            resolve(resp);
          })
          .catch(err => {
            commit('mutInputReturnError', err);
            console.log('Activation Error: ' + err)
            reject(err);
          })
      })
    },


    // Action for Change Email
    actChangeEmail({
      commit
    }, objUser) {
      return new Promise((resolve, reject) => {
        commit('mutInputReturnBegin', this._vm.$gl2('Loading', this.state.gstrLang));
        this._vm.$axios({
          url: this._vm.$gstrUrlApi + 'changeemail',
          data: objUser,
          method: 'POST'
        })
        .then(resp => {
          resolve(resp);
        })
        .catch(err => {
          commit('mutInputReturnError', err);
          console.log('ChangeEmail Error: ' + err)
          reject(err);
        })
      })
    },
    
    
    // Action for Change Password By Email
    actChangePasswordByEmail({
      commit
    }, objUser) {
      return new Promise((resolve, reject) => {
        commit('mutInputReturnBegin', this._vm.$gl2('Loading', this.state.gstrLang));
        this._vm.$axios({
            url: this._vm.$gstrUrlApi + 'changepasswordbyemail',
            data: objUser,
            method: 'POST'
          })
          .then(resp => {
            resolve(resp);
          })
          .catch(err => {
            commit('mutInputReturnError', err);
            console.log('ChangePasswordByEmail Error: ' + err)
            reject(err);
          })
      })
    },


    // Action for Change Password By Password
    actChangePasswordByPassword({
      commit
    }, objUser) {
      return new Promise((resolve, reject) => {
        commit('mutInputReturnBegin', this._vm.$gl2('Loading', this.state.gstrLang));
        this._vm.$axios({
            url: this._vm.$gstrUrlApi + 'changepasswordbypassword',
            data: objUser,
            method: 'POST'
          })
          .then(resp => {
            resolve(resp);
          })
          .catch(err => {
            commit('mutInputReturnError', err);
            console.log('ChangePasswordByPassword Error: ' + err)
            reject(err);
          })
      })
    },


    // Action for Forget Password
    actForgetPassword({
      commit
    }, objUser) {
      return new Promise((resolve, reject) => {
        commit('mutInputReturnBegin', this._vm.$gl2('Loading', this.state.gstrLang));
        this._vm.$axios({
            url: this._vm.$gstrUrlApi + 'forgetpassword',
            data: objUser,
            method: 'POST'
          })
          .then(resp => {
            resolve(resp);
          })
          .catch(err => {
            commit('mutInputReturnError', err);
            console.log('ForgetPassword Error: ' + err)
            reject(err);
          })
      })
    },


    // Action for Game List
    actGameList({
      commit
    }) {
      return new Promise((resolve, reject) => {
        // commit('mutInputReturnBegin', this._vm.$gl2('Loading', this.state.gstrLang));
        this._vm.$axios({
            url: this._vm.$gstrUrlApi + 'gamelist',
            method: 'POST'
          })
          .then(resp => {
            resolve(resp);
          })
          .catch(err => {
            commit('mutInputReturnError', err);
            console.log('GameList Error: ' + err)
            reject(err);
          })
      })
    },



    // Action for Get Free Coin
    actGetCoin({
      commit
    }, objUser) {
      return new Promise((resolve, reject) => {
        commit('mutInputReturnBegin', this._vm.$gl2('Loading', this.state.gstrLang));
        this._vm.$axios({
          url: this._vm.$gstrUrlApi + 'getcoin',
          data: objUser,
          method: 'POST'
        })
        .then(resp => {
          resolve(resp);
        })
        .catch(err => {
          commit('mutInputReturnError', err);
          console.log('GetCoin Error: ' + err)
          reject(err);
        })
      })
    },
    
    

    // Action for Login
    actLogin({
      commit
    }, objUser) {
      return new Promise((resolve, reject) => {
        commit('mutInputReturnBegin', this._vm.$gl2('Loading', this.state.gstrLang));
        // GET
        //this._vm.$axios({url: this._vm.$gstrUrlApi + 'login?email=ken@zephan.top&password=12334556', method: 'get' })
        // POST
        // this._vm.$axios({url: this._vm.$gstrUrlApi + 'login', data: objUser, method: 'POST' })
        //   .then(resp => {
        //     // console.log(resp);


        //     // // Add the following line:
        //     // this._vm.$axios.defaults.headers.common['Authorization'] = conToken;
        //     commit('mutInputReturnError', resp.data.tmpData);
        //     resolve(resp);
        //   })
        //   .catch(err => {
        //     commit('mutInputReturnError', err);
        //     localStorage.removeItem('token');
        //     reject(err);
        //   })
        this._vm.$axios({
            url: this._vm.$gstrUrlApi + 'login',
            data: objUser,
            method: 'POST'
          })
          .then(resp => {
            let strToken = null;
            let intTokenDate;
            let strUserID = null;
            let strUserStatus = 'A';
            let strEmail = null;
            if (resp.data.bolWithAuth) {
              // Login OK, set variables and local storage
              strToken = resp.data.token;
              intTokenDate = resp.data.intTokenDate;
              strUserID = resp.data.strUserID;
              strUserStatus = resp.data.strUserStatus;
              strEmail = resp.data.strEmail;
              localStorage.setItem('strToken', strToken);
              localStorage.setItem('intTokenDate', intTokenDate);
              localStorage.setItem('strUserID', strUserID);
              localStorage.setItem('strUserStatus', strUserStatus);
              localStorage.setItem('strEmail', strEmail);
              this._vm.$axios.defaults.headers.common['Authorization'] = strToken;
              commit('mutLoginRegisterOK', [strToken, strUserID, strUserStatus, strEmail, resp.data.intCoins_G, resp.data.intCoins_J, resp.data.intCoins_D, resp.data.usr_level]);
            } else {
              // Login Not OK, return errors
              commit('mutLogout');
              delete this._vm.$axios.defaults.headers.common['Authorization'];
            }
            resolve(resp);
          })
          .catch(err => {
            commit('mutInputReturnError', err);
            commit('mutLogout');
            delete this._vm.$axios.defaults.headers.common['Authorization'];
          reject(err);
          })
      })
    },




    // Action for Re-Login
    actReLogin({
      commit
    }, objUser) {
      return new Promise((resolve, reject) => {
        this._vm.$axios({
            url: this._vm.$gstrUrlApi + 'relogin',
            data: objUser,
            method: 'POST'
          })
          .then(resp => {
            let strToken = null;
            let intTokenDate;
            let strUserID = null;
            let strUserStatus = 'A';
            let strEmail = null;
            if (resp.data.bolWithAuth) {
              // Login OK, set variables and local storage
              strToken = resp.data.token;
              intTokenDate = resp.data.intTokenDate;
              strUserID = resp.data.strUserID;
              strUserStatus = resp.data.strUserStatus;
              strEmail = resp.data.strEmail;
              localStorage.setItem('strToken', strToken);
              localStorage.setItem('intTokenDate', intTokenDate);
              localStorage.setItem('strUserID', strUserID);
              localStorage.setItem('strUserStatus', strUserStatus);
              localStorage.setItem('strEmail', strEmail);
              this._vm.$axios.defaults.headers.common['Authorization'] = strToken;
              commit('mutLoginRegisterOK', [strToken, strUserID, strUserStatus, strEmail, resp.data.intCoins_G, resp.data.intCoins_J, resp.data.intCoins_D, resp.data.usr_level]);
            } else {
              // Login Not OK, return errors
              commit('mutLogout');
              delete this._vm.$axios.defaults.headers.common['Authorization'];
            }
            resolve(resp);
          })
          .catch(err => {
            commit('mutLogout');
            delete this._vm.$axios.defaults.headers.common['Authorization'];
          reject(err);
          })
      })
    },



    // Action for Register
    actRegister({
      commit
    }, objUser) {
      return new Promise((resolve, reject) => {
        commit('mutInputReturnBegin', this._vm.$gl2('Loading', this.state.gstrLang));
        this._vm.$axios({
            url: this._vm.$gstrUrlApi + 'register',
            data: objUser,
            method: 'POST'
          })
          .then(resp => {
            let strToken = null;
            let intTokenDate;
            let strUserID = null;
            let strUserStatus = 'A';
            let strEmail = null;
            if (resp.data.bolWithAuth) {
              // Register OK, set variables and local storage
              strToken = resp.data.token;
              intTokenDate = resp.data.intTokenDate;
              strUserID = resp.data.strUserID;
              strEmail = resp.data.strEmail;
              localStorage.setItem('strToken', strToken);
              localStorage.setItem('intTokenDate', intTokenDate);
              localStorage.setItem('strUserID', strUserID);
              localStorage.setItem('strUserStatus', strUserStatus);
              localStorage.setItem('strEmail', strEmail);
              this._vm.$axios.defaults.headers.common['Authorization'] = strToken;
              commit('mutLoginRegisterOK', [strToken, strUserID, strUserStatus, strEmail, 0, 0, 0, 0]);
            } else {
              // Register Not OK, return errors
              commit('mutLogout');
              delete this._vm.$axios.defaults.headers.common['Authorization'];
            }
            resolve(resp);
          })
          .catch(err => {
            commit('mutInputReturnError', err);
            commit('mutLogout');
            delete this._vm.$axios.defaults.headers.common['Authorization'];
            reject(err);
          })
      })
    },

    // Action for Logout
    actLogout({
      commit
    }) {
      return new Promise((resolve) => {
        commit('mutLogout');
        delete this._vm.$axios.defaults.headers.common['Authorization'];
        resolve();
      })
    },

    // Action for Your Team
    actYourTeam({
      commit
    }, objUser) {
      return new Promise((resolve, reject) => {
        // commit('mutInputReturnBegin', this._vm.$gl2('Loading', this.state.gstrLang));
        this._vm.$axios({
            url: this._vm.$gstrUrlApi + 'yourteam',
            data: objUser,
            method: 'POST'
          })
          .then(resp => {
            resolve(resp);
          })
          .catch(err => {
            commit('mutInputReturnError', err);
            console.log('Your Team Error: ' + err)
            reject(err);
          })
      })
    },


    // Socket Related

    // HeartBeat Return
    "SOCKETA_HBReturn"({commit}, objData) {
      return new Promise((resolve) => {
        // this._vm.$funUpdateConsole(objData, true);
        commit('mutHeartBeatFromServer', objData);
        resolve();
      })
    },
    "SOCKETA_WebRTC_RoomCreated"({commit}, objData) {
      return new Promise((resolve) => {
        // this._vm.$funUpdateConsole(objData, true);
        commit('mutGbolWebRTCInitiator', objData[0]);
        resolve();
      })
    },
    "SOCKETA_WebRTC_GetArrayGames"({commit}, objData) {
      return new Promise((resolve) => {
        // To all players that whether the game server is ready or occupied?
        commit('mutGaryGames', objData);
        resolve();
      })
    },
  },
  modules: {},
  getters: {
    // gbolIsLoggedIn: state => !!state.gToken,
    // gstrAuthStatus: state => state.gstrLoginStatus,
  }
})