// Import
import Vue from 'vue'
import VueRouter from 'vue-router'
// import Home from '../views/Home.vue'
import store from '@/store/index';
Vue.use(VueRouter)

// To use variables in store.state in Vue Router, must use:
// store.state.variablename

// You cannot use Vue.prototype.$varaiblename (or function name) inside vue router,
// This is vue router design behaviour, if you really need to use it,
// move that variable to store.state

const routes = [
  {
    path: '/',
    name: 'Home',
    component: resolve => require(['../views/Home.vue'], resolve),
    // component: Home,
    meta: { 
      bolRequireToken: false,
      bolRequireActivate: false,
    }
  },
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.bolRequireToken)) {
    // That page require after Login Token
    let strToken = localStorage.getItem('strToken');
    if (strToken == null || strToken == '') {
      console.log('No Token Goto Login');
      next('/login');
      // No Token, go to login page
      // next({
      //   path: '/login',
      //   params: { nextUrl: to.fullPath }
      // });
    } else {
      // With Token, Check Token Expiry

      // Get Token Expiry Date
      let intTokenExpiryDate = localStorage.getItem('intTokenDate');
      // Get Larger of Client Date and Server Date
      let intLargerDate = Math.max(store.state.gintServerDateFromEpoch, Date.now());

      // Check Token Expiry Date
      if (intLargerDate - intTokenExpiryDate > store.state.gintTokenExpiryS * 1000) {
        // Token Expired, should not allow go inside that route

        // Do Logout
        store.dispatch('actLogout');

        console.log('Token Expired Goto Login');

        // Goto Login Page
        next('/login');
      } else {
        // Token Not Expired.

        // Check Require Activation
        // Original => Statement
        // if (to.matched.some(record => record.meta.bolRequireActivate)) {
        // Here we use traditional function to replace =>, as an example 
        // to check against int Access Level for later requirements
        if (to.matched.some(function (record) { 
          let bolRequire = false;
          if (record.meta.bolRequireActivate) {
            bolRequire = true
          }
          return bolRequire;} ))
        {
          // Get User Status
          
          let strUserStatus = localStorage.getItem('strUserStatus');
          if (strUserStatus == "A") {
            // Require Activation but not Activated
            next('/activate');
          } else {
            next();
          }
        } else {
          // That page does not require Activation
          next();
        }
      }
    }
  } else {
    // That page does not need any Token, go to that page.
    next();
  }
})

export default router