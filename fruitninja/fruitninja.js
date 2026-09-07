let dojoBG; // image for the background

function preload(){
    dojoBG =loadImage('assets/dojobackground.png');
}

function setup (){
    new Canvas (800, 600);
    world.gravity.y = 10; // set gravity for the world
}
function draw(){
    clear(); // optional to clear before applying an image. image (dojoBG, 0, 0, width, height);
}