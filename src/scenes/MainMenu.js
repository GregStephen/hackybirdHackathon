import Phaser from "phaser";
import background from '../assets/cityskyline.png';

let graphics;
let cursors;

export default new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function () {
    Phaser.Scene.call(this, { key: 'mainmenu' });
  },
  preload: function preload() {
    this.load.image("background", background);
   },
  create: function() {
    this.add.image(500, 350, "background");
    cursors = this.input.keyboard.createCursorKeys();

    /*graphics = this.add.graphics();
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(0, 0, 800, 600);
    */

    this.add.text(350, 300, "Press space to start.")
    this.add.text(350, 315, "Move with up, down, left, right.")
    this.add.text(350, 330, "Press spacebar to brake.")
    this.add.text(350, 345, "Collect all the stars to win.")
  },
  update: function () {

    if (cursors.space.isDown) {
      this.scene.start('game');
    }
  }
})