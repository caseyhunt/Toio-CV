// Notice there is no 'import' statement. 'cocoSsd' and 'tf' is
// available on the index-page because of the script tag above.

const img = document.getElementById('img');



var video = document.querySelector("#videoElement");

if (navigator.mediaDevices.getUserMedia) {
navigator.mediaDevices.getUserMedia({ video: true })
  .then(function (stream) {
    video.srcObject = stream;
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
  // document.querySelector('#stream').innerHTML += '<div class="boundingbox"></div>';
}
