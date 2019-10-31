const express = require('express'),
    router = express.Router(),
    env = require(process.env.node_env),
    faceapi = require('face-api.js'),
    canvas = require('canvas'),
    path = require('path'),
    fetch = require('node-fetch'),
    tf = require('@tensorflow/tfjs-node'),
    jsonfile = require('jsonfile'),
    MODELS_URL = path.join(__dirname, '/../public/models/'),
    fs = require('fs-extra');
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData, fetch });
const regex_folder = RegExp('^[a-zA-Z][0-9]{7}[a-zA-Z]_.*'); // Folder name match in FaceDB
const regex_id = RegExp('^[a-zA-Z][0-9]{7}[a-zA-Z]'); // Matric id match in FaceDB

// generate recognition data
router.get('/', function(req,res){
    recognizeFace().then(function(data){
        const array = [];
        data.forEach(d => {
            const obj = { label: d.label }
            obj.descriptors = [];
            d.descriptors.forEach(descriptor => {
                const des = Array.prototype.slice.call(descriptor);
                obj.descriptors.push(des);
            });
            array.push(obj);
        });
        const json = JSON.stringify(array, null, 4);
        fs.writeFileSync(env.recData, json, 'utf8');
        res.send('Finished Loading recognition Data.');
    });
});

recognizeFace = async function(){
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_URL);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_URL);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_URL);
    const labels = await fs.readdir(env.faceDB);
    return Promise.all(labels.filter(label => regex_folder.test(label)).map(async label => {
        console.log(label);
        const descriptions = [];
        const images = await fs.readdir(env.faceDB + label);
        for (let i = 0; i < images.length; i++) {
            try {
                const img = await canvas.loadImage(env.faceDB + label + '/' + images[i]);
            } catch(err){
                console.log(err);
                continue;
            }
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            if (typeof detections != 'undefined') {
                descriptions.push(detections.descriptor);
                console.log('finished loading ' + images[i] + '\t\t detected');
            } else console.log('finished loading ' + images[i] + '\t\t undetected');
        }
        return {label: label, descriptors: descriptions};
    }));

};

module.exports = router;
