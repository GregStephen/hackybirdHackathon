import Phaser from "phaser";
import picnicBg from '../assets/picnicMenu.jpg';

let cursors;

export default new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function () {
    Phaser.Scene.call(this, { key: 'picnicMenu' });
  },
  init: function (data) {
    this.score = data.score;
  },
  preload: function preload() {
    this.load.image("picnicBg", picnicBg);
   },
  create: function() {
    this.add.image(500, 350, "picnicBg");
    cursors = this.input.keyboard.createCursorKeys();

    this.add.text(250, 170, "HotDog Dogfight").setFontSize(60);
    this.add.text(400, 235, "Picnic in the skies")
    this.add.text(350, 300, "Press space to start.")
    this.add.text(350, 315, "Press space or click your mouse to stay afloat.")
    this.add.text(350, 330, "Collect Ketchups for extra points.")
    this.add.text(350, 345, "Don't get stuck by a fork!")
  },
  update: function () {

    if (cursors.space.isDown) {
      this.scene.start('game', { score: this.score });
    }
  }
})