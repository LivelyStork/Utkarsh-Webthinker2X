let dojoBG; // image for the background
let fruitTypes = []; // store fruit image objects
let fruitGroup; // Group for whole fruits
let fruitHalves; // Group for fruit halves
let score = 0
let missedFruits = 0

function preload(){
    dojoBG =loadImage('assets/dojobackground.png');
    // declare the peach object
    let peach = {
        whole: loadImage('assets/peachwhole.png'),
        half1: loadImage('assets/peachhalf.png'),
        half2: loadImage('assets/peachhalf.png'),
    };
    // declare the watermelon object
    let watermelon = {
        whole: loadImage(' assets/watermelonwhole.png'),
        half1: loadImage('assets/watermelonhalf.png'),
        half2: loadImage('assets/watermelonhalf.png'),
    }

    // store the fruit objects into an array
    fruitTypes = [peach, watermelon];
    fruitGroup = new Group(); // new group for fruits
}


function setup (){
    new Canvas (800, 600);
    world.gravity.y = 10; // set gravity for the world
    fruitHalves = new Group(); // group for fruit halves
}
function draw(){
    clear(); // optional to clear before applying an image
    image (dojoBG, 0, 0, width, height);
    // call spawnFruit function
    if (frameCount % 120 === 0){
        spawnFruit();
    }
    if (mouse.pressing ()){
        trail = new Sprite(mouse.x, mouse.y, 7);
        trail.collider = 'none';
        trail.color = "red";
        trail.life = 10;
        sliceFruit();
    }
    for (let fruit of fruitGroup) {
        if (fruit.y > height + 50) {
            fruit.remove();
            missedFruits += 1;
        }
    }
    // Display: Score, Missed, Timer
    stroke (158, 69, 69); // rgb colour fill (255); textSize (24);
    fill(255)
    textSize(24)
    textAlign (LEFT, TOP);
    text('Score: ' + score, 10, 10);
    text ('Missed: ' + missedFruits, 200, 10);
}

// spawnFruit function
function spawnFruit () {
    let fruitData = random(fruitTypes); // pick one at random
    let randomX = random(300, 500); // random X to spawn. Rem that canvas width is 800

    //let fruit = new fruitGroup.Sprite(randomX, height+20, 40); // spawn at bottom
    
    let fruit = new fruitGroup.Sprite(randomX, height + 20, 40);

    fruit.image = fruitData.whole; // load the image for whole
    fruit.type = fruitData; // store reference to its type i.e. peach or watermelon
    fruit.vel.y = random(-10, -14); // shoot upward at random velocity. Adjust to try!
    fruit.vel.x = random(-2, 2); // sideways curve. Adjust to try!
    fruit.friction = 0; // no friction
}

// Split a fruit into two halves and animate them
function splitFruit (x, y, fruitData) {
    // Create left half
    let left = new fruitHalves.Sprite(x - 10, y, 40, 40);
    left.img = fruitData.half1;
    left.vel.x = -3; // veer left
    left.vel.y = random(-5, -2);
    left.rotationSpeed = -5;
    left.life = 360; // remove after 30 frames
    
    // Create right half
    let right = new fruitHalves.Sprite(x + 10, y, 40, 40);
    right.img = fruitData.half2;
    right.vel.x = 3; // veer right
    right.vel.y = random(-5, -2);
    right.rotationSpeed = 5;
    right.life = 360; // remove after 30 frames  
}

// Check if any fruit is sliced by the mouse
function sliceFruit() {
    for (let fruit of fruitGroup) {
        if (fruit.sliced){
            continue; // skip already sliced fruits
        }
    
        // calculate distance between mouse and fruit
        let d = dist(mouse.x, mouse.y, fruit.x, fruit.y);
        if (d < ((fruit.d / 2) + 5)) {
            fruit.sliced = true; // prevent repeat slicing
            const fx = fruit.x; // x coordinate for the sliced fruit
            const fy = fruit.y; // y coordinate for the sliced fruit
            fruit.remove(); // remove whole fruit
            splitFruit(fx, fy, fruit.type); // spawn halves
            score += 1
            break; // only slice one fruit per frame
        }
    }
}
