// write your codes here
let bird, floor; // Declaring variables for objects 
let flapMidImg, bg, base; // Declaring variables for images

function preload() {
    // bird image, background and the floor
    flapMidImg = loadImage('assets/yellowbird-midflap.png');
    bg = loadImage('assets/background-day-png');
    base = loadImage('assets/base.png');
}

function setup () {
    new Canvas (400, 600);
    // Bird Sprite
    bird = new Sprite();
    bird.x = width / 2;
    bird.y = 200,
    bird.width = 30;
    bird.height = 30;
    bird.img = flapMidImg; // defined earlier in preload()
    // bird = new Sprite(width / 2, 200, 30, 30, 'dynamic');
    bird.collider = "dynamic";
}
function draw() {
    image(bg, 0, 0, width, height); // Draw the background
}