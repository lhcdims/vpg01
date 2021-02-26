import Vue from 'vue'
import Vuex from 'vuex'
import VclsStreamInfo from '../scripts/globalvars.js';

Vue.use(Vuex)

// export const store = new Vuex.Store({
export default new Vuex.Store({
  // State
  state: {
		// Got Server Url?
		// 0: Not Yet Got
		// 1: Getting and waiting for response
		// 2: Got Url
		intGotServerUrl: 0,

		// Server Info: Socket.IO Server IP and Ports
		strServerUrl: '',
		intPortHttp: 0,
		intPortHttps: 0,
		intPortSocketIo: 0,
		intPortSocketIos: 0,

    // Socket.io Online?
    // 0: Not Connected
    // 1: Connecting
    // 2: Connected
		intConnectSocketIO: 0,


    // Game Name from Url
    strGameName: '',


  },



  // Mutations
  // Mutation only has 2 parameters, to pass more, combine all parameters 
  // except the first one, into the second parameter
  mutations: {
    // Server Url
		setIntGotServerUrl(state, intNew) {
			state.intGotServerUrl = intNew;
		},

		// Server Info
		setServerInfo(state, aryData) {
			state.strServerUrl = aryData[0];
			state.intPortHttp = aryData[1];
			state.intPortHttps = aryData[2];
			state.intPortSocketIo = aryData[3];
			state.intPortSocketIos = aryData[4];
		},

		// Set Is OnLine
		setIntConnectSocketIO(state, intNew) {
			state.intConnectSocketIO = intNew;
		},

    // Set Game Name
		setStrGameName(state, strNew) {
			state.strGameName = strNew;
		},






  },
  actions: {
    // Action for Get Server List
    actGetServerList({
      commit
    }) {
      return new Promise((resolve, reject) => {
        this._vm.$axios({
            url: this._vm.$gstrGetServerIpUrl,
            method: 'GET'
          })
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            console.log('Get Server List Error: ' + err)
            reject(err);
          })
      })
    },





    // Socket.IO Related Actions



    // DO NOT use connect: in main.js, it is not working!!!!!!!!!!
    // All connect / disconnecct action will be done here
    "SOCKETA_connect"({commit}) {
      return new Promise((resolve) => {
        this._vm.$funUpdateConsole("Socket.IO Connected", true);
        commit("setIntConnectSocketIO", 2);
        commit('setIntGotServerUrl', 2);

        // After Connect to Server, we need to emit an event to the uni-app to tell it this External JS is loaded
        this._vm.$socket.emit('FromExternalJsToUniapp', {"type": "StartGame", "strUserId": "sys             "});
        resolve();
      })
    },
    "SOCKETA_disconnect"({commit}) {
      return new Promise((resolve) => {
        this._vm.$funUpdateConsole("Socket.IO Disconnected", true);
        commit("setIntConnectSocketIO", 0);
        commit('setIntGotServerUrl', 0);
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