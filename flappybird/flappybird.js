// the final game
let bird, floor;
let flapMidImg, bg, base;
let flapUpImg, flapDownImg
let pipeGroup
let pipe;
let bottomPipe, topPipe;

function preload() {
    // bird image, background, and the floor
    flapMidImg = loadImage('assets/yellowbird-midflap.png');
    bg = loadImage('assets/background-day.png');
    base = loadImage('assets/base.png');
    flapUpImg = loadImage('assets/yellowbird-upflap.png');
    flapDownImg = loadImage('assets/yellowbird-downflap.png');
    pipe = loadImage('assets/pipe-green.png');
}

function setup() {
    new Canvas(400, 600);
    background("white");

    bird = new Sprite();
    bird.x = width /2;
    bird.y = 200;
    bird.width = 30;
    bird.height = 30;
    bird.img = flapMidImg;
    bird.drag = 0.02
    bird.mass = 2

    bird.collider = "dynamic";
    bird.bounciness = 0.5; // stop here slide 19 lesson 4

    floor = new Sprite();
    floor.x = 200;
    floor.y = height - 20;
    floor.width = 400;
    floor.height = 125;
    floor.collider = "static";
    floor.img = base;

    world.gravity.y = 10; // gravity pulls the sprite
    let pipeGroup = new Group();
}

function draw() {
    // test if bg is okay
    image(bg, 0, 0, width, height); // draw the background
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
    if ( mouse.presses() ) {
        let s = new Sprite(mouseX, mouseY, 35);
        s.collider = "dynamic";
    }
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
}
function spawnPipePair() {
        let gap = 50
        let midY = height/2;
        let someY = midY + gap/2 + 200;
        bottomPipe = new Sprite(400, someY, 52, 320, 'static');
        bottomPipe.img = pipe;
        pipeGroup(bottomPipe);
        pipeGroup.layer = 0;
        topPipe = new Sprite(400, height - someY, 52, 320, 'static');
        topPipe.img = pipe;
        topPipe.rotation = 180
        pipeGroup.add(topPipe);
        pipeGroup.layer = 0;
    }