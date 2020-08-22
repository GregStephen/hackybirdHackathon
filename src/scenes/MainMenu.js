import Phaser from "phaser";
import { TextButton } from '../utils/TextButton';
import background from '../assets/softwindows-95-desktop.jpg';

let cursors;
let difficulty = 'easy';

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

    // Creates a new TextButon that updates difficulty to 'easy' when clicked
    this.easyButton = new TextButton(this, 380, 150, 'easy', { fill: '#0f0'}, () => updateDifficulty('easy'))
    this.add.existing(this.easyButton);

    // Creates a new TextButon that updates difficulty to 'hard' when clicked
    this.hardButton = new TextButton(this, 580, 150, 'hard', { fill: '#0f0'}, () => updateDifficulty('hard'))
    this.add.existing(this.hardButton);
    
    // Updates the variable difficulty and the text of the chosen difficulty
    const updateDifficulty = (diff) => {
      difficulty = diff;
      this.diffText.text = "Difficulty Selected: " + difficulty;
    }

    // Text that shows the difficulty user selected
    this.diffText = this.add.text(380, 100, "Difficulty Selected: " + difficulty);

    // TITLE
    this.add.text(300, 200, "FLOPPY").setFontSize(108);

    // Instructions on how to play game
    this.add.text(300, 330, "Press space to start.");
    this.add.text(300, 350, "Press space or click your mouse to stay afloat.");
    this.add.text(300, 370, "Find a computer and load a game.");
    this.add.text(300, 390, "Don't forget to dodge the mice (mouses?).");
  },
  update: function () {

    // Starts game and passes in the difficulty to the floppy scene
    if (cursors.space.isDown) {
      this.scene.start('floppy', {diff: difficulty});
    }
  }
})