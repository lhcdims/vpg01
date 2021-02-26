<template>
  <div id="divHome">
    <div v-if="this.$store.state.intConnectSocketIO == 2">
      <div v-if="this.$store.state.strGameName == 'vpg01'">
        <Vpg01 />
      </div>
      <div v-else>
        Game Not Found
      </div>
    </div>
    <div v-else>
      Loading
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Vpg01 from '@/components/Vpg01';
export default {
  name: 'Home',
  components: {
    Vpg01,
  },
  data() {
    return {
    };
  },
  beforeCreate() {
  },
  methods: {
  },
  mounted() {
    // window.scrollTo(0, 0);
  },
  beforeDestroy() {
  },
}
</script>


<style scoped>
</style>