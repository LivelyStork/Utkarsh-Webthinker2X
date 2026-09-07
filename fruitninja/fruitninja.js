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
}

// spawnFruit function
function spawnFruit () {V
    let fruitData = random (fruitTypes); // pick one at random
    let random = random(300, 500); // random X to spawn. Rem that canvas width is 800
    let fruit = new fruitGroup.Sprite(randomX, height+20, 40); // spawn at bottom
    fruit.image = fruitData.whole; // load the image for whole
    fruit.type = fruitData; // store reference to its type i.e. peach or watermelon
    fruit.vel.y = random(-10, -14); // shoot upward at random velocity. Adjust to try!
    fruit. vel.x = random(-2, 2); // sideways curve. Adjust to try!
    fruit.friction = 0; // no friction
}