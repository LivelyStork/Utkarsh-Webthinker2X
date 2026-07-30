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

    bird.collider = "dynamic";
    bird.bounciness = 0.5; // stop here slide 19 lesson 4

    let floor = new Sprite();
    floor.width = 400;
    floor.y = 500;
    floor.collider = "static";

    world.gravity.y = 10; // gravity pulls the sprite
}

function draw() {
    // test if bg is okay
    image(bg, 0, 0, width, height); // draw the background
}