import Phaser from "phaser";
// MUSIC import mp3 from "../assets/Orbital\ Colossus.mp3";
import sky from '../assets/cityskyline.png';
import hotdogImage from '../assets/hotdog.png';
import muzzleFlash from '../assets/particles/muzzleflash3.png'

let hotdog;
let cursors;
let fireParticles;
const gameOptions = {
  // hotdog gravity, will make hotdog fall 
  hotdogGravity: 800,

  // fuel thrust
  hotdogFuelPower: 100,
};

export default new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function () {
    Phaser.Scene.call(this, { key: 'game' });
    this.score = 0;
  },
  preload: function preload() {
    this.load.image('background-sky', sky);
    this.load.image('hotdog', hotdogImage);
    this.load.image('fire', muzzleFlash)
  },
  create: function create() {
    this.add.image(400, 300, "background-sky");

    this.scoreText = this.add.text(100, 16, 'score: ' + this.score, { fontSize: '32px', fill: '#000' });

    hotdog = this.physics.add.sprite(400, 300, 'hotdog');
    hotdog.setFlipX(true);
    hotdog.body.gravity.y = gameOptions.hotdogGravity;
    hotdog.setCollideWorldBounds(true);

    fireParticles = this.add.particles('fire');

    fireParticles.createEmitter({
      alpha: { start: 1, end: 0 },
      scale: { start: 0.15, end: 0.5 },
      //tint: { start: 0xff945e, end: 0xff945e },
      speed: 5,
      accelerationY: -100,
      angle: { min: -85, max: -95 },
      rotate: { min: -180, max: 180 },
      lifespan: { min: 1000, max: 1100 },
      blendMode: 'ADD',
      frequency: 110,
      maxParticles: 10,
      x: hotdog.x,
      y: hotdog.y + 65
    });

    cursors = this.input.keyboard.createCursorKeys();

  },
  update: function () {
    if (cursors.space.isDown || this.input.activePointer.isDown) {
      //fireParticles.setPosition(hotdog.x, hotdog.y);
      hotdog.body.velocity.y += -gameOptions.hotdogFuelPower;
    }
  }
});