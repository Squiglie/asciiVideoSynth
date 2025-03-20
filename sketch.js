//ascii video code made by patt vira https://www.pattvira.com/

let ps = [];
let bodyPose;
let video; vidw = 64; let vidh = 48; let scl = 10;
let textVideo;
let poses = [];
let connections;
let w, h;

let oscL = [];
let oscR = [];
let maxPpl = 2;
let playing, freq, amp;

let numOsc = 2;

let midiNotes = [84, 79, 76, 72, 67, 64, 60, 55, 52, 48, 43, 40];

let frameCounter = 0;


let asciiChar = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,^`'. "


function preload() {
  // Load the bodyPose model
  bodyPose = ml5.bodyPose("MoveNet", {flipped:true});
}


function gotPoses(results) {
  // Store the model's results in a global variable
  poses = results;
}

function setup() {
  let cnv = createCanvas(640, 480);
  video = createCapture(VIDEO, {flipped: true});
  video.size(640, 480);
  video.hide();

  textVideo = createCapture(VIDEO, {flipped: true});
  textVideo.size(64, 48);
  textVideo.hide();
  w = width / textVideo.width;
  h = height / textVideo.height;

  // Start detecting poses in the webcam video
  bodyPose.detectStart(video, gotPoses);
 
  for (let i = 0; i < numOsc; i++) {
    let waveType = 'sine';
    if (i % 2 !== 0) {
      waveType = 'square';
    }
    let oscillator = new p5.Oscillator(waveType);
    let note = midiToFreq(midiNotes[random(0, midiNotes.length)]);
    oscillator.freq(note); 
    oscillator.amp(0.0);
    oscL.push(oscillator);

    let oscillator2 = new p5.Oscillator(waveType);
    let note2 = midiToFreq(midiNotes[random(0, midiNotes.length)]);
    oscillator2.freq(note2); 
    oscillator2.amp(0.0);
    oscR.push(oscillator2);
  }
  cnv.mousePressed(playOscillator);
  

}

function draw() {
  background(0);
  // Load the pixels[] for the scratch image into memory
  video.loadPixels();
  textVideo.loadPixels();

  frameCounter++;
  // image(video, 0, 0, width, height);
  filter(INVERT);
  asciiVid(textVideo);
  for (let i = ps.length-1; i >= 0  ; i--) {
    ps[i].update();
    ps[i].display();

    if(ps[i].done){
      ps.splice(i, 1);
    }
    
  //   freq = constrain(map(mouseX, 0, width, 100, 500), 100, 500);
  //   // amp = constrain(map(mouseY, height, 0, 0, 1), 0, 1);
 

    // if (playing) {
    //   // smooth the transitions by 0.1 seconds
    //   // osc.freq(freq);
    //   //osc.amp(amp);
    // }
  }
  print(poses.length);
  // Draw all the tracked landmark points
  let activeOsc = poses.length < numOsc ? poses.length : numOsc;

   

  //if no one in frame
    //no sound
 
  if(poses.length < 1){
    for (let i = 0; i < numOsc; i++) {
      oscL[i].amp(0);
      oscR[i].amp(0);
    }
  } else {
  // if anyone in frame
      //   for each person
      //     draw pompoms
      //     set oscL
      //     ser oscR
    for (let i = 0; i < poses.length; i++) {
      let maxLoudness = 1 / (poses.length * 2);
      // print("max loudness:" + maxLoudness);
      let pose = poses[i];
      for (let j = 9; j < 11; j++) {
        let keypoint = pose.keypoints[j];
        // Only draw a circle if the keypoint's confidence is bigger than 0.1
        if (keypoint.confidence > 0.1) {
          circle(keypoint.x, keypoint.y, 10);
          let index = floor(map(keypoint.x, 0, width, 0, midiNotes.length));
          index = constrain(index, 0, midiNotes.length - 1);
          freq = midiToFreq(midiNotes[index]);
          amp = constrain(map(keypoint.y, height, 0, 0, maxLoudness), 0, maxLoudness);
          if (playing & frameCounter % 5 === 0) {
            // print("amplitude:" + amp);
            // if 9, thats  left, if ten that's right
            if (typeof oscL[i] != "undefined" & typeof oscR[i] != "undefined") {
              if(j == 9){
                oscL[i].freq(freq, 0.5);
                oscL[i].amp(amp, 0.5);
              } 
              if(j == 10){
                // oscR[i].freq(freq, 0.5);
                // oscR[i].amp(amp, 0.5);
                
                // This code makes right hand "pulsing" by fading out and back in
                oscR[i].amp(0, 0.05); // Fade out in 50ms
                setTimeout(() => {
                    oscR[i].freq(freq, 0.1); // Then smoothly change frequency
                    oscR[i].amp(amp, 0.1); // Fade back in
                }, 50);

              } 
            }
            //osc[i].amp(amp, 0.1); // Smooth transition
            print("playing");
          }
          // print(amp);
          // print(freq);
          // print(j);
          // print(i);
          

          ps.push(new System(keypoint.x, keypoint.y));
        }
      }
     
    }
  }
  
  

    // for (let i = 0; i < activeOsc; i++) {
    //   if(i < poses.length){
    //     osc[i].amp(0.1);
        // let pose = poses[i];
        // instead of iterating through all j values, 
        // lets just do this for loop for the couple of j values we want (10 and 9)
        
    //   }else{
    //     osc[i].amp(0);
    //   }
     
    // }
    
}

function playOscillator() {
  for (let i = 0; i < numOsc; i++) {
    if (!oscL[i].started) { // Ensure it starts only once
      oscL[i].start();
      oscL[i].started = true;
    }

    if (!oscR[i].started) { // Ensure it starts only once
      oscR[i].start();
      oscR[i].started = true;
    }
  }
  playing = true;
}

  /* ---- Using pixels ---- */
function asciiVid(video){
  for (let i=0; i<video.width; i++) {
    for (let j=0; j<video.height; j++) {
      let pixelIndex = (i + j*video.width) * 4;
      let r = video.pixels[pixelIndex + 0];
      let g = video.pixels[pixelIndex + 1];
      let b = video.pixels[pixelIndex + 2];
      
      // let bright = brightness(color(r, g, b))
      let bright = (r + g + b) / 3;
      let tIndex = floor(map(bright, 0, 255, 0, asciiChar.length));
      
      let x = i*w + w/2;
      let y = j*h + h/2;
      let t = asciiChar.charAt(tIndex);
      fill(0);
      textSize(w);
      textAlign(CENTER, CENTER);
      text(t, x, y);
    }
  }
} 
