import Phaser from "phaser";

let graphics;
let cursors;

export default new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function () {
    Phaser.Scene.call(this, { key: 'death' });
  },
  init: function (data) {
    this.score = data.score;
  },
  create: function() {
    cursors = this.input.keyboard.createCursorKeys();
    graphics = this.add.graphics();
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(0, 0, 800, 600);
    this.add.text(200, 200, "FINAL SCORE: " + this.score).setFontSize(75);
    this.add.text(275, 300, "You done died!")
    this.add.text(275, 325, "Press space to go back to menu.")

  },
  update: function () {

    if (cursors.space.isDown) {
      this.scene.start('mainmenu');
    }
  }
})