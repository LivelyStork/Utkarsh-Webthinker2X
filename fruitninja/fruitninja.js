let dojoBG; // image for the background
let fruitTypes = []; // store fruit image objects
let fruitGroup; // Group for whole fruits

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
    fruitGroup = new Group(); // new group for fruits
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
        spawnFruit();
    }
    if (mouse.pressing ()){
        trail = new Sprite(mouse.x, mouse.y, 7);
        trail.collider = 'none';
        trail.color = "red";
        trail.life = 10;
    }
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

