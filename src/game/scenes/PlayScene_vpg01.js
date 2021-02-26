import { Scene } from 'phaser'


export default class PlayScene_vpg01 extends Scene {
  constructor () {
    super({ key: 'PlayScene_vpg01' })
  }

  create () {
    var imgSky = this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2, 'sky');
    imgSky.setDisplaySize(this.game.canvas.width, this.game.canvas.height);

    const bomb = this.physics.add.image(400, 200, 'bomb')
    bomb.setCollideWorldBounds(true)
    bomb.body.onWorldBounds = true // enable worldbounds collision event
    bomb.setBounce(1)
    bomb.setVelocity(200, 20)

    this.sound.add('thud')
    this.physics.world.on('worldbounds', () => {
      this.sound.play('thud', { volume: 0.75 })
    })
  }

  update () {
  }
}
