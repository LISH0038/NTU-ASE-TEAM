'use strict'

global.Blob = require('blob');
// global.CUDA_VISIBLE_DEVICES="-1";

const env = require(process.env.node_env),
      faceapi = require('face-api.js'),
      canvas = require('canvas'),
      path = require('path'),
      fetch = require('node-fetch'),
      fs = require('fs-extra'),
      tf = require('@tensorflow/tfjs-node'),
      MODELS_URL = path.join(__dirname, '/../public/models/'),
    base64ToImage = require('base64-to-image'),
    regex_folder = RegExp('^[a-zA-Z][0-9]{7}[a-zA-Z]_.*'), // Folder name match in FaceDB
    regex_id = RegExp('^[a-zA-Z][0-9]{7}[a-zA-Z]'); // Matric id match in FaceDB

function controller(){
  const { Canvas, Image, ImageData } = canvas;
  faceapi.env.monkeyPatch({ Canvas, Image, ImageData, fetch });
}

// used for facial recognition
controller.prototype.detectFace = async function(recognitionData, imageBase64, callback){
  try{
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_URL);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_URL);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_URL);
    await faceapi.tf.setBackend('tensorflow');
    const labeledFaceDescriptors = await recogData(recognitionData);
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, env.scoreThreshold);

    let data = await imageBase64.replace(/^data:image\/\w+;base64,/, "");
    let buf = await new Buffer(data, 'base64');
    // var id = await env.images + '1.png';
    //TODO: solve problems with saving image
    let image="/opt/images/"+`${new Date().getTime()}.jpeg`;
    await fs.writeFile(image, buf, {encoding:'base64'}, async (err) => {
      if (err) throw err;
      console.log("saved");
      const img = await canvas.loadImage(image);
      const canvas1 = faceapi.createCanvasFromMedia(img);
      console.log("issue post loading");
      const displaySize = { width: img.width, height: img.height };
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
        if (regex_id.test(result.toString().split("_")[0])) {
          returnedIds.push(result.toString().split("_")[0]);
        }
      });

      callback(returnedIds);
    });
  }catch(err){ throw 'Error in controllers/faceDetector.js (detectFace):\n'+err; }
}

// save each image and update RecData.json
controller.prototype.registerFace = async function (imageBase64String,studentIdName, recognitionData){
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_URL);
  await faceapi.tf.setBackend('tensorflow');
  let imageBase64 = await imageBase64String.replace(/^data:image\/\w+;base64,/, "");
  let buf = await new Buffer(imageBase64, 'base64');
  let folder_dir = env.faceDB + studentIdName;

  if (!fs.existsSync(folder_dir)){
    fs.mkdirSync(folder_dir);
  } else{
    // remove the bad images from the folder.
    fs.readdir(folder_dir, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(path.join(folder_dir, file), err => {
          if (err) throw err;
        });
      }
    });
  }

  let image = folder_dir + "/" + Math.random() + "_" + `${new Date().getTime()}.jpeg`;

  // add photo into the directory
  await fs.writeFile(image, buf, {encoding: 'base64'},async (err)=>{
    if (err) throw err;
    console.log("saved: " + image);
    const img = await canvas.loadImage(image);
    console.log("studengIdName: "+ studentIdName);
    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    const array = [];
    for (let i=0; i<recognitionData.length; i++){
      const obj = { label: recognitionData[i].label };
      if (recognitionData[i].label == studentIdName){
        obj.descriptors = [];
        if (typeof detections != 'undefined') {
          [detections.descriptor].forEach(descriptor => {
            const des = Array.prototype.slice.call(descriptor);
            obj.descriptors.push(des);
          });
        } else{
         console.log("undefined");
        }
      } else{
        obj.descriptors = [];
        recognitionData[i].descriptors.forEach(descriptor => {
          const des = Array.prototype.slice.call(descriptor);
          obj.descriptors.push(des);
        });
      }
      array.push(obj);
    }
    const json = JSON.stringify(array, null, 4);
    fs.writeFileSync(env.recData, json, 'utf8');
    console.log("updated recData.json.");
    return;
  });


}

// recognize face from image
// used in '/recdata' to form RecData.json as reference database
controller.prototype.recognizeFaceFromFaceDB = async function(){
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
          try {
            const img = await canvas.loadImage(env.faceDB + label + '/' + images[i]);
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            if (typeof detections != 'undefined') {
              descriptions.push(detections.descriptor);
              console.log('finished loading ' + images[i] + '\t\t detected');
            } else console.log('finished loading ' + images[i] + '\t\t undetected');
          } catch(err){
            // error in loading image
            continue;
          }
        }
        return {label: label, descriptors: descriptions};
    }));
  }catch(err){ throw 'Error in controller/faceDetector.js (recognizeFace):\n'+err; }
}

// get RecData
async function recogData(data){
  try{
    return Promise.all(data.map(d => {
      return new faceapi.LabeledFaceDescriptors(d.label, d.descriptors);
    }))
  }catch(err){ throw 'Error in faceDetector.js (recogData):\n'+err; }
}

module.exports = controller;
