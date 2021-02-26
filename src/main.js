import Vue from 'vue'
import App from './App.vue'
import router from './router';
import store from './store';
import ax from 'axios';
Vue.prototype.$axios = ax;
import VueSocketIO from 'vue-socket.io';
import io from 'socket.io-client';
// Import base64
Vue.prototype.$funBase64 = require('js-base64').Base64;

// Default ProductionTip
Vue.config.productionTip = false

// Import Self js
import './api/config.js';
import './api/utils.js';

new Vue({
  // Data
  data() {
    return {

    };
  },
  


  // Methods  
  methods: {
    funTimMain() {
      try {
        // Get Server List
        if (this.$store.state.intConnectSocketIO == 0 && this.$store.state.intGotServerUrl == 0) {
          // Try to get Socket.IO Server Url
          this.$store.commit("setIntGotServerUrl", 1);
          this.$store
          .dispatch("actGetServerList")
          .then(res => {
            // switch (resp.data.errCode) {
            //   case "1001":
            //     // Do Logout
            //     this.$store.dispatch('actLogout');

            //     // Goto Login Page
            //     this.$router.replace("/login").catch(() => {});
            //     break;
            //   default:
            //     break;
            // }
            if (res.data.errCode == "0000") {
              this.$store.commit('setServerInfo',
                [
                res.data.objServerList.strUrl,
                res.data.objServerList.intPortWebHTTP,
                res.data.objServerList.intPortWebHTTPS,
                res.data.objServerList.intPortSocketIO,
                res.data.objServerList.intPortSocketIOS
                ]
              );
              this.$store.commit("setIntGotServerUrl", 2);
            } else {
              // Get Server List Error, Try again in 1 second
              this.$store.commit("setIntGotServerUrl", 0);
              this.$funUpdateConsole("Got Server List Error Code: " + res.data.errCode, true);
            }
          })
          .catch((err) => {
            // No Error in This Part
            this.$store.commit("setIntGotServerUrl", 0);
            this.$funUpdateConsole("Got Server List Error: " + err, true);
          });  
        };


        // Try to Connect Socket.io
				// Check if Not Online and Got Server Info
				if (this.$store.state.intConnectSocketIO == 0 && this.$store.state.intGotServerUrl == 2) {
					// Here We need to connect to socket.io server
					try {
            this.$funUpdateConsole("Start Try Connect Socket.io", true);
            // Set Connecting
						this.$store.commit("setIntConnectSocketIO", 1);

						var strUrl = 'https://' + this.$store.state.strServerUrl + ':' + this.$store.state.intPortSocketIos;

            // ********** Important Note **********
            // Here we use reconnection: false
            // So that, when the socket disconnected, we do not reconnect automatically,
            // Because we'll get another Server List and connect to another Socket.IO Server,
            // if reconnection = true, the "Old Disconnected" socket will connect again when the OLD socket.io server is available again.
            var socketInstance = io(strUrl, {
              reconnection: false,
              transports: ['websocket'], 
              rejectUnauthorized: false, 
              secure: true,
            });
            Vue.use(new VueSocketIO({ 
              debug: true, 
              connection: socketInstance, 
              vuex: { 
                store, 
                actionPrefix: 'SOCKETA_', 
                mutationPrefix: 'SOCKETM_'
              },
            }));
            this.$funUpdateConsole("End Try Connect Socket.io", true);
   				} catch (err) {
						this.$funUpdateConsole('Try to connect Socket.io Error: ' + err, true);
					};
				};



      } catch (err) {
        this.$funUpdateConsole("funTimMain Error: " + err, true);
      } finally {
        setTimeout(this.funTimMain, 1000);
      }
    },
  },
  // funTimMain End ******



  // Mounted
  mounted() {
    // Set Main Timer
    this.funTimMain();
  },



  // Rounter Declaration
  router,
  // Global Variables
  store,
  // Start App
  render: h => h(App)
}).$mount('#app')
