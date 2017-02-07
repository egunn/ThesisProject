float odds =99;

void setup() {
size(1000, 700);
noStroke(); smooth(); noLoop();
}

void draw() {
background(255);
// x,y, angle, size, space, deltasize , limit,
// transparency
drawTree(width/4, //x
         3*height/4, //y
         random(-PI/10, PI/10), //PI/10, //angle
         20,   //size
         .6,  //space
         1,   //steps
         0.98, //deltasize
         1,    //limit
         255); //transparency
}



void drawTree(float x, float y, float angle, float ssize,
float space, float steps, float deltasize, float llimit,
float transp) {

  if (steps > 100){
    steps = 0;
    odds = 100;
  }
  else{
    steps = steps +1;
    odds = odds - .1; 
  }
  
//print(".");

float perturbAngle = angle + random(-PI/20,PI/20);
//angle = angle + perturbAngle;

  
transp=transp*0.99;
fill(130, 130, 130, transp);
ellipse(x,y,ssize,ssize);
if (ssize >= llimit) { // termination criteria
if (random(1,100)<odds) { // branch?
drawTree(x+cos(perturbAngle)*ssize*space,
y-sin(perturbAngle)*ssize*space, angle,
ssize*deltasize, space, steps, deltasize,
llimit, transp);
}
else{
drawTree(x+cos(perturbAngle+PI/4)*ssize*space,
y-sin(perturbAngle+PI/4)*ssize*space,
(angle+PI/4), ssize*deltasize, space, steps,
deltasize, llimit, transp);
drawTree(x+cos(perturbAngle-PI/4)*ssize*space,
y-sin(perturbAngle-PI/4)*ssize*space,
(perturbAngle-PI/4), ssize*deltasize,
space, steps, deltasize, llimit, transp);
}
}
}