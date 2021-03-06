import Phaser from "phaser";
import MainMenu from './scenes/MainMenu';
import Floppy from './scenes/Floppy';
import Game from './scenes/Game';
import Death from './scenes/Death';
import PicnicMenu from "./scenes/PicnicMenu";

const config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 650,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
  scene: [MainMenu, Floppy, PicnicMenu, Game, Death],
  audio: {
    disableWebAudio: true
  }
};

const game = new Phaser.Game(config);
