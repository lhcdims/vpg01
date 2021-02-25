<template>
  <div id="divHome">
    <Game />
  </div>
</template>

<script>
// @ is an alias to /src
import Game from '@/components/Game';
export default {
  name: 'Home',
  components: {
    Game,
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
    window.scrollTo(0, 0);
  },
  beforeDestroy() {
  },
}
</script>


<style scoped>
</style>