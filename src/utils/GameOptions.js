const easyFloppyGameOptions = {
  // floppy gravity, will make floppy fall 
  floppyGravity: 600,

  // floppy thrust
  floppyThrustPower: 350,

  // floppy speed
  floppySpeed: 160,

  // minimum mouse height, in pixels, Affects opening position
  minMouseHeight: 170,

  // distance range from next mouse, in pixels
  mouseDistance: [190, 270],

  // opening range between mice, in pixels
  mouseHole: [160, 245],

  // the maximum number of mice allowed on screen
  maxNumberOfMice: 4,

  // the amount each mouse passing will increase score
  scoreToIncrease: 5,

  // the score needed for a monitor to show
  scoreToShowMonitor: 15
};

const hardFloppyGameOptions = {
  // floppy gravity, will make floppy fall 
  floppyGravity: 600,

  // floppy thrust
  floppyThrustPower: 350,

  // floppy speed
  floppySpeed: 275,

  // minimum mouse height, in pixels, Affects opening position
  minMouseHeight: 150,

  // distance range from next mouse, in pixels
  mouseDistance: [180, 250],

  // opening range between mice, in pixels
  mouseHole: [125, 200],

  // the maximum number of mice allowed on screen
  maxNumberOfMice: 4,

  // the amount each mouse passing will increase score
  scoreToIncrease: 10,

  // the score needed for a monitor to show
  scoreToShowMonitor: 40
};

export default { easyFloppyGameOptions, hardFloppyGameOptions };
