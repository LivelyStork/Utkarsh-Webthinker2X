function setup () {
    createCanvas (600,600)
    world.gravity.y = 10;
}
function preload(){
    //assets
}
function draw() {
//animations 
//physics
    if(mouse.presses ()){
        let cube = new Sprite(mouseX, mouseY, 50,50)
    }
}