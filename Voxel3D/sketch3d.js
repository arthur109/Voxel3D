// creates 3d arrays
function create3DArray(width, height, depth) {
  var x = new Array(width);
  for (var i = 0; i < width; i++) {
    x[i] = new Array(height);
    for (var a = 0; a < x[i].length; a++) {
      x[i][a] = new Array(depth);
    }
  }
  return x;
}
//displays the map and possition of player/orientation for debuging
function seeMap(scale) {
  for (var x = 0; x < bluP.length; x++) {
    for (var y = 0; y < bluP[x].length; y++) {
      if (bluP[x][y] == null) {
        fill(255)
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
var bluP = create3DArray(10, 10, 10);
// by how much to scale up the debugging map
var mapScale = 50;
// stores the swatch colored
var swatches = {
  1: [255, 0, 0],
  2: [255, 255, 0],
  3: [0, 255, 0],
  4: [0, 255, 255],
  5: [0, 0, 255],
  6: [255, 0, 0]
}
// accses value in blueprint arrar
function look(x, y, z) {
  //makes sure the index is an integer
  this.x = Math.floor(x);
  this.y = Math.floor(y);
  this.z = Math.floor(z);
  //makes sure the indexes are wihin bounds
  //console.log(this.x, this.y, this.z);
  //console.log(bluP);
  if (this.x > bluP.length - 1 || !this.x || !this.y || !this.z) {
    //will return -1 if it is out of bounds
    return -1;
  } else if (this.y > bluP[this.x].length - 1) {
    return -1;
  } else if (this.z > bluP[this.x][this.y].length - 1) {
    return -1;
  }
  // returns the value
  return bluP[this.x][this.y][this.z];
}

// input is a starting positio,n at x direction and y direction, and how many steps it should move befor despawning (iterations)
function ray(xpos, ypos, zpos, xhead, yhead, zhead, iterations) {
  // stores the original position for later use
  origX = xpos;
  origY = ypos;
  origZ = zpos;

  // creates the variable that will stor what it has hit
  var seen = 0;
  // loops throgh the amount of iterations specified
  for (var i = 0; i < iterations; iterations++) {
    //looks at what the value of the current tile it is on is
    seen = look(xpos, ypos, zpos)
    // if the tile is not null(in other words, empty), then..
    if (seen != null) {
      // it will store some data for output like,
      var info = {
        // what was the value of the tile it hit
        hitValue: seen,
        // and how far away it is from the rays starting position (thats why we made origX and origY)
        //distance: dist(origX, origY, origZ, xpos, ypos, zpos)
      }
      // |||||| uncoment below for depugging ||||||
      // stroke(0);
      // point(xpos * mapScale, ypos * mapScale);
      // noStroke();
      //returns the info
      return info;
      // and stops the for loop (I am not sure if this is necessary)
      break;
      //but if it did not hit anything, then it continiues moving
    } else {
      xpos += xhead;
      ypos += yhead;
      zpos += zhead;
    }
  }
}

// the player class (and also the ray casting)
class Player {
  constructor() {
    // stores it position
    this.x = 5;
    this.y = 5;
    this.z = 5;
    // stores is orientation in terms of a vector
    this.headingX = 0;
    this.headingY = 1;
    this.headingZ = 0;
    // stores its orientation in terms of radians2D
    this.radians2D = 0;
    this.radians3D = 0;
    // stores its movment speed
    this.speed = 1 / 30;
  }
  // the rotate function
  rotate() {
    // converts the mouse x position into a radian...
    this.radians2D = ((mouseX / 100)) % (CIRCLE);
    this.radians3D = ((mouseY / 50)) % (CIRCLE);
    //which is then converted to a vector.
    this.headingX = cos(this.radians2D) * cos(this.radians3D);
    this.headingY = sin(this.radians2D) * cos(this.radians3D);
    this.headingZ = sin(this.radians3D)
    /*
    x = Math.cos(alpha)*Math.cos(beta);
    z = Math.sin(alpha)*Math.cos(beta);
    y = Math.sin(beta);
    */
  }
  // detects collisions befor it happens (this is kind of weird but you will understand more in the move function)
  collide() {
    // gets the 2 possible values of the players futur positions
    var futurX = look(this.x + this.headingX * this.speed, this.y, this.z)
    var futurY = look(this.x, this.y + this.headingY * this.speed, this.z)
    var futurZ = look(this.x, this.y, this.z + this.headingZ * this.speed)
    // if its x values are not in a wall then it can move
    if (futurX <= 0 || futurX == null) {
      this.x += this.headingX * this.speed;
    }
    // if its y values are not in a wall then it can move
    if (futurY <= 0 || futurY == null) {
      this.y += this.headingY * this.speed;
    }
    if (futurZ <= 0 || futurZ == null) {
      this.z += this.headingZ * this.speed;
    }

  }
  // same as collide() except that it checks in the opposit direction
  backCollide() {
    var futurX = look(this.x - this.headingX * this.speed, this.y, this.z)
    var futurY = look(this.x, this.y - this.headingY * this.speed, this.z)
    var futurZ = look(this.x, this.y, this.z - this.headingZ * this.speed)
    // if its x values are not in a wall then it can move
    if (futurX <= 0 || futurX == null) {
      this.x -= this.headingX * this.speed;
    }
    // if its y values are not in a wall then it can move
    if (futurY <= 0 || futurY == null) {
      this.y -= this.headingY * this.speed;
    }
    if (futurZ <= 0 || futurZ == null) {
      this.z -= this.headingZ * this.speed;
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

  rayCaster(rayNumWidth, rayNumHeight, raySpacing, rayAccuracy, rayIterations) {
    // will store the data from each ray
    var inform;
    // by how much you scale up the rectangle based on how close it is
    var sideMoveX = cos((this.radians2D + HALF_PI)) * cos(this.radians3D);
    var sideMoveY = sin((this.radians2D + HALF_PI)) * cos(this.radians3D);
    var sideMoveZ = sin(this.radians3D)
    var vertMoveX = cos(this.radians2D) * cos((this.radians3D + HALF_PI));
    var vertMoveY = sin(this.radians2D) * cos((this.radians3D + HALF_PI));
    var vertMoveZ = sin((this.radians3D + HALF_PI))
    // loops thrtough the number of rays, (var i is not equal to zero, because we want it to be centered on half)
    for (var y = -rayNumHeight / 2; y < rayNumHeight / 2; y++) {
      //this.dirZsimple = this.radians3D + (y * raySpacing);

      for (var x = -rayNumWidth / 2; x < rayNumWidth / 2; x++) {
        // calculates the direction vector for the specific ray
        var screenPointZ = this.z + (sideMoveZ * (x * raySpacing)) + (vertMoveZ * (y * raySpacing));
        var screenPointX = this.x + (sideMoveX * (x * raySpacing)) + (vertMoveX * (y * raySpacing));
        var screenPointY = this.y + (sideMoveY * (x * raySpacing)) + (vertMoveY * (y * raySpacing));
        // sends the ray, and records its returned information in the previously created inform variable
        //print(raySpacing, x, y);
        inform = ray(this.x, this.y, this.z, (screenPointX - this.x) * rayAccuracy, (screenPointY - this.y) * rayAccuracy, (screenPointZ - this.z) * rayAccuracy, rayIterations);
        // if it has hit an error(like and out of bounds or something of that sort)
        if (inform.hitValue == -1) {
          // then it will be white; (notice that we are not checking ofr null, becasue the ray function will not return null, it only returns for things other tahn null)
          fill(255)
        } else {
          // if it hit an actuall block (value greater than 0) then it acces the color in the swatch object stores it tin color...
          this.color = swatches[inform.hitValue]
          // and uses the color variable to set a fill color
          fill(this.color[0], this.color[1], this.color[2]);
        }
        // this is a pretty important part so I will do my best to explain. If you do not know well how the rect function workes in p5.js, please go look it up, and then come back.
        // the first paramater: we divide the width by the number of rays to get how wide each rectangle must be, and multiply that by which rectangle we are drwing to psoition it correctly, we also add width/2 to counteract the fact that I startes at a negitive number
        // the second paramater: we multiply the reciprical of the distance time sthe scaling to get the height of the rectange, (teh reciprical so that it shrinks the farther away it is.we divide that my 2 because rectangels are not centered, and we subtracted to the height to make it centered for when we actually give it height)
        // the third paramater: we give it its width by dividing th e width  by the numebr of crectangles
        // the fourth parameter: we give it its height by multiply the reciprical of the distance by the distance scaling.
        rect(width / 2 + (width / rayNumWidth) * x, height / 2 + (height / rayNumHeight) * y, (width / rayNumWidth), (height / rayNumHeight))
      }
    }
  }
  // update function, runs every frame and takes care of everything for the player
  update() {
    this.move();
    // the raycasting parametrs
    this.rayCaster(150, 75, 1, 0.0001, 20);
  }
}

var player = new Player()

function setup() {
  noStroke();
  // makes the obastackes on the map (the number it is assigned to corresponds to a swatch color)
  bluP[2][3][2] = 1
  bluP[3][3][2] = 2
  bluP[4][3][2] = 1
  bluP[5][3][4] = 2
  bluP[6][3][4] = 1
  bluP[2][3][4] = 3
  bluP[2][4][4] = 2
  bluP[2][5][2] = 3
  bluP[2][6][3] = 2
  bluP[6][3][3] = 4
  bluP[6][4][3] = 5
  bluP[6][5][4] = 4
  bluP[6][6][4] = 5
  createCanvas(1440, 900);
}

function draw() {
  //stroke(255, 0, 255);
  background(0);
  // uncoment below, to help debugging, will show the 2d version, you will also need to uncoment the storke above, and the drawing in the raycasting function
  //seeMap(mapScale);
  player.update();
  fill(0);
  rect(mouseX, mouseY, 20, 20);
}