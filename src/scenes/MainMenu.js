import Phaser from "phaser";
import background from '../assets/softwindows-95-desktop.jpg';

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
    this.add.text(350, 315, "Click your mouse to stay afloat.")
    this.add.text(350, 330, "Find a computer and load a game.")
    this.add.text(350, 345, "Don't forget to dodge the mice (mouses?).")


  },
  update: function () {

    if (cursors.space.isDown) {
      this.scene.start('floppy');
    }
  }
})