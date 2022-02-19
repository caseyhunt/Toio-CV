// Notice there is no 'import' statement. 'cocoSsd' and 'tf' is
// available on the index-page because of the script tag above.


//https://codesandbox.io/s/tensorflow-js-real-time-object-detection-forked-8uujtq?file=/src/styles.css
var video = document.querySelector("#videoElement");
let videoWidth;
let videoHeight;
let boundingBoxes = [];
let widthProportion = 0.8;

let toiox;
let toioy;

let toioMove = false;


const CUBE_ID_ARRAY = [ 0, 1, 2 ];
const SUPPORT_CUBE_NUM = CUBE_ID_ARRAY.length;

// Global Variables.
const gCubes = [ undefined, undefined, undefined ];
connectedCube = [ false, false, false ];


var speed1 = 0xFF;

const SERVICE_UUID              = '10b20100-5b3b-4571-9508-cf3efcd7bbae';
const MOVE_CHARCTERISTICS_UUID = '10b20102-5b3b-4571-9508-cf3efcd7bbae';
const SOUND_CHARCTERISTICS_UUID = '10b20104-5b3b-4571-9508-cf3efcd7bbae';
const LIGHT_CHARCTERISTICS_UUID = '10b20103-5b3b-4571-9508-cf3efcd7bbae';
const POSITION_CHARACTERISTICS_UUID = '10b20101-5b3b-4571-9508-cf3efcd7bbae';

const connectNewCube = () => {

      const cube = {
          device:undefined,
          sever:undefined,
          service:undefined,
          soundChar:undefined,
          moveChar:undefined,
          lightChar:undefined,
          posChar: undefined

      };

      // Scan only toio Core Cubes
      const options = {
          filters: [
              { services: [ SERVICE_UUID ] },
          ],
      }

      navigator.bluetooth.requestDevice( options ).then( device => {
          cube.device = device;
          if( cube === gCubes[0] ){
              turnOnLightCian( cube );

              const cubeID = 1;
          }else if( cube === gCubes[1] ){
              turnOnLightGreen( cube );
              spinCube( cube );
              const cubeID = 2;
          }
          return device.gatt.connect();
      }).then( server => {
          cube.server = server;
          return server.getPrimaryService( SERVICE_UUID );
      }).then(service => {
          cube.service = service;
          return cube.service.getCharacteristic( MOVE_CHARCTERISTICS_UUID );
      }).then( characteristic => {
          cube.moveChar = characteristic;
          return cube.service.getCharacteristic( SOUND_CHARCTERISTICS_UUID );
      }).then( characteristic => {
          cube.soundChar = characteristic;
          return cube.service.getCharacteristic( LIGHT_CHARCTERISTICS_UUID );
      }).then( characteristic => {
          cube.lightChar = characteristic;
          return cube.service.getCharacteristic( POSITION_CHARACTERISTICS_UUID );
      }).then( characteristic => {
          cube.posChar = characteristic;
          if( cube === gCubes[0] ){
            turnOnLightCian( cube );
            spinCube( cube );
          }else if( cube === gCubes[1] ){
            turnOnLightGreen( cube );
          }else{
            turnOnLightRed( cube );
          }
      });

      return cube;
  }



  // Cube Commands
  // -- Light Commands
  var myCharacteristic;
  const turnOffLight = ( cube ) => {

      const CMD_TURN_OFF = 0x01;
      const buf = new Uint8Array([ CMD_TURN_OFF ]);
      if( ( cube !== undefined ) && ( cube.lightChar !== undefined ) ){
          cube.lightChar.writeValue( buf );

      }

  }


  const turnOnLightGreen = ( cube ) => {

      // Green light
      const buf = new Uint8Array([ 0x03, 0x00, 0x01, 0x01, 0x00, 0xFF, 0xFF]);

      if( ( cube !== undefined ) && ( cube.lightChar !== undefined ) ){
          cube.lightChar.writeValue( buf );
          console.log('green');
      }

  }

  const turnOnLightCian = ( cube ) => {

      // Cian light
    const buf = new Uint8Array([ 0x03, 0x00, 0x01, 0x01, 0x00, 0xFF, 0xFF ]);
      if( ( cube !== undefined ) && ( cube.lightChar !== undefined ) ){
          cube.lightChar.writeValue( buf );
          console.log('cyan');

      }

  }

  const turnOnLightRed = ( cube ) => {

      // Red light
      const buf = new Uint8Array([ 0x03, 0x00, 0x01, 0x01, 0xFF, 0x00, 0x00 ]);
      if( ( cube !== undefined ) && ( cube.lightChar !== undefined ) ){
          cube.lightChar.writeValue( buf );
      }

  }


  const spinCube = ( cube ) => {

      // Green light
      const buf = new Uint8Array([ 0x02, 0x01, 0x01, 0x64, 0x02, 0x02, 0x14, 0x64 ]);
      if( ( cube !== undefined ) && ( cube.moveChar !== undefined ) ){
          cube.moveChar.writeValue( buf );
          console.log('spin');
      }
      if(cube == gCubes[0] && connectedCube[0] == false){
          connectedCube[0] = true;
      }else if(cube == gCubes[1] && connectedCube[1] == false){
        connectedCube[1] = true;
      }else if(cube == gCubes[2] && connectedCube[2] == false){
        connectedCube[2] = true;
      }

  }


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
  toioMove = false;
  if(predictions == undefined || predictions.length < 1){
    if (connectedCube[0] == true){
       cube = gCubes[0];
    var buf2 = new Uint8Array([0x01]);
      cube.soundChar.writeValue( buf2 );
      console.log("fan off");
    }
  }
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

    if(prediction.class == "cup" || prediction.class == "bowl"){
      toioMove = true;
        //spinCube(gCubes[0]);
    }
    if(connectedCube[0] == true){
    if(toioMove == true){
      console.log('cup at ' + prediction.center);
      toiox = centerx/boundingBoxes[0];
      toioy = centery/boundingBoxes[1];
      console.log(toiox, toioy);
      toiox = toiox*(422-67)+67;
      toioy = toioy*(440-85)+92;
      console.log(toiox, toioy);

      movetoPos(toiox, toioy);

  }else{
    if (gCubes[0] !== undefined){
       cube = gCubes[0];
    var buf2 = new Uint8Array([0x01]);
      cube.soundChar.writeValue( buf2 );
      console.log("fan off");
  }
}
}
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

function movetoPos(xgo, ygo){
  if (gCubes[0] !== undefined){

     cube = gCubes[0];
     console.log("move cube to position");
     var buf1 = new Uint8Array([0x03,0x00,0x05,0x01,0x32,0x00, 0x00,littleEndian(xgo)[0], littleEndian(xgo)[1], littleEndian(ygo)[0], littleEndian(ygo)[1],0x5a,0x00]);
     console.log( buf1 );
     setTimeout(function(){
     cube.moveChar.writeValue( buf1 );
   },100);
     var buf2 = new Uint8Array([0x03,0x00,0x01,0x1E,0x3C,0x1E]);
     setTimeout(function(){
       cube.soundChar.writeValue( buf2 );
       console.log('writing sound');
     }, 500);

   }
}

function littleEndian(num){
  let outarr = [];
  num = parseInt(num);
  if(num<65,535){
    if(num<255){
      outarr = [num, "0x00"];
      outarr = [outarr[0].toString(16), outarr[1]];
      if(outarr[0] == 'NaN'){
        outarr[0] = "0x00";
      }else if(outarr[0].length ==1){
      outarr[0] = "0x0" + outarr[0];
    }else if(outarr[0].length >= 2){
      outarr[0] = "0x" + outarr[0];
    }
  }else{
    outarr = [num-255, "0x01"];
    outarr = [outarr[0].toString(16), outarr[1]];
      if(outarr[0] == 'NaN'){
      outarr[0] = "0x00";
    }else if(outarr[0].length ==1){
      outarr[0] = "0x0" + outarr[0];
    }else if(outarr[0].length >= 2){
      outarr[0] = "0x" + outarr[0];
    }
    }

    return outarr;


  }else{
    console.log('ERROR: You are trying to encode a little endian number greater than two bits.');
    console.log('please see function littleEndian() for more information');
    return false;
  }

}


window.addEventListener('resize', resizeBB);

const initialize = () => {

  // Event Listning for GUI buttons.
  for( let cubeId of CUBE_ID_ARRAY ){
      document.getElementById( 'btConnectCube' + ( cubeId + 1) ).addEventListener( 'click', async ev => {

          if( cubeId === 0 ){
              gCubes[0] = connectNewCube();
              console.log('cube 0 connected (cyan)');
          }else if( cubeId === 1 ){
              gCubes[1] = connectNewCube();
              console.log('cube 1 connected (green)');
          }else{
              gCubes[2] = connectNewCube();
              console.log('cube 3 connected (red)');
          }

        });
    }
  }



initialize();

//canvas origin: 0x43, 0x00,0x5c,0x00  x: 67, y: 92
//x max: '0xac', '0x01' x: 272
//y max: '0xaf', '0x01' y: 275
