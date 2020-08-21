import Phaser from "phaser";
import background from '../assets/softwindows-95-desktop.jpg';
import floppyImage from '../assets/floppy.png';
import mouseImage from '../assets/mouse.png';
import compMonitorImage from '../assets/monitor.png';
import themeMusic from '../assets/audio/floppytunes.mp3';
import deathSound from '../assets/audio/player_death.wav';
import monitorSound from '../assets/audio/monitor.wav';

let floppy;
let cursors;
let monitor;
let theme;
const maxNumberOfMice = 4;
let scoreToIncrease = 5;
let scoreToShowMonitor = 15;
const monitory = 380;

const gameOptions = {
  // floppy gravity, will make floppy fall 
  floppyGravity: 600,

  // floppy thrust
  floppyThrustPower: 350,

  // floppy speed
  floppySpeed: 160,

  // minimum mouse height, in pixels, Affects opening position
  minMouseHeight: 170,

  // distance range from next mouse, in pixels
  mouseDistance: [190, 280],

  // opening range between mice, in pixels
  mouseHole: [175, 250],
};

export default new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function () {
    Phaser.Scene.call(this, { key: 'floppy' });
  },
  init: function (data) {
    this.difficulty = data.diff;
  },
  preload: function () {
    if (this.difficulty === 'hard'){
      gameOptions.floppySpeed = 275;
      gameOptions.mouseDistance = [180, 250];
      gameOptions.minMouseHeight = 150,
      gameOptions.mouseHole = [125, 200];
      scoreToIncrease = 10;
      scoreToShowMonitor = 40;
    }
    else if (this.difficulty === 'easy'){
      gameOptions.floppySpeed = 160;
      gameOptions.mouseDistance = [190, 270];
      gameOptions.minMouseHeight = 170,
      gameOptions.mouseHole = [160, 245];
      scoreToIncrease = 5;
      scoreToShowMonitor = 15;
    }
    this.load.image('background', background);
    this.load.image('floppy', floppyImage);
    this.load.image('mouse', mouseImage);
    this.load.image('compMonitor', compMonitorImage);
  },
  create: function () {

    // CREATES OUR SWEET BACKGROUND
    this.add.image(500, 350, "background");

    theme = new Audio(themeMusic);
    theme.play();

    let death = new Audio(deathSound);


    // HANDLES ALL THE SCORE
    this.score = 0;
    this.scoreText = this.add.text(100, 10, '', { fontSize: '32px', fill: '#FFF' });
    this.updateScore(this.score);

    // CREATES OUR HERO
    floppy = this.physics.add.sprite(200, 300, 'floppy');
    floppy.setScale(0.5);
    floppy.body.gravity.y = gameOptions.floppyGravity;
    floppy.setCollideWorldBounds(true);

    // HANDLES THE MOVEMENT OF OUR HERO
    cursors = this.input.keyboard.createCursorKeys();
    this.input.on('pointerdown', this.bounce, this);
    this.input.keyboard.on("keydown-SPACE", () => {
      this.bounce();
    });

    // CREATES OUR MICE(MOUSES)
    this.mouseGroup = this.physics.add.group();
    this.mousePool = [];
    for (let i = 0; i < maxNumberOfMice; i++) {
      this.mousePool.push(this.mouseGroup.create(0, 0, 'mouse'));
      this.mousePool.push(this.mouseGroup.create(0, 0, 'mouse'));
      this.placeMice(false);
    }
    this.mouseGroup.setVelocityX(-gameOptions.floppySpeed);

    // DON'T HIT THE MICE
    this.physics.add.collider(floppy, this.mouseGroup, function () {
      death.play();
      die();
    });

    // OR ELSE YOU DIE
    const die = () => {
      theme.pause();
      theme.currentTime = 0
      floppy.destroy();
      let timedEvent = this.time.addEvent({
        delay: 250,
        callback: () => {
          this.scene.start('death', { score: this.score });
        },
        callbackScope: this
      })
    }
  },
  // WITH EVERY ROW THAT PASSES YOUR SCORE INCREASES
  updateScore: function (increase) {
    this.score += increase;
    this.scoreText.text = 'Score: ' + this.score;
  },
  // THIS PLACES THE MICE ON THE SCREEN
  // THE ORIGINAL MICE WOULD PASS IN FALSE TO NOT INCREASE SCORE
  // EVERY NEW ROW OF MICE WOULD PASS TRUE WHICH WOULD INCREASE SCORE
  // SINCE THEY WERE CREATED BECAUSE ANOTHER ROW PASSED
  placeMice: function (addScore) {
    let rightMost = this.getRightMostMouse();
    let mouseHoleHeight = Phaser.Math.Between(gameOptions.mouseHole[0], gameOptions.mouseHole[1]);
    let mouseHolePosition = Phaser.Math.Between(gameOptions.minMouseHeight + mouseHoleHeight / 2, 650 - gameOptions.minMouseHeight - mouseHoleHeight / 2);
    // TOP MOUSE
    this.mousePool[0].x = rightMost + this.mousePool[0].getBounds().width + Phaser.Math.Between(gameOptions.mouseDistance[0], gameOptions.mouseDistance[1]);
    this.mousePool[0].y = mouseHolePosition - mouseHoleHeight / 2;
    this.mousePool[0].setScale(0.75);
    this.mousePool[0].setOrigin(0, 1);
    // SHOWS THE MONITOR INSTEAD OF THE BOTTOM MOUSE ONCE THEY REACH A CERTAIN SCORE
    // RESHOWS IF THEY MISS IT ONCE THEY HIT THAT SCORE AGAIN
    if (this.score !== 0 && this.score % scoreToShowMonitor === 0) {
      let monitorx = this.mousePool[0].x;
      monitor = this.physics.add.sprite(monitorx, monitory, 'compMonitor');
      monitor.setOrigin(0, 0);
      monitor.setVelocityX(-gameOptions.floppySpeed);
      let monitorEffect = new Audio(monitorSound)
      this.physics.add.collider(floppy, monitor, function () {
        monitorEffect.play();
        floppy.destroy();
        loadGame();
      });
    }
    else {
      // BOTTOM MOUSE
      this.mousePool[1].x = this.mousePool[0].x;
      this.mousePool[1].y = mouseHolePosition + mouseHoleHeight / 2;
      this.mousePool[1].setScale(0.75);
      this.mousePool[1].setOrigin(0, 0);
      this.mousePool[1].setFlipY(true);
    }
    this.mousePool = [];
    if (addScore) {
      this.updateScore(scoreToIncrease);
    }

    // IF THEY HIT THE MONITOR IT LOADS THE NEXT GAME
    const loadGame = () => {
      theme.pause();
      theme.currentTime = 0
      let gameLoad = this.time.addEvent({
        delay: 4000,
        callback: () => {
          this.scene.start('picnicMenu', { score: this.score });
        },
        callbackScope: this
      })

    }
  },
  // FUNCTION THAT RETURNS THE ROW OF THE RIGHTMOST MOUSE
  getRightMostMouse: function () {
    let rightMostMouse = 0;
    this.mouseGroup.getChildren().forEach(function (mouse) {
      rightMostMouse = Math.max(rightMostMouse, mouse.x);
    });
    return rightMostMouse;
  },
  // THE FUNCTION THAT MAKES YA BOY BOUNCE
  bounce: function () {
    floppy.body.velocity.y += -gameOptions.floppyThrustPower;
  },
  update: function () {
    // PLACES MORE MOUSE ROWS IN POOL AND MAKES MORE MICE IF NEEDED
    this.mouseGroup.getChildren().forEach(function (mouse) {
      if (mouse.getBounds().right < 0) {
        this.mousePool.push(mouse);
        if (this.mousePool.length == 2) {
          this.placeMice(true);
        }
      }
    }, this)
  },
});