import Phaser from "phaser";
// MUSIC import mp3 from "../assets/Orbital\ Colossus.mp3";
import sky from '../assets/cityskyline.png';
import hotdogImage from '../assets/hotdog.png';
import forkImage from '../assets/fork.png';
import ketchupImage from '../assets/ketchup.png';
import heroTheme from '../assets/audio/hotdogHero.ogg';
import deathSound from '../assets/audio/player_death.wav';
import muzzleFlash from '../assets/particles/muzzleflash3.png'

let hotdog;
let cursors;
let theme;
const maxNumberOfForks = 4;
const scoreToIncrease = 5;

//let fireParticles;
const gameOptions = {
  // hotdog gravity, will make hotdog fall 
  hotdogGravity: 600,

  // fuel thrust
  hotdogFuelPower: 350,

  // hot dog speed
  hotdogSpeed: 160,

  // minimum fork height, in pixels, Affects opening position
  minForkHeight: 100,

  // distance range from next fork, in pixels
  forkDistance: [220, 280],

  // opening range between forks, in pixels
  forkHole: [150, 250],
};

export default new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function () {
    Phaser.Scene.call(this, { key: 'game' });
  },
  init: function (data) {
    this.score = data.score;
  },
  preload: function () {
    this.load.image('background-sky', sky);
    this.load.image('hotdog', hotdogImage);
    this.load.image('fork', forkImage);
    this.load.image('ketchup', ketchupImage);
    //this.load.image('fire', muzzleFlash)

  },
  create: function create() {
    this.add.image(400, 300, "background-sky");

    theme = new Audio(heroTheme);
    theme.play();

    let death = new Audio(deathSound);

    // HANDLES THE SCORE
    this.scoreText = this.add.text(100, 16, 'score: ' + this.score, { fontSize: '32px', fill: '#000' });
    this.updateScore(this.score);

    // CREATES THE HOTDOG
    hotdog = this.physics.add.sprite(150, 300, 'hotdog');
    hotdog.setFlipX(true);
    hotdog.setScale(0.5);
    hotdog.body.gravity.y = gameOptions.hotdogGravity;
    hotdog.setCollideWorldBounds(true);

    // HANDLES THE MOVEMENT OF THE HOTDOG
    cursors = this.input.keyboard.createCursorKeys();
    this.input.on('pointerdown', this.bounce, this);

    // CREATES OUR FORKS
    this.forkGroup = this.physics.add.group();
    this.forkPool = [];
    for (let i = 0; i < maxNumberOfForks; i++) {
      this.forkPool.push(this.forkGroup.create(0, 0, 'fork'));
      this.forkPool.push(this.forkGroup.create(0, 0, 'fork'));
      this.placeForks(false);
    }
    this.forkGroup.setVelocityX(-gameOptions.hotdogSpeed);

    // DON'T HIT THE FORKS
    this.physics.add.collider(hotdog, this.forkGroup, function () {
      death.play();
      die();
    });

    // OR ELSE YOU DIE
    const die = () => {
      theme.pause();
      theme.currentTime = 0
      hotdog.destroy();
      let timedEvent = this.time.addEvent({
        delay: 250,
        callback: () => {
          this.scene.start('death', { score: this.score });
        },
        callbackScope: this
      })
    }
    /*fireParticles = this.add.particles('fire');

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
*/
  },
  // WITH EVERY ROW THAT PASSES YOUR SCORE INCREASES
  updateScore: function (increase) {
    this.score += increase;
    this.scoreText.text = 'Score: ' + this.score;
  },
  // THIS PLACES THE FORKS ON THE SCREEN
  // THE ORIGINAL FORKS WOULD PASS IN FALSE TO NOT INCREASE SCORE
  // EVERY NEW ROW OF FORKS WOULD PASS TRUE WHICH WOULD INCREASE SCORE
  // SINCE THEY WERE CREATED BECAUSE ANOTHER ROW PASSED
  placeForks: function (addScore) {
    let rightMost = this.getRightMostFork();
    let forkHoleHeight = Phaser.Math.Between(gameOptions.forkHole[0], gameOptions.forkHole[1]);
    let forkHolePosition = Phaser.Math.Between(gameOptions.minForkHeight + forkHoleHeight / 2, 650 - gameOptions.minForkHeight - forkHoleHeight / 2);
    // TOP fork
    this.forkPool[0].x = rightMost + this.forkPool[0].getBounds().width + Phaser.Math.Between(gameOptions.forkDistance[0], gameOptions.forkDistance[1]);
    this.forkPool[0].y = forkHolePosition - forkHoleHeight / 2;
    this.forkPool[0].setScale(0.75);
    this.forkPool[0].setOrigin(0, 1);
    this.forkPool[0].setFlipY(true);
    // BOTTOM fork
    this.forkPool[1].x = this.forkPool[0].x;
    this.forkPool[1].y = forkHolePosition + forkHoleHeight / 2;
    this.forkPool[1].setScale(0.75);
    this.forkPool[1].setOrigin(0, 0);

    this.forkPool = [];
    if (addScore) {
      this.updateScore(scoreToIncrease);
    }
  },
  // FUNCTION THAT RETURNS THE ROW OF THE RIGHTMOST FORK
  getRightMostFork: function () {
    let rightMostFork = 0;
    this.forkGroup.getChildren().forEach(function (fork) {
      rightMostFork = Math.max(rightMostFork, fork.x);
    });
    return rightMostFork;
  },
  // THE FUNCTION THAT MAKES YA BOY BOUNCE
  bounce: function () {
    console.error('bounced', hotdog.x, hotdog.y);
    hotdog.body.velocity.y += -gameOptions.hotdogFuelPower;
  },
  update: function () {  
    // PLACES MORE FORK ROWS IN POOL AND MAKES MORE FORKS IF NEEDED
    this.forkGroup.getChildren().forEach(function(fork){
      if(fork.getBounds().right < 0){
        this.forkPool.push(fork);
        if(this.forkPool.length == 2){
          this.placeForks(true);
        }
      }
    }, this) 
  }
});