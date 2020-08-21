import Phaser from "phaser";
import sky from '../assets/table.jpg';
import hotdogImage from '../assets/hotdog.png';
import forkImage from '../assets/fork.png';
import ketchupImage from '../assets/ketchup.png';
import heroTheme from '../assets/audio/hotdogHero.ogg';
import deathSound from '../assets/audio/player_death.wav';
import ketchupPickup from '../assets/audio/pickup.wav';

let hotdog;
let cursors;
let theme;
let ketchupPickupSound;
const maxNumberOfForks = 4;
const scoreToIncrease = 5;
const ketchupBonus = 20;


//let fireParticles;
const gameOptions = {
  // hotdog gravity, will make hotdog fall 
  hotdogGravity: 600,

  // fuel thrust
  hotdogFuelPower: 350,

  // hot dog speed
  hotdogSpeed: 175,

  // minimum fork height, in pixels, Affects opening position
  minForkHeight: 100,

  // distance range from next fork, in pixels
  forkDistance: [225, 290],

  // opening range between forks, in pixels
  forkHole: [150, 250],
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

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
    // MAKES THE BG FULL SCREEN
    let image = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background-sky')
    let scaleX = this.cameras.main.width / image.width
    let scaleY = this.cameras.main.height / image.height
    let scale = Math.max(scaleX, scaleY)
    image.setScale(scale).setScrollFactor(0)

    // BACKGROUND MUSIC
    theme = new Audio(heroTheme);
    theme.play();

    // YA DONE DIED MUSIC 
    let death = new Audio(deathSound);

    // HANDLES THE SCORE
    this.scoreText = this.add.text(100, 16, 'score: ' + this.score, { fontSize: '32px', fill: '#000' });
    //this.updateScore(this.score);

    // CREATES THE HOTDOG
    hotdog = this.physics.add.sprite(150, 300, 'hotdog');
    hotdog.setFlipX(true);
    hotdog.setScale(0.5);
    hotdog.body.gravity.y = gameOptions.hotdogGravity;
    hotdog.setCollideWorldBounds(true);

    // HANDLES THE MOVEMENT OF THE HOTDOG
    cursors = this.input.keyboard.createCursorKeys();
    this.input.on('pointerdown', this.bounce, this);
    this.input.keyboard.on("keydown-SPACE", () => {
      this.bounce();
    });

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
    // SETS UP KETCHUPS
    ketchupPickupSound = new Audio(ketchupPickup);
    this.ketchupGroup = this.physics.add.group();
    this.ketchupGroup.setVelocityX(-gameOptions.hotdogSpeed);
    let ketchupTime = this.time.addEvent({
      delay: 5000,
      callback: () => {
        this.createKetchup();
      },
      loop: true
    })
  },
  createKetchup: function () {
    let ketchup = this.ketchupGroup.create(1000, getRandomInt(100, 500), 'ketchup');
  //  if (!ketchup) return;
    ketchup.setScale(0.1);
  //  ketchup.enableBody(true, 1000, getRandomInt(100, 500), true, true);
    ketchup.setVelocityX(-gameOptions.hotdogSpeed);
    this.physics.add.overlap(hotdog, ketchup, () => this.collectKetchup(ketchup), null, this);
  },
  collectKetchup: function (ketchup) {
    ketchupPickupSound.play();
    ketchup.destroy();
    this.updateScore(ketchupBonus);
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
    hotdog.body.velocity.y += -gameOptions.hotdogFuelPower;
  },
  update: function () {
    // PLACES MORE FORK ROWS IN POOL AND MAKES MORE FORKS IF NEEDED
    this.forkGroup.getChildren().forEach(function (fork) {
      if (fork.getBounds().right < 0) {
        this.forkPool.push(fork);
        if (this.forkPool.length == 2) {
          this.placeForks(true);
        }
      }
    }, this)
  }
});