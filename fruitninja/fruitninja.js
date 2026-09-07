let dojoBG; // image for the background
let fruitTypes = []; // store fruit image objects

function preload(){
    dojoBG =loadImage('assets/dojobackground.png');
    // declare the peach object
    let peach = {
        whole: loadImage('assets/peachwhole.png')
    };
    // declare the watermelon object
    let watermelon = {
        whole: loadImage(' assets/watermelonwhole.png')
    }

    // store the fruit objects into an array
    fruitTypes = [peach, watermelon];
}


function setup (){
    new Canvas (800, 600);
    world.gravity.y = 10; // set gravity for the world
}
function draw(){
    clear(); // optional to clear before applying an image
    image (dojoBG, 0, 0, width, height);
    // call spawnFruit function
if (frameCount % 120 === 0){    
spawnFruit ();
}