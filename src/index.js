import Phaser from "phaser";
import MainMenu from './scenes/MainMenu';
import Game from './scenes/Game';
import Death from './scenes/Death';

const config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 650,
  physics: {
    defaul: "arcade",
    arcase: {
      gravity: { y: 0, x: 0 },
    },
  },
  scene: [MainMenu, Game, Death]
};

const game = new Phaser.Game(config);
