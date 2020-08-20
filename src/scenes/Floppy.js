import Phaser from "phaser";
import background from '../assets/softwindows-95-desktop.jpg';
import floppyImage from '../assets/floppy.png';
import mouseImage from '../assets/mouse.png';
import compMonitorImage from '../assets/monitor.png';

let floppy;
let cursors;
let monitor;
const maxNumberOfMice = 4;
const scoreToIncrease = 5;
const scoreToShowMonitor = 15;

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
  mouseHole: [125, 230],
};

export default new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function () {
    Phaser.Scene.call(this, { key: 'floppy' });
  },
  preload: function () {
    this.load.audio('theme', 'src/assets/audio/floppytunes.mp3')
    this.load.audio('floppyDeath', 'src/assets/audio/player_death.wav')
    this.load.image('background', background);
    this.load.image('floppy', floppyImage);
    this.load.image('mouse', mouseImage);
    this.load.image('compMonitor', compMonitorImage);
  },
  create: function () {
    // CREATES OUR SWEET BACKGROUND
    this.add.image(500, 350, "background");

    let music = this.sound.add('theme');
    music.play();

    let death = this.sound.add('floppyDeath');

    // HANDLES ALL THE SCORE
    this.score = 0;
    this.scoreText = this.add.text(100, 10 , '', { fontSize: '32px', fill: '#FFF' });
    this.updateScore(this.score);

    // CREATES OUR HERO
    floppy = this.physics.add.sprite(200, 300, 'floppy');
    floppy.setScale(0.5);
    floppy.body.gravity.y = gameOptions.floppyGravity;
    floppy.setCollideWorldBounds(true);

    // HANDLES THE MOVEMENT OF OUR HERO
    cursors = this.input.keyboard.createCursorKeys();
    this.input.on('pointerdown', this.bounce, this);
    if (cursors.space.isDown){
      this.bounce();
    }

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
    this.physics.add.collider(floppy, this.mouseGroup, function(){
      death.play();
      die();
    });    

    // OR ELSE YOU DIE
    const die = () => {
      music.stop();
      this.scene.start('death');
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
    if(this.score !== 0 && this.score % scoreToShowMonitor === 0) {
      let monitorx = this.mousePool[0].x;
      let monitory = mouseHolePosition + mouseHoleHeight / 2;
      monitor = this.physics.add.sprite(monitorx, monitory, 'compMonitor');
      monitor.setOrigin(0, 0);
      monitor.setVelocityX(-gameOptions.floppySpeed);
      this.physics.add.collider(floppy, monitor, function(){
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
      this.scene.start('game');
    }
  },
  // FUNCTION THAT RETURNS THE ROW OF THE RIGHTMOST MOUSE
  getRightMostMouse: function () {
    let rightMostMouse = 0;
    this.mouseGroup.getChildren().forEach(function(mouse){
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
    this.mouseGroup.getChildren().forEach(function(mouse){
      if(mouse.getBounds().right < 0){
        this.mousePool.push(mouse);
        if(this.mousePool.length == 2){
          this.placeMice(true);
        }
      }
    }, this) 
  },
});