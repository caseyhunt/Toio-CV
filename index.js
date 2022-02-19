// Notice there is no 'import' statement. 'cocoSsd' and 'tf' is
// available on the index-page because of the script tag above.


//https://codesandbox.io/s/tensorflow-js-real-time-object-detection-forked-8uujtq?file=/src/styles.css
var video = document.querySelector("#videoElement");
let videoWidth;
let videoHeight;
let boundingBoxes = [];
let widthProportion = 0.8;

document.querySelector('#streamprediction').style.height = video.style.height;
if (navigator.mediaDevices.getUserMedia) {
navigator.mediaDevices.getUserMedia({ video: true })
  .then(function (stream) {
    video.srcObject = stream;
    resizeBB();
    cocoSsd.load().then(model => {
    // detect objects in the image.
    detectFrame(video,model);
    });
  })
  .catch(function (err0r) {
    console.log("Something went wrong!");
  });
}

// Load the model.


function detectFrame(vid, mod){
mod.detect(vid).then(predictions => {
  console.log('Predictions: ', predictions);
  drawBoxes(predictions);
  requestAnimationFrame(() => {
    this.detectFrame(vid, mod);
  });
});
}

function drawBoxes(predictions) {
  document.querySelector('#boundingboxes').innerHTML = ' ';
  let prednum = 0;
  predictions.forEach( (prediction) => {
    document.querySelector('#boundingboxes').innerHTML += '<div class="bb" id="' + "pred_" + prednum + '"><p>' + prediction.class +" " + prediction.score +'</p><div class="centerdot" id="center_' +prednum+ '"></div></div>';
    let predbox = document.getElementById("pred_" + prednum);
    predbox.style.left = (prediction.bbox[0]/videoWidth)*boundingBoxes[0];
    predbox.style.top = (prediction.bbox[1]/videoHeight)*boundingBoxes[1];
    predbox.style.width = (prediction.bbox[2]/videoWidth)*boundingBoxes[0];
    predbox.style.height = (prediction.bbox[3]/videoHeight)*boundingBoxes[1];
    let centerx = ((prediction.bbox[2]/videoWidth)*boundingBoxes[0])/2 + (prediction.bbox[0]/videoWidth)*boundingBoxes[0];
    let centery = ((prediction.bbox[3]/videoHeight)*boundingBoxes[1])/2 + (prediction.bbox[1]/videoHeight)*boundingBoxes[1];
    prediction.center = [centerx, centery];
    prednum++;
  })
}

function resizeBB(){
  videoWidth = video.srcObject.getVideoTracks()[0].getSettings().width;
  videoHeight = video.srcObject.getVideoTracks()[0].getSettings().height;
  boundingBoxes[0] = window.innerWidth * widthProportion;
  boundingBoxes[1] = (videoHeight/videoWidth) * (window.innerWidth * widthProportion);
  document.querySelector('#boundingboxes').style.width = boundingBoxes[0];
  document.querySelector('#boundingboxes').style.height = boundingBoxes[1];
}

window.addEventListener('resize', resizeBB);
