let dojoBG; // image for the background

let fruitGroup; // Group for whole fruits
let fruitHalves; // Group for fruit halves
let fruitTypes = []; // store fruit image objects
let score = 0; // player's score
let missedFruits = 0; // count of uncut fruits that fall

let gameState = 'start'; // 'start', 'play', 'gameover' - controls game screen
let gameStartTime = 0; // ms when play starts
let gameTimer = 0; // seconds elapsed
let gameDuration = 60; // length of one game

let sliceSound; // sound when fruit is sliced
let backgroundTrack; // background music

let difficultyNumFruits = 1; // number of fruits to spawn per interval
let lastDifficultyIncrease = 0; // last time difficulty increased

///---PLUS VARIABLES---///
let MAX_LIVES = 3;
let lives = MAX_LIVES;

let bomb;
let bombImg;
let bombGroup;

let bombExplosionImg;
let bombExplosionSound;

function preload(){
  dojoBG =loadImage('assets/dojobackground.png');

  // declare the peach object
  let peach = {
    whole: loadImage('assets/peachwhole.png'),
    half1: loadImage('assets/peachhalf.png'),
    splash: loadImage('assets/peachsplash.png')
  };

  // declare the watermelon object
  let watermelon = {
    whole: loadImage('assets/watermelonwhole.png'),
    half1: loadImage('assets/watermelonhalf.png'),
    splash: loadImage('assets/watermelonsplash.png')
  }

  let timeFruit

  // store the fruit objects into an array
  fruitTypes = [peach, watermelon];

  // sound effects
  sliceSound = loadSound('assets/fruit-ninja-combo.mp3');
  backgroundTrack = loadSound('assets/fruit-ninja-bgtrack.mp3');
  

  //----PLUS ASSETS---//
  bombImg = loadImage('assets/fruitninja_bomb.png');
  bombExplosionImg = loadImage('assets/fruitninja_bombExplosion.png');
  bombExplosionSound = loadSound('assets/fruitninja_explosion.mp3');
  
}

function setup(){
  new Canvas(800,600);
  world.gravity.y = 10;

  fruitGroup = new Group(); // new group for fruits
  fruitHalves = new Group(); // group for fruit halves

  //----PLUS---//
  bombGroup = new Group();

  //---Set volume. This is just to adjust the volume to sound better---//
  backgroundTrack.setVolume(0.4);
  
  bombExplosionSound.setVolume(1.7);
}

function draw(){
  clear(); // optional to clear before applying an image.
  image(dojoBG, 0, 0, width, height);

  // Start background music if not playing
  if (!backgroundTrack.isPlaying()) {
    
    backgroundTrack.loop();
  }

  // Place this at the start of your draw() function
  if ((kb.presses(' ') || mouse.presses()) && (gameState === 'start' || gameState === 'gameover')) {
    gameState = 'play';
    score = 0;
    missedFruits = 0;
    fruitGroup.removeAll();
    fruitHalves.removeAll();
    gameStartTime = millis(); // capture time started
    gameTimer = 0;  // timer counter
    difficultyNumFruits = 1; // start with 1 fruit

    //reset lives
    lives = MAX_LIVES;
  }

  // Start screen
  if (gameState === 'start') {
    fill(0, 180);
    rect(0, 0, width, height);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(48);
    text('Fruit Ninja', width / 2, height / 2 - 40);
    textSize(24);
    text('Press SPACE or Click to Start', width / 2, height / 2 + 20);
    backgroundTrack.stop();
    return; // do not process rest of this function
  }

    // Game over screen
  if (gameState === 'gameover') {
    fill(0, 180);
    rect(0, 0, width, height);
    fill(255,0,0);
    textAlign(CENTER, CENTER);
    textSize(48);
    text('Game Over!', width / 2, height / 2 - 60);
    textSize(24);
    fill(255);
    text('Score: ' + score, width / 2, height / 2);
    text('Missed Fruits: ' + missedFruits, width / 2, height / 2 + 40);
    text('Press SPACE or Click to Restart', width / 2, height / 2 + 80);
    backgroundTrack.stop();

    fruitGroup.removeAll();

    return;
  }

  // Fruit spawn logic: spawn fruits at interval, increase difficulty
  if (frameCount % 120 === 0) {
    for (let i = 0; i < difficultyNumFruits; i++){
      spawnFruit();
    }
  }



  // Increase difficulty every 15 seconds
  if (gameTimer - lastDifficultyIncrease >= 15){
    difficultyNumFruits += 1;
    lastDifficultyIncrease = gameTimer;
  }

    // Handle slicing when mouse is pressed
  if (mouse.pressing()){
    trail = new Sprite(mouse.x, mouse.y, 7);
    trail.collider = 'none';
    trail.color = "red";
    trail.life = 10;
    sliceFruit();
    sliceBomb();
  }

    // Remove fruits that fall below the screen, count as missed
  for (let fruit of fruitGroup) {
    if (fruit.y > height + 50) {
      fruit.remove();
      missedFruits += 1;

      //reduce lives
      //lives -= 1; //commented out, bombs will decrease lives instead.
    }
  }

  // Timer logic: update game timer, end after 60s
  gameTimer = floor((millis() - gameStartTime) / 1000);
  if (gameTimer >= gameDuration) {
    gameState = 'gameover';

    backgroundTrack.stop();
    return;
  }

  // Display: Score, Missed, Timer
  stroke(158, 69, 69); // rgb colour
  fill(255);
  textSize(24);
  textAlign(LEFT, TOP);
  text('Score: ' + score, 10, 10);
  text('Missed: ' + missedFruits, 200, 10);
  text('Time: ' + (gameDuration - gameTimer), 400, 10);

  ///---PLUS LOGIC---///
  //Display lives:
  fill("Green");
  text('Lives: ' + lives, 600, 10);
  
  //Gameover state when lives === 0
  if(lives === 0){
    gameState = "gameover" //change state to gameover, this will display the gameover screen
    backgroundTrack.stop();
    return;
  }

  //spawn bombs every 140 frames. (This can be adjusted accordingly)
  if (frameCount % 140 === 0) {
    spawnBomb();
  }
}

function spawnFruit(){
  let fruitData = random(fruitTypes); // pick one at random
  let randomX = random(300, 500); // random X to spawn
  let fruit = new fruitGroup.Sprite(randomX, height+20, 40); // spawn at bottom
  fruit.image = fruitData.whole;
  fruit.type = fruitData; // store reference to its type
  fruit.vel.y = random(-10, -14); // shoot upward at random velocity
  fruit.vel.x = random(-2, 2); // sideways curve
  fruit.friction = 0; // no friction
}


// Check if any fruit is sliced by the mouse
function sliceFruit() {
  // if (!mouse.pressing()) return;
  for (let fruit of fruitGroup) {
    if (fruit.sliced){
      continue; // skip already sliced fruits
    } 

    // calculate distance between mouse and fruit
    let d = dist(mouse.x, mouse.y, fruit.x, fruit.y); 

    if (d < ((fruit.d / 2) + 5)) {
      fruit.sliced = true; // prevent repeat slicing

      const fx = fruit.x;
      const fy = fruit.y;

      fruit.remove(); // remove whole fruit
      sliceSound.play();

      splitFruit(fx, fy, fruit.type); // spawn halves
      
      //---Splash---//
      let splash = new Sprite(fx, fy, 40);
      splash.img = fruit.type.splash;
      splash.collider = "kinematic"
      splash.life = 10;

      score += 1 // increase score by 1
      
      break; // only slice one fruit per frame
    }
  }
}

// Split a fruit into two halves and animate them
function splitFruit(x, y, fruitData) {
  // Create left half
  let left = new fruitHalves.Sprite(x - 10, y, 40, 40);
  left.img = fruitData.half1;
  left.vel.x = -3; // veer left
  left.vel.y = random(-5, -2);
  left.rotationSpeed = -5;
  left.life = 30; // remove after 30 frames

  // Create right half
  let right = new fruitHalves.Sprite(x + 10, y, 40, 40);
  right.img = fruitData.half1;
  right.vel.x = 3; // veer right
  right.vel.y = random(-5, -2);
  right.rotationSpeed = 5;
  right.life = 30; // remove after 30 frames
}

//---PLUS FUNCTIONS---//

//Spawn Bomb//
function spawnBomb(){

  let randomX = random(300, 500); // random X to spawn
  bomb = new bombGroup.Sprite(randomX, height+20, 40); // spawn at bottom

  bomb.image = bombImg;

  bomb.vel.y = random(-10, -14); // shoot upward at random velocity
  bomb.vel.x = random(-2, 2); // sideways curve
  bomb.friction = 0; // no friction
}

//Check if bomb is close enough to mouse to be sliced//
function sliceBomb() {
  // if (!mouse.pressing()) return;
  for (let bomb of bombGroup) {

    // calculate distance between mouse and fruit
    let d = dist(mouse.x, mouse.y, bomb.x, bomb.y); 

    if (d < ((bomb.d / 2) + 5)) {
      bomb.sliced = true; // prevent repeat slicing

      const bx = bomb.x;
      const by = bomb.y;

      bomb.remove(); // remove bomb

      bombExplosionSound.play(); //replace with explosion sound.

      //---Explosion---//
      //show explosion sprite for a short while when the bomb is sliced.
      let explosion = new Sprite(bx, by, 60);
      explosion.img = bombExplosionImg;
      explosion.collider = "kinematic"
      explosion.life = 10;
      
      lives -= 1; //lose a life.
      
      break; // only slice one fruit per frame
    }
  }
}