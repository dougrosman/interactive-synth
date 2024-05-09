/* Touch-Bar Synth */

// https://learn.ml5js.org/#/reference/posenet

/* ===
ml5 Example
PoseNet example using p5.js
=== */
// Global Variables
let capture;
let poseNet;
let poses = []; // this array will contain our detected poses (THIS IS THE IMPORTANT STUFF)
const cam_w = 1280;
const cam_h = 720;
let rightWrist;
let prevRightWrist;
let oldestNote;
let isInside = false;

const options = {
  architecture: "MobileNetV1",
  imageScaleFactor: 0.3,
  outputStride: 8, // 8, 16 (larger = faster/less accurate)
  flipHorizontal: true,
  minConfidence: 0.5,
  maxPoseDetections: 1, // 5 is the max
  scoreThreshold: 0.8,
  nmsRadius: 20,
  detectionType: "multiple",
  inputResolution: 257, // 161, 193, 257, 289, 321, 353, 385, 417, 449, 481, 513, or 801, smaller = faster/less accurate
  multiplier: 0.5, // 1.01, 1.0, 0.75, or 0.50, smaller = faster/less accurate
  quantBytes: 2,
};

let numBars = 5; // variable for number of bars
let bars = []; // array to hold each individual bar as an object
let xBar = []; // array to hold the x coords of the LH side of each bar
let clr = ["#000000", "#444444", "#888888", "#CCCCCC", "##FFFFFF"]; // array of colors for the bars
let notes = [349.23, 415.3, 466.16, 523.25, 622.25, 698.46]; // array to store the frequencies of each note of an f minor pentatonic scale
let volSlider;
let polySynth;
let trail = [];
let a = 0;
let drum;
let img;

function preload() {
  img = loadImage("noteee.png");
  drum = loadSound("drum_loop.wav");
  // button = createButton("🥁");
  // button.mousePressed(togglePlaying);
}

function setup() {
  createCanvas(cam_w, cam_h);

  imageMode(CENTER);
  createCanvas(cam_w, cam_h);
  capture = createCapture(VIDEO);
  capture.size(cam_w, cam_h);
  capture.hide();

  rightWrist = createVector(0, 0);
  prevRightWrist = rightWrist;
  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(capture, options, modelReady);

  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected.
  poseNet.on("pose", function (results) {
    poses = results;
  });

  // draw drump loop

  // button.position(25, 25);
  textSize(16);
  fill(1);
  //text("drum loop", 25, 20);

  // set up the synthesis

  polySynth = new p5.PolySynth();
  polySynth.setADSR(0.6, 0.7, 0.4, 0.9); // attackTime, decayTime, susRatio, releaseTime
}

function draw() {
  // mirror the capture being drawn to the canvas
  // push();
  // translate(width, 0);
  // scale(-1, 1);
  // image(capture, 0, 0);
  // pop();

  // populate xCoord array values for the x-coordinate of the left side of each bar
  for (let i = 0; i < numBars; i++) {
    let w = width / numBars;
    let x = w * i;
    xBar.push(x);
  }

  // draw the bars across the screen
  for (let i = 0; i < numBars; i++) {
    bars.push(new Bar(i)); // create a new bar and push to array of bars
    bars[i].display(); // call .display() function for that bar
  }

  if (poses.length > 0) {
    if (!isInside) {
      // If the mouse enters the zone, play the sound
      drum.loop();
      isInside = true;
    }
  } else {
    if (isInside) {
      // If the mouse leaves the zone, stop the sound
      drum.stop();
      isInside = false;
    }
  }

  // grab the right and left wrist position data and store them in global variables
  if (poses.length > 0) {
    // store the first pose in a variable called "pose"
    let pose = poses[0].pose;
    let nose = createVector(pose.nose.x, pose.nose.y);
    fill(255, 0, 0);
    ellipse(nose.x, nose.y, 20, 20);

    // store the keypoint for the right wrist in a variable called "rightWrist"
    let currentWrist = createVector(pose.rightWrist.x, pose.rightWrist.y);

    rightWrist = p5.Vector.lerp(prevRightWrist, currentWrist, 0.25);

    image(img, rightWrist.x, rightWrist.y, 50, 50);
    prevRightWrist = rightWrist;
  }

  if (rightWrist && poses.length > 0) {
    //if(rightWrist.x > 0 && rightWrist.x < width/4) {
    userStartAudio();
    for (let i = 0; i < numBars; i++) {
      bars[i].played();
    }
  }
}

function modelReady() {
  console.log("Model loaded");
}

function togglePlaying() {
  if (!drum.isPlaying()) {
    //drum.play();
    //button.html("⏹️");
    drum.loop();
  } else {
    drum.stop();
    //button.html("🥁");
  }
}

function touchStarted() {
  userStartAudio();
  for (let i = 0; i < numBars; i++) {
    bars[i].played();
  }
}
