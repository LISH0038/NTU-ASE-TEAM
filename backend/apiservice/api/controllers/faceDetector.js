'use strict'

global.Blob = require('blob'),
global.CUDA_VISIBLE_DEVICES="-1";

const env = require(process.env.node_env),
      faceapi = require('face-api.js'),
      canvas = require('canvas'),
      path = require('path'),
      fetch = require('node-fetch'),
      fs = require('fs-extra'),
      tf = require('@tensorflow/tfjs-node'),
      distanceThreshold = 0.4,
      MODELS_URL = path.join(__dirname, '/../public/models/'),
    base64ToImage = require('base64-to-image');

const regex_folder = RegExp('^[a-zA-Z][0-9]{7}[a-zA-Z]_.*'); // Folder name match in FaceDB
const regex_id = RegExp('^[a-zA-Z][0-9]{7}[a-zA-Z]'); // Matric id match in FaceDB

function controller(){
  const { Canvas, Image, ImageData } = canvas;
  faceapi.env.monkeyPatch({ Canvas, Image, ImageData, fetch });
}

// used for facial recognition
controller.prototype.detectFace = async function(recognitionData, imageBase64, res){
  console.log("testhere1");
  try{
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_URL);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_URL);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_URL);
    await faceapi.tf.setBackend('tensorflow');
    const labeledFaceDescriptors = await recogData(recognitionData);
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, distanceThreshold);
    console.log("issue pre11111 loading");

    var data = await imageBase64.replace(/^data:image\/\w+;base64,/, "");
    var buf = await new Buffer(data, 'base64');
    // var id = await env.images + '1.png';
    //TODO: solve problems with saving image
    var image="/opt/images/"+`${new Date().getTime()}.jpeg`;
    fs.writeFile(image, buf, {encoding:'base64'}, async (err) => {
      if (err) throw err;
      console.log("saved");
      const img = await canvas.loadImage(image);
      const canvas1 = faceapi.createCanvasFromMedia(img);
      console.log("issue post loading");
      const displaySize = { width: img.width, height: img.height }
      faceapi.matchDimensions(canvas1, displaySize);
      const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      for(let i=0;i<labeledFaceDescriptors.length;i++){
        for (let j = 0; j < labeledFaceDescriptors[i]._descriptors.length; j++) {
          const dist = faceapi.euclideanDistance(resizedDetections[0].descriptor, labeledFaceDescriptors[i]._descriptors[j]);
          console.log("comparing with " + j + " of " + labeledFaceDescriptors[i]._label + " data: " + dist);
        }
      }
      const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
      const returnedIds = [];

      results.forEach((result, i) => {

        // const box = resizedDetections[i].detection.box;
        // const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString().split("_")[1]});
        if (regex_id.test(result.toString().split("_")[0])) {
          returnedIds.push(result.toString().split("_")[0]);
        }
        // drawBox.draw(canvas1);
      });
      console.log(returnedIds);
      // return { canvas: canvas1.toDataURL(), recognizedStudentIds: returnedIds};
      return res.json({ recognizedStudentIds: returnedIds});
    });
  }catch(err){ throw 'Error in controllers/faceDetector.js (detectFace):\n'+err; }
}

// recognize face from image
// used in '/recdata' to form RecData.json as reference database
controller.prototype.recognizeFace = async function(){
  try{
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_URL);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_URL);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_URL);
    const labels = await fs.readdir(env.faceDB);
    return Promise.all(labels.filter(label=> regex_folder.test(label)).map(async label => {
        console.log(label);
        const descriptions = [];
        const images = await fs.readdir(env.faceDB + label);
        for (let i = 0; i < images.length; i++) {
          const img = await canvas.loadImage(env.faceDB + label + '/' + images[i]);
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
          if (typeof detections != 'undefined') {
            descriptions.push(detections.descriptor);
            console.log('finished loading ' + images[i] + '\t\t detected');
          } else console.log('finished loading ' + images[i] + '\t\t undetected');
        }
        return {label: label, descriptors: descriptions};
        // return new faceapi.LabeledFaceDescriptors(label, descriptions);

    }));
  }catch(err){ throw 'Error in controller/faceDetector.js (recognizeFace):\n'+err; }
}

// convert picture into labeled face descriptors
async function recogData(data){
  try{
    return Promise.all(data.map(d => {
      return new faceapi.LabeledFaceDescriptors(d.label, d.descriptors);
    }))
  }catch(err){ throw 'Error in faceDetector.js (recogData):\n'+err; }
}

module.exports = controller;
