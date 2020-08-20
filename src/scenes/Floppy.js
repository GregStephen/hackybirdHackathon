import Phaser from "phaser";
// MUSIC import mp3 from "../assets/Orbital\ Colossus.mp3";
import background from '../assets/softwindows-95-desktop.jpg';
import floppyImage from '../assets/floppy.png';
import mouseImage from '../assets/mouse.png';

let floppy;
let cursors;
const maxNumberOfMice = 4;

const gameOptions = {
  // floppy gravity, will make floppy fall 
  floppyGravity: 600,

  // floppy thrust
  floppyThrustPower: 350,

  // floppy speed
  floppySpeed: 160,

  // minimum mouse height, in pixels, Affects opening position
  minMouseHeight: 170,

  // distance range from next pipe, in pixels
  mouseDistance: [220, 280],

  // opening range between mice, in pixels
  mouseHole: [155, 230],
};

export default new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function () {
    Phaser.Scene.call(this, { key: 'floppy' });
    this.score = 0;
  },
  preload: function () {
    this.load.image('background', background);
    this.load.image('floppy', floppyImage);
    this.load.image('mouse', mouseImage);
  },
  create: function () {
    this.add.image(500, 350, "background");

    this.scoreText = this.add.text(100, 10 , '', { fontSize: '32px', fill: '#FFF' });
    this.updateScore(this.score);

    floppy = this.physics.add.sprite(200, 300, 'floppy');
    floppy.setScale(0.5);
    floppy.body.gravity.y = gameOptions.floppyGravity;
    floppy.setCollideWorldBounds(true);

    cursors = this.input.keyboard.createCursorKeys();
    this.input.on('pointerdown', this.bounce, this);
    this.input.on('keydown_SPACE', this.bounce, this);


    this.mouseGroup = this.physics.add.group();
    this.mousePool = [];
    for (let i = 0; i < maxNumberOfMice; i++) {
      this.mousePool.push(this.mouseGroup.create(0, 0, 'mouse'));
      this.mousePool.push(this.mouseGroup.create(0, 0, 'mouse'));
      this.placeMice(false);
    }
    this.mouseGroup.setVelocityX(-gameOptions.floppySpeed);

  },
  updateScore: function (increase) {
    this.score += increase;
    this.scoreText.text = 'Score: ' + this.score;
  },
  placeMice: function (addScore) {
    let rightMost = this.getRightMostMouse();
    let mouseHoleHeight = Phaser.Math.Between(gameOptions.mouseHole[0], gameOptions.mouseHole[1]);
    let mouseHolePosition = Phaser.Math.Between(gameOptions.minMouseHeight + mouseHoleHeight / 2, 650 - gameOptions.minMouseHeight - mouseHoleHeight / 2);
    // TOP MOUSE
    this.mousePool[0].x = rightMost + this.mousePool[0].getBounds().width + Phaser.Math.Between(gameOptions.mouseDistance[0], gameOptions.mouseDistance[1]);
    this.mousePool[0].y = mouseHolePosition - mouseHoleHeight / 2;
    this.mousePool[0].setScale(0.75);
    this.mousePool[0].setOrigin(0, 1);
    // BOTTOM MOUSE
    this.mousePool[1].x = this.mousePool[0].x;
    this.mousePool[1].y = mouseHolePosition + mouseHoleHeight / 2;
    this.mousePool[1].setScale(0.75);
    this.mousePool[1].setOrigin(0, 0);
    this.mousePool[1].setFlipY(true);
    this.mousePool = [];
    if (addScore) {
      this.updateScore(1);
    }
  },
  getRightMostMouse: function () {
    let rightMostMouse = 0;
    this.mouseGroup.getChildren().forEach(function(mouse){
      rightMostMouse = Math.max(rightMostMouse, mouse.x);
    });
    return rightMostMouse;
  },
  bounce: function () {
      floppy.body.velocity.y += -gameOptions.floppyThrustPower;
  },
  update: function () {
    /*
    this.physics.add.collider(this.floppy, this.mouseGroup, function(){
      this.die();
    }, null, this);
    if(this.floppy.y > 650 || this.floppy.y < 0){
      this.die();
    }
*/
    this.mouseGroup.getChildren().forEach(function(mouse){
      if(mouse.getBounds().right < 0){
        this.mousePool.push(mouse);
        if(this.mousePool.length == 2){
          this.placeMice(true);
        }
      }
    }, this)
        
  },
  die: function () {
    this.scene.start('death');
  }
});