<template>
  <div :id="divContainerID" v-if="bolDownloaded" />
  <div class="placeholder" v-else>
    Downloading ...
  </div>
</template>


<script>
export default {
  name: 'Vpg01',
  data() {
    return {
      bolDownloaded: false,
      gameInstance: null,
      divContainerID: 'divGameContainer'
    }
  },
  async mounted() {
    const game = await import(/* webpackChunkName: "game" */ '@/game/vpg01');
    this.bolDownloaded = true;
    this.$nextTick(() => {
      this.gameInstance = game.launch(this.divContainerID);
    })
  },
  destroyed() {
    this.gameInstance.destroy(false)
  }
}
</script>


<style lang="scss" scoped>
.placeholder {
  font-size: 2rem;
  font-family: 'Courier New', Courier, monospace;
}
</style>
