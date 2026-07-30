// the final game
let bird, floor;
let flapMidImg, bg, base;

function preload() {
    // bird image, background, and the floor
    flapMidImg = loadImage('assets/yellowbird-midflap.png');
    bg = loadImage('assets/background-day.png');
    base = loadImage('assets/base.png');
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
}

function draw() {
    // test if bg is okay
    image(bg, 0, 0, width, height); // draw the background
    // Floor to bounce bird
    if(kb.presses("space")){
        bird.vel.y = -4;
        bird.sleeping = false;

    if ( mouse.presses() ) {
        let s = new Sprite(mouseX, mousey, 35);
        s.collider = "dynamic";
    }
    }
}