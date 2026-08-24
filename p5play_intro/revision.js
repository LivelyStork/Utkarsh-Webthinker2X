function setup () {
    createCanvas (600,600)
    world.gravity.y = 10;
    let floor1 = new Sprite(width/2, height, 600, 40)
    floor1.collider = 'static'
    let floor2 = new Sprite(0, 300, 40, 600)
    floor2.collider = 'static'
    let floor3 = new Sprite(600, 300, 40, 600)
    floor3.collider = 'static'
    let floor4 = new Sprite(300, 0, 600, 40)
    floor4.collider = 'static'
}
function preload(){
    //assets
}
function draw() {
//animations 
//physics
background(220)
    if(mouse.presses ()){
        let cube = new Sprite(mouseX, mouseY, 50,50)
    }
}