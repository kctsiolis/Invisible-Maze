let player = {};
let gp;
let scale;

let levels = [
  [ // 1
    "#####",
    "#s.g#",
    "#####"
  ],
  [ // 2
    "###",
    "#g#",
    "#.#",
    "#.#",
    "#.#",
    "#s#",
    "###"
  ],
  [ // 3
    "#######",
    "#....s#",
    "#.#####",
    "#g#####",
    "#######",
  ],
  [ // 4
    "####",
    "#.s#",
    "#.##",
    "#.##",
    "#.##",
    "#g##",
    "####"
  ],
  [ // 5
    "#######",
    "#.....#",
    "#.###.#",
    "#s###g#",
    "#######",
  ],
  [ // 6
    "#######",
    "#g.#.s#",
    "##...##",
    "###..##",
    "#######",
  ]
]

let levelNumber = 0;
let currentLevel;

function init() {
  window.addEventListener("gamepadconnected", function(e) {
  console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
    e.gamepad.index, e.gamepad.id,
    e.gamepad.buttons.length, e.gamepad.axes.length);
  });
}

function getFirstGamepad() {
  let gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
  if (!gamepads[0]) {
    return false;
  }
  return gamepads[0];
}

function vibrate(dur,mag=1.0) {
    gp.vibrationActuator.playEffect("dual-rumble", {
      startDelay: 0,
      duration: dur,
      weakMagnitude: mag,
      strongMagnitude: mag
    });
}

function parseLevel(repr){
  let levelMap = repr.map(s => Array.from(s).map(c => c == "#"));
  let start;
  let goal;
  
  for (i = 0; i < repr.length; i++) {
    for (j = 0; j < repr[i].length; j++) {
      if (repr[i].charAt(j) == "s") {
        start = [i,j];
      }
    }
  }

  for (i = 0; i < repr.length; i++) {
    let chars = Array.from(repr[i]);
    for (j = 0; j < chars.length; j++) {
      if (chars[j] == "g") {
        goal = [i,j];
      }
    }
  }
  let height = repr.length;
  let width = repr[0].length;

  return {levelMap, start, goal, width, height};
}

function buttonPressed(b) {
  if (typeof(b) == "object") {
    return b.pressed;
  }
  return b == 1.0;
}

function listenMove() {
    let newX = player.x;
    let newY = player.y;

    if (buttonPressed(gp.buttons[12])) {
      newY = player.y - player.speed;
    }
    else if (buttonPressed(gp.buttons[13])) {
      newY = player.y + player.speed;
    }
    else if (buttonPressed(gp.buttons[14])) {
      newX = player.x - player.speed;
    }
    else if (buttonPressed(gp.buttons[15])) {
      newX = player.x + player.speed;
    }
    else {
      newX = player.x + player.speed * gp.axes[2];
      newY = player.y + player.speed * gp.axes[3];
    }

    if (newY > player.y) {
      rect(0, height-20, width, 20);
    }
    if (newY < player.y) {
      rect(0, 0, width, 20);
    }
    if (newX < player.x ) {
      rect(0, 0, 20, height);
    }
    if (newX > player.x ) {
      rect(width-20, 0, 20, height);
    } 
    
    return {newX, newY}
}

function updateState(newX,newY) {
    if (currentLevel.levelMap[Math.floor(newY)][Math.floor(newX)]) {
      vibrate(30);
      fill("red");
      circle(width/2, height/2, 2 * player.r);  
    }
    else if (Math.floor(newY) == currentLevel.start[0] && Math.floor(newX) == currentLevel.start[1]) {
      vibrate(30,mag=0.01);
      fill("blue");
      circle(width/2, height/2, 2 * player.r);
      player.x = newX;
      player.y = newY;
    }
    else if (Math.floor(newY) == currentLevel.goal[0] && Math.floor(newX) == currentLevel.goal[1]){
      fill(50,255,50);
      circle(width/2, height/2, 2 * player.r);
      noLoop();
      
      if (levelNumber < levels.length - 1) {
        levelPass(50,5);
        levelNumber += 1;
        reset();
      }
      else {
        levelPass(20,20);
        noLoop();
      }
    }
    else {
      fill("black");
      circle(width/2, height/2, 2 * player.r);
      player.x = newX;
      player.y = newY;
    }
}

function levelPass(duration,numPulses) {
  for (let i = 0; i < numPulses; i++) {
    setTimeout(() => vibrate(duration),(duration + 100)*i)
  }

  setTimeout(() => loop(), (duration+100)*numPulses);
}

function reset(num=1) {
  if (num == 0) {
    levelNumber = 0
  }
  currentLevel = parseLevel(levels[levelNumber]);
  
  player.x = currentLevel.start[1] + 0.5;
  player.y = currentLevel.start[0] + 0.5;
  player.r = 10;
  player.speed = 0.075;
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  fill(0);

  scale = 50;
  reset();
}

function draw() {
  background(220);

  /*fill("blue");
  stroke("blue");
  drawSquare(currentLevel.start[1],currentLevel.start[0]);
  fill("green");
  stroke("green");
  drawSquare(currentLevel.goal[1],currentLevel.goal[0]);
  fill("black");
  stroke("black");*/

  /*for (let i = 0; i < currentLevel.width; i++) {
    for (let j = 0; j < currentLevel.height; j++) {
      if (currentLevel.levelMap[j][i]) {
        drawSquare(i,j);
      }
    }
  }*/

  if (random() < 0.1) {
    console.log(player.x, player.y);
  }

  circle(width/2, height/2, 2 * player.r);

  gp = getFirstGamepad();
  if (gp) {

    if (buttonPressed(gp.buttons[16])) {
      reset(0);
    }

    if (buttonPressed(gp.buttons[1])) {
      reset();
    }

    newPos = listenMove();

    updateState(newPos.newX,newPos.newY);

  }
}

function drawSquare(i,j) {
  square(width / 2 + (i - player.x) * scale, height / 2 + (j - player.y) * scale, scale);
}

init();