// creates 2d arrays
var debug = false;
function create2DArray(width, height) {
  var x = new Array(width);
  for (var i = 0; i < width; i++) {
    x[i] = new Array(height);
  }
  return x;
}
// returns index of greates value in an array givin as input
function min_index(elements) {
  var i = 1;
  var mi = 0;
  while (i < elements.length) {
    if (!(elements[i] > elements[mi]))
      mi = i;
    i += 1;
  }
  return mi;
}
//displays the map and possition of player/orientation for debuging
function seeMap(scale) {
  for (var x = 0; x < bluP.length; x++) {
    for (var y = 0; y < bluP[x].length; y++) {
      if (bluP[x][y] == 0 || bluP[x][y] == 9) {
        if(bluP[x][y]== 0){
          fill(255)
        }else{
          fill(0)
        }
      } else {
        color = swatches[bluP[x][y]]
        fill(color[0], color[1], color[2]);
      }
      // * scale to it is inlarged
      rect(x * scale, y * scale, scale, scale);
    }
  }
  fill(0);
  //  stroke(0);
  // shows position of player
  ellipse(player.x * scale, player.y * scale, scale / 2, scale / 2)
  //line to show direction of player
  line(player.x * scale, player.y * scale, (player.x + player.headingX) * scale, (player.y + player.headingY) * scale)

}
//voxel blueprints of the world
// imposrts circle, will help in math
var CIRCLE = Math.PI * 2;
// declares array that will store voxel blueprints of the world
var bluP = 0;
// by how much to scale up the debugging map
var mapScale = 25;
// stores the swatch colored
var swatches = {
  1: [46,196,182],
  2: [231,29,54],
  3: [255,159,28],
  4: [188,237,9]
}
// accses value in blueprint arrar
function look(x, y) {
  //makes sure the index is an integer
  this.x = Math.floor(x);
  this.y = Math.floor(y);
  //makes sure the indexes are wihin bounds
  if (this.x > bluP.length - 1 || this.x < 0 || this.y < 0) {
    //will return -1 if it is out of bounds
    return -1;
  } else if (this.y > bluP[this.x].length - 1) {
    return -1;
  }
  // returns the value
  return bluP[this.x][this.y];
}

// input is a starting position, at x direction and y direction, and how many steps it should move befor despawning (iterations)
function ray(xpos, ypos, xhead, yhead, iterations) {
  // stores the original position for later use
  origX = xpos;
  origY = ypos;
  // creates the variable that will stor what it has hit
  var seen = 0;
  var xbefore = xpos;
  var ybefore = ypos;
  var distTraveled = 0
  // loops throgh the amount of iterations specified
  for (var i = 0; i < iterations; iterations++) {
    //looks at what the value of the current tile it is on is
    seen = look(xpos, ypos)
    distTraveled = distTraveled + dist(xbefore, ybefore, xpos, ypos)
    xbefore = xpos;
    ybefore = ypos;
    // if the tile is not 0 (in other words, empty), then..
    if (seen != 0 && seen != 9) {
      // it will store some data for output like,
      var centerPosX = Math.floor(xpos);
      var centerPosY = Math.floor(ypos);
      // print(dist(origX, origY, xpos, ypos), i, xhead, yhead)
      var info = {
        // what was the value of the tile it hit
        hitValue: seen,
        //hitValue: min_index([ abs(xpos-(centerPosX+1)), abs(xpos-(centerPosX-1)), abs(ypos-(centerPosY+1)), abs(ypos-(centerPosY-1))])+1,
        // and how far away it is from the rays starting position (thats why we made origX and origY)
        distance: distTraveled

      }
    
      // |||||| uncoment below for depugging ||||||
        stroke(0);
        strokeWeight(3);
        point(xpos * mapScale, ypos * mapScale);
        noStroke();
      // returns the info
      return info;
      // and stops the for loop (I am not sure if this is necessary)
      break;
      //but if it did not hit anything, then it continiues moving
    } else {
      if(seen == 9){
        xhead = -xhead
        yhead = -yhead
      }
      xpos += xhead;
      ypos += yhead;
    }
  }
}

// the player class (and also the ray casting)
class Player {
  constructor() {
    // stores it position
    this.x = 5;
    this.y = 5;
    // stores is orientation in terms of a vector
    this.headingX = 0;
    this.headingY = 1;
    // stores its orientation in terms of radians
    this.radians = 0;
    // stores its movment speed
    this.speed = 1 / 30;
  }
  // the rotate function
  rotate() {
    // converts the mouse x position into a radian...
    this.radians = ((mouseX / 100) + CIRCLE) % (CIRCLE);
    //which is then converted to a vector.
    this.headingX = cos(this.radians);
    this.headingY = sin(this.radians);
  }
  // detects collisions befor it happens (this is kind of weird but you will understand more in the move function)
  collide() {
    // gets the 2 possible values of the players futur positions
    var futurX = look(this.x + this.headingX * this.speed, this.y)
    var futurY = look(this.x, this.y + this.headingY * this.speed)
    // if its x values are not in a wall then it can move
    if (futurX <= 0 || futurX == 0) {
      this.x += this.headingX * this.speed;
    }
    // if its y values are not in a wall then it can move
    if (futurY <= 0 || futurY == 0) {
      this.y += this.headingY * this.speed;
    }
  }
  // same as collide() except that it checks in the opposit direction
  backCollide() {
    var futurX = look(this.x - this.headingX * this.speed, this.y)
    var futurY = look(this.x, this.y - this.headingY * this.speed)

    if (futurX <= 0 || futurX == 0) {
      this.x -= this.headingX * this.speed;
    }

    if (futurY <= 0 || futurY == 0) {
      this.y -= this.headingY * this.speed;
    }
  }
  // here I will explain the collide function, the collide function does not actually make the player stop, but it makes the player move. The move function calls the collide function when the right key is pressed and then the collide function desides if its actually going to make it move
  move() {
    // runs the rotation
    this.rotate();
    // you know what this does, I hope. (BTW this uses the WASD format except A nd D have not been implemented)
    if (keyIsPressed) {
      if (key == 'w') {
        this.collide()
      }
      if (key == 's') {
        this.backCollide()
      }

    }
  }
  // This is what sends the rays and stiches back an image from what they return
  //paramter 1: number of rays to send
  // how much spacing between each ray
  // by how much the ray increments its poition (the smaller the more accurate)
  // the number how many increments teh ray goes throught befor de-spawning

  rayCaster(numRays, raySpacing, rayAccuracy, rayIterations) {
    var distanceScalling = 300;
    var v = createVector(cos((this.radians + HALF_PI)), sin((this.radians + HALF_PI)));
    // v.normalize()
    var inform = 0
    var screenPointX = 0
    var screenPointY = 0
    for (var x = -numRays / 2; x < numRays / 2; x++) {
      // v.normalize()
      //stroke(0, 0, 255)
      //point(this.x * mapScale + (v.x * (x * raySpacing)) + (this.headingX * 50), this.y * mapScale + (v.y * (x * raySpacing)) + (this.headingY * 50))
      screenPointX = (this.x + (v.x * (x * raySpacing)) + (this.headingX * 50))
      screenPointY = (this.y + (v.y * (x * raySpacing)) + (this.headingY * 50))
      inform = ray(this.x, this.y, (screenPointX - this.x) * rayAccuracy, (screenPointY - this.y) * rayAccuracy, rayIterations / abs(screenPointX + screenPointY));

      // if it has hit an error(like and out of bounds or something of that sort)
      // var darkenVal = (1/inform.distance)
      var darkenVal = 1
      if (inform.hitValue == -1) {
        // then it will be white; (notice that we are not checking ofr 0, becasue the ray function will not return 0, it only returns for things other tahn 0)
        fill(255*darkenVal)
      } else {
        // if it hit an actuall block (value greater than 0) then it acces the color in the swatch object stores it tin color...
        this.color = swatches[inform.hitValue]
        // and uses the color variable to set a fill color
        fill(this.color[0]*darkenVal, this.color[1]*darkenVal, this.color[2]*darkenVal);
      }
      //inform.distance = inform.distance*0.1
      //print(inform.distance)
      // this is a pretty important part so I will do my best to explain. If you do not know well how the rect function workes in p5.js, please go look it up, and then come back.
      // the first paramater: we divide the width by the number of rays to get how wide each rectangle must be, and multiply that by which rectangle we are drwing to psoition it correctly, we also add width/2 to counteract the fact that I startes at a negitive number
      // the second paramater: we multiply the reciprical of the distance time sthe scaling to get the height of the rectange, (teh reciprical so that it shrinks the farther away it is.we divide that my 2 because rectangels are not centered, and we subtracted to the height to make it centered for when we actually give it height)
      // the third paramater: we give it its width by dividing th e width  by the numebr of crectangles
      // the fourth parameter: we give it its height by multiply the reciprical of the distance by the distance scaling.
      rect(width / 2 + (width / numRays) * x, height / 2 - (1 / inform.distance * distanceScalling) / 2, (width / numRays) + 1, 1 / inform.distance * distanceScalling)

    }
  }
  // update function, runs every frame and takes care of everything for the player
  update() {
    this.move();
    // the raycasting parametrs
    //HIGH-QUALITY
    //this.rayCaster(720, 0.1, 0.0001, 4);
    //MEDIUM-QUALITY
    this.rayCaster(100, 1, 0.0001, 4);
    //LOW-QUALITY
    //this.rayCaster(100, 1, 0.0005, 4);
  }
}

var player = new Player()
function setup() {

  bluP = [
    [3, 4, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 4, 1, 0, 2, 1, 0, 0, 2, 0, 0, 0],
    [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0],
    [1, 0, 1, 0, 3, 2, 1, 1, 3, 4, 0, 0],
    [4, 4, 1, 0, 3, 0, 0, 0, 0, 2, 0, 0],
    [1, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0],
    [1, 0, 0, 2, 4, 1, 9, 1, 0, 1, 0, 0],
    [2, 0, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
    [1, 0, 0, 1, 0, 0, 0, 1, 1, 3, 0, 4],
    [2, 0, 0, 3, 4, 2, 0, 1, 0, 0, 0, 3],
    [0, 4, 4, 3, 0, 0, 0, 0, 0, 0, 4, 4]
  ]
//   bluP = [
//     [1,2,2,2,1,1,2],
//     [3,9,9,9,9,9,1],
//     [2,0,0,0,0,0,1],
//     [4,0,0,0,0,0,4],
//     [3,0,0,0,0,0,2],
//     [1,2,2,2,1,1,2]
//   ]
  createCanvas(1440, 900);
}

function draw() {

  background(32,44,89);
  fill(40,15,25)
  noStroke();
  rect(0, height / 2, width, height / 2)
  stroke(245,252,239);
  strokeWeight(2)
  //uncoment below, to help debugging, will show the 2d version, you will also need to uncoment the storke above, and the drawing in the raycasting function
  seeMap(mapScale);
  player.update();
}
