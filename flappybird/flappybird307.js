// the final game
let bird, floor;
let flapMidImg, bg, base;
let flapUpImg, flapDownImg;
let pipeGroup;
let pipe;
let bottomPipe, topPipe;
let gameoverImg; // declare variable for image 
let gameoverLabel; // declare variable for game over sprite
let startScreenLabel; // declare variable for start screen 
let startScreenImg; // declare variable for image
let startGame = false;
let score = 0;
let scoreDigits;
let numberImages = [];


function preload() {
    // bird image, background, and the floor
    flapMidImg = loadImage('assets/yellowbird-midflap.png');
    bg = loadImage('assets/background-day.png');
    base = loadImage('assets/base.png');
    flapUpImg = loadImage('assets/yellowbird-upflap.png');
    flapDownImg = loadImage('assets/yellowbird-downflap.png');
    pipe = loadImage('assets/pipe-green.png');
    gameoverImg = loadImage(' assets/gameover.png'); // preload the image
    startScreenImg = loadImage(' assets/message.png'); // preload the image
    for(let i=0; i<10; i++){
        numberImages[i] = loadImage('assets/'+i+'.png');
    }
}

function setup() {
    new Canvas(400, 600);
    background("white");

    bird = new Sprite();
    bird.x = width /2;
    bird.y = 230;
    bird.width = 30;
    bird.height = 30;
    bird.img = flapMidImg;
    bird.drag = 0.02
    bird.mass = 2

    bird.collider = "static";
    bird.bounciness = 0.5; // stop here slide 19 lesson 4

    floor = new Sprite();
    floor.x = 200;
    floor.y = height - 20;
    floor.width = 400;
    floor.height = 125;
    floor.collider = "static";
    floor.img = base;

    world.gravity.y = 10; // gravity pulls the sprite
    pipeGroup = new Group();
    startScreenLabel = new Sprite(width/2, height/2, 50, 50, 'none');
    startScreenLabel.img = startScreenImg;
    scoreDigits = new Group();
    scoreDigits.collider = 'none';
    scoreDigits.layer = 1000;
}

function draw() {
    // test if bg is okay
    image(bg, 0, 0, width, height); // draw the background
    if (kb.presses('space') || mouse.presses()){
        startGame = true;
        startScreenLabel.visible = false;
        bird.collider = "dynamic";
    }
    if (startGame){
        fill("blue");
        textSize(14);
        text("bird.sleeping: " + bird.sleeping ,20,40)
        text("bird.vel.y" + round(bird.vel.y), 20, 60);
        text("frameCount = " + frameCount, 20,80)
        // Floor to bounce bird
        if(kb.presses("space")){
            bird.vel.y = -4;
            bird.sleeping = false;
        }
    // if ( mouse.presses() ) {
    //     let s = new Sprite(mouseX, mouseY, 35);
    //     s.collider = "dynamic";
    // }
    if (bird.vel.y < -1) {
        // heading up
        bird.img = flapUpImg;
        bird.rotation = -30;
    }
    else if (bird.vel.y > 1) {
        // heading down
        bird.img = flapDownImg;
        bird.rotation = 30;
    }
    else {
        bird.img = flapMidImg;
        bird.rotation = 0;
    }
    if (frameCount === 1) {
        spawnPipePair();
    }
    bird.x += 3
    camera.x = bird.x
    floor.x = bird.x
    if (frameCount % 90 === 0){
        spawnPipePair(); // spawn pipes every 1.5 seconds
        // remove off screen pipes
    }
    for (let pipe of pipeGroup){
        if (pipe.x < -50){ 
            pipe.remove();
        }
    }
    if (bird.collides(pipeGroup) || bird.collides(floor)){
        gameoverLabel = new Sprite (width/2, height/2, 192, 42);
        gameoverLabel.img = gameoverImg;
        gameoverLabel.layer = 100; // make the game over text come to front
        gameoverLabel.x = camera.x;
        noLoop();
    }
    // increase score if pipe passed
    for (let pipe of pipeGroup) {
    // center pos + half pipe width = right edge pos
    let pipeRightEdge = pipe.x + pipe.w / 2;
    // center pos - half bird width = left edge pos
    let birdLeftEdge = bird.x - bird.w / 2;
    // compare x-coordinates of player and pipes if (pipe.passed == false && pipeRightEdge ‹ birdLeftEdge){
    pipe.passed = true;
    score++;
    }
}
drawscore(width/2, 20, score, 24, 36)
// call function to keep score centered on camera 
moveGroup(scoreDigits, camera.x, 24);
}
function spawnPipePair() {
    let gap = random(35,60)
    let midY = random(350, height - 350)
    topPipe = new Sprite(bird.x + 400, midY - gap / 2 - 200, 52, 320, 'static');
    bottomPipe = new Sprite(bird.x + 400, midY + gap / 2 + 200, 52, 320, 'static');
    pipeGroup.add(bottomPipe);
    // pipeGroup.layer = 0;
    pipeGroup.add(topPipe);
    pipeGroup.layer = 0;
    bottomPipe.img = pipe;
    topPipe.img = pipe;
    topPipe.rotation = 180
}


function drawscore(x, y, score, digitWidth, digitHeight) {
    // Clear old digit sprites
    scoreDigits. removeAll ();
    // make it a string so we can get each digit individually rather than a value
    let scoreStr = str(score);
    // total width taken up by all digits
    let totalWidth = scoreStr.length * digitWidth;
    // starting x coordinates
    let startX = x - totalWidth / 2;
    // loop through each digit
    for (let i = 0; i<scoreStr.length; i++) {
        // gets number digit from the score string (e.g. "4" or "2")
        let digit = int(scoreStr[i]);
        // x-position of this digit, next character will move to right..
        let xPos = startX + i * digitWidth;
        // create a sprite the size of the digit image
        let digitSprite = new scoreDigits.Sprite(xPos, y, digitWidth, digitHeight);
        //get the digit image from the array based on placement order which corresponds to the digit
        digitSprite.img = numberImages[digit];
    }
}

function moveGroup (group, targetX, spacing) {
    // E.g. 3 digits → 2 gaps → (3 - 1) * 24 = 48px
    let totalwidth = (group.length -1) * spacing;
    // Find Left-most X Position
    // Shifts the starting point left, so the entire group becomes centered
    let startX = (target - totalwidth/2);
    // Place Each Sprite in the Group 
    for (let i = 0; i < group.length; i++) {
        group[i].x = startX + i * spacing;
    }
}