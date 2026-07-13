// let ball;
// let box;

// function setup() {
//   // Set up the canvas
//   new Canvas(800, 400);
//   background(250); //background color

//   // Basic shape testing
//   // write your codes here
 
//   // End Basic shape testing

//    // Create a bouncing ball sprite
//    // write your codes here
//   //  fill("skyblue")
//   //  stroke("pink")
//   //  strokeWeight(10)
//   //  ellipse(50,50,100,100)
//   //  rect(100,100,100,200)
//   ball = new Sprite();
//   ball.x = 100;
//   ball.y = 200
//   ball.diameter = 40
//   ball.color = 'blue';

//   ball.vel.x = 30;
//   ball.vel.y = 30;
//   ball.bounciness = 1;
//   ball.collider = "dynamic";

//   box = new Sprite();
//   box.x = 100;
//   box.y = 100;
//   box.w = 50;
//   box.h = 50;
//   box.color = "green";
// }

// function draw() {
//   // write your codes here
//   background(250)
//   fill(0);
//   textSize(16);
//   text("Ball: (" + int(ball.x) + ", " + int(ball.y) + ")", 10, 20);
//   text ("Mouse: (" + mouseX + ", " + mouseY + ")", 10, 40);
//   if (ball.x < 0 + ball.diameter / 2 || ball.x > width - ball.diameter / 2) {
//   ball.vel.x *= -1;
//   }
//   if (ball.y < 0 + ball.diameter / 2 || ball.y > height - ball.diameter / 2) {
//   ball.vel.y *= -1;
//   }
//   box.x = mouseX;
//   box.y = mouseY;
// }