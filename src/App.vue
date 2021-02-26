<template>
  <div id="app">
    <!-- <Game /> -->
    <!-- <v-app> -->
    <router-view>
    </router-view>
    <!-- </v-app> -->
  </div>
</template>


<script>
//import Game from '@/components/Game'
export default {
  name: 'App',
    methods: {
    funGetParms() {
      // Declare strGameName
      let strGameName = '';

      // Get url
      console.log(window.location.href);
      let uri = window.location.href.split('?');

      // Check if only 1 ? in url
      if (uri.length == 2) {
        // Find pid=
        let intIndexS = uri[1].indexOf('strGameName=');
        if (intIndexS != -1) {
          let intIndexE = uri[1].indexOf('#');
          try {
            strGameName = uri[1].substring(intIndexS+12,intIndexE);
          } catch (err) {
            // Can't Get strGameName
            console.log("Can't get strGameName");
          }
          
          // Check Valid Game Name
          switch(strGameName) {
            case 'vpg01':
              this.$store.commit("setStrGameName", strGameName);
              break;
            default:
              break;
          }
          console.log("strGameName: " + strGameName);
        } else {
          // strGameName Not Found in Url
          console.log("strGameName Not Found in Url");
        }
      } else {
        // Format Not Correct
        console.log("Format Not Correct");
      }
    }
  },
  mounted() {
    this.funGetParms();
  },
  //components: { Game }
}
</script>


<style lang="scss">
// body {
//   height: 100vh;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   margin: 0;
// }
</style>
