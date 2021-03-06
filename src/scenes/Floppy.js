import Phaser from "phaser";
import GameOptions from '../utils/GameOptions';
import background from '../assets/softwindows-95-desktop.jpg';
import floppyImage from '../assets/floppy-disk.png';
import mouseImage from '../assets/mouse.png';
import compMonitorImage from '../assets/monitor.png';
import themeMusic from '../assets/audio/floppytunes.mp3';
import deathSound from '../assets/audio/player_death.wav';
import monitorSound from '../assets/audio/monitor.wav';

let floppy;
let monitor;
let mouseGroup;
let theme;
let monitorEffect;
let gameStarted;
let gameOptions;
const monitory = 380;

export default new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function () {
    Phaser.Scene.call(this, { key: 'floppy' });
  },
  init: function (data) {
    this.difficulty = data.diff;
  },
  preload: function () {
    // CHANGES OPTIONS TO MAKE GAME MORE DIFFICULT IF HARD WAS SELECTED
    if (this.difficulty === 'hard'){
      gameOptions = GameOptions.hardFloppyGameOptions;
    }
    // CHANGES OPTIONS TO MAKE GAME LESS DIFFICULT IF EASY WAS SELECTED
    else if (this.difficulty === 'easy'){
      gameOptions = GameOptions.easyFloppyGameOptions;
    }
    // LOADS ALL THE IMAGES YA NEED
    this.load.image('background', background);
    this.load.image('floppy', floppyImage);
    this.load.image('mouse', mouseImage);
    this.load.image('compMonitor', compMonitorImage);
  },
  create: function () {
    gameStarted = false;
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
    floppy.setScale(0.15);
    floppy.setCollideWorldBounds(true);


    // HANDLES THE MOVEMENT OF OUR HERO
    this.input.on('pointerdown', this.bounce, this);
    this.input.keyboard.on("keydown-SPACE", () => {
      this.bounce();
    });

    // CREATES OUR MICE(MOUSES)

      mouseGroup = this.physics.add.group();
      this.mousePool = [];
      for (let i = 0; i < gameOptions.maxNumberOfMice; i++) {
        this.mousePool.push(mouseGroup.create(0, 0, 'mouse'));
        this.mousePool.push(mouseGroup.create(0, 0, 'mouse'));
        if (i === 0) {
          this.placeMice(false, true);
        }
        else {
          this.placeMice(false, false);
        }
      }
      mouseGroup.setVelocityX(-gameOptions.floppySpeed);  
    

    // DON'T HIT THE MICE
    this.physics.add.collider(floppy, mouseGroup, function () {
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
  placeMice: function (addScore, first) {
    let rightMost = this.getRightMostMouse();
    let mouseHoleHeight = Phaser.Math.Between(gameOptions.mouseHole[0], gameOptions.mouseHole[1]);
    let mouseHolePosition = Phaser.Math.Between(gameOptions.minMouseHeight + mouseHoleHeight / 2, 650 - gameOptions.minMouseHeight - mouseHoleHeight / 2);
    // TOP MOUSE
    if (first) {
      this.mousePool[0].x = 1000;
      this.mousePool[0].y = mouseHolePosition - mouseHoleHeight / 2;
    }
    else {
      this.mousePool[0].x = rightMost + this.mousePool[0].getBounds().width + Phaser.Math.Between(gameOptions.mouseDistance[0], gameOptions.mouseDistance[1]);
      this.mousePool[0].y = mouseHolePosition - mouseHoleHeight / 2;
    }

    this.mousePool[0].setScale(0.75);
    this.mousePool[0].setOrigin(0, 1);
    // SHOWS THE MONITOR INSTEAD OF THE BOTTOM MOUSE ONCE THEY REACH A CERTAIN SCORE
    // RESHOWS IF THEY MISS IT ONCE THEY HIT THAT SCORE AGAIN
    if (this.score !== 0 && this.score % gameOptions.scoreToShowMonitor === 0) {
      let monitorx = this.mousePool[0].x;
      monitor = this.physics.add.sprite(monitorx, monitory, 'compMonitor');
      monitor.setOrigin(0, 0);
      monitor.setVelocityX(-gameOptions.floppySpeed);
      monitor.body.immovable = true;
      monitorEffect = new Audio(monitorSound)
      this.physics.add.collider(floppy, monitor, function () {
        monitorEffect.play();
        floppy.destroy();
        mouseGroup.setVelocityX(0); 
        monitor.setVelocityX(0);
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
      this.updateScore(gameOptions.scoreToIncrease);
    }

    // IF THEY HIT THE MONITOR IT LOADS THE NEXT GAME
    const loadGame = () => {
      theme.pause();
      theme.currentTime = 0
      let gameLoad = this.time.addEvent({
        delay: 4000,
        callback: () => {
          this.scene.start('picnicMenu', { score: this.score });
          monitorEffect.pause();
        },
        callbackScope: this
      })
    }
  },
  // FUNCTION THAT RETURNS THE ROW OF THE RIGHTMOST MOUSE
  getRightMostMouse: function () {
    let rightMostMouse = 0;
    mouseGroup.getChildren().forEach(function (mouse) {
      rightMostMouse = Math.max(rightMostMouse, mouse.x);
    });
    return rightMostMouse;
  },
  // THE FUNCTION THAT MAKES YA BOY BOUNCE
  bounce: function () {
    if (!gameStarted) {
      gameStarted = true;
      floppy.body.gravity.y = gameOptions.floppyGravity;
    }
    floppy.body.velocity.y += -gameOptions.floppyThrustPower;
  },
  update: function () {
    // PLACES MORE MOUSE ROWS IN POOL AND MAKES MORE MICE IF NEEDED
    mouseGroup.getChildren().forEach(function (mouse) {
      if (mouse.getBounds().right < 0) {
        this.mousePool.push(mouse);
        if (this.mousePool.length == gameOptions.maxNumberOfMice / 2) {
          this.placeMice(true, false);
        }
      }
    }, this)
  },
});