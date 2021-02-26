import Phaser from 'phaser'
import BootScene_vpg01 from './scenes/BootScene_vpg01'
import PlayScene_vpg01 from './scenes/PlayScene_vpg01'


function launch(containerId) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: "100%",
    height: "100%",
    parent: containerId,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 300 },
        debug: false
      }
    },
    scene: [BootScene_vpg01, PlayScene_vpg01]
  })
}

export default launch
export { launch }
