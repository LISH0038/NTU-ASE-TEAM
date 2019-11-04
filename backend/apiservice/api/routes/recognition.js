const express = require('express'),
    router = express.Router(),
    pool = require('../db/pool');
    env = require(process.env.node_env),
    jsonfile = require('jsonfile'),
    fs = require('fs-extra'),
    controller = require('../controllers/faceDetector.js'),
    getStudentStatus = require('../utility/getStudentStatus');

global.Blob = require('blob'),
global.CUDA_VISIBLE_DEVICES="-1";

const faceapi = require('face-api.js'),
      canvas = require('canvas'),
      path = require('path'),
      fetch = require('node-fetch'),
      tf = require('@tensorflow/tfjs-node'),
      distanceThreshold = 0.4,
      MODELS_URL = path.join(__dirname, '/../public/models/'),
    base64ToImage = require('base64-to-image');

const regex_folder = RegExp('^[a-zA-Z][0-9]{7}[a-zA-Z]_.*'); // Folder name match in FaceDB
const regex_id = RegExp('^[a-zA-Z][0-9]{7}[a-zA-Z]'); // Matric id match in FaceDB

router.post('/', function(req, res, next) {
  var absentStudents = [];
  var recognizedStudentList = [];

  pool.query('CALL get_absent_students(?)',[req.body.sessionId],function (err,rows,fields) {
    if (err) return res.status(500).send('Error when retrieving the session');
    console.log("retrieved:");
    console.log(rows[0]);
    if (rows[0].length == 0) return res.status(404).send('The session id was not found');
    rows[0].forEach(row => absentStudents.push(row.student_id));
    console.log("absent students: " + absentStudents);

    pool.query('CALL get_class_start_late_absent_time(?)',[req.body.sessionId],async function (err,rows,fields) {
      if (err) return res.status(500).send('Error when retrieving the session');
      if (rows[0].length == 0) return res.status(404).send('The session id was not found');
      var session_start_time = rows[0][0].start_time;
      var session_late_time = session_start_time + rows[0][0].late_time*60;
      var session_absent_time = session_start_time + rows[0][0].absent_time*60;
      console.log("start:" + session_start_time + ";late:" + session_late_time + ";absent:" + session_absent_time);

      // const current_time = Math.floor(Date.now()/1000);
      const current_time = 1570176001;

      const cont = new controller();
      const labeledDescriptor = [];
      // const absentList = ['U0000004J'];
      const data = jsonfile.readFileSync(env.recData);
      // only look for reference students in the absent list
      data.forEach(d => {
        const obj = {label: d.label};
        let array = [];
        d.descriptors.forEach(descriptor => {
          const dat = new Float32Array(descriptor);
          array.push(dat);
        });
        obj.descriptors = array;
        labeledDescriptor.push(obj);
      });

      try{
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_URL);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_URL);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_URL);
        await faceapi.tf.setBackend('tensorflow');

        const labeledDescriptor = [];
        const data = jsonfile.readFileSync(env.recData);
        data.forEach(d => {
          const obj = {label: d.label};
          let array = [];
          d.descriptors.forEach(descriptor => {
            const dat = new Float32Array(descriptor);
            array.push(dat);
          });
          obj.descriptors = array;
          labeledDescriptor.push(obj);
        });

        const labeledFaceDescriptors = await recogData(labeledDescriptor);
        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, distanceThreshold);

        var imageBase64 = await req.body.imageName.replace(/^data:image\/\w+;base64,/, "");
        var buf = await new Buffer(imageBase64, 'base64');
        // var id = await env.images + '1.png';
        var image="/opt/images/"+`${new Date().getTime()}.jpeg`;
        fs.writeFile(image, buf, {encoding:'base64'}, async (err) => {
          if (err) throw err;
          const img = await canvas.loadImage(image);
          const canvas1 = faceapi.createCanvasFromMedia(img);
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
          const results = await resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
          console.log("results : " + results);
          console.log(results);
          console.log("===");

          const returnedIds = [];

          results.forEach((result, i) => {
            if (regex_id.test(result.toString().split("_")[0])) {
              returnedIds.push(result.toString().split("_")[0]);
            }
          });
          console.log("returnedIds: "+ returnedIds);
          // return { canvas: canvas1.toDataURL(), recognizedStudentIds: returnedIds};
          // returnedJson = {recognizedStudentIds: returnedIds};
          let recognizedStudentList = [];
          console.log("Absent students:" + absentStudents);
          console.log(returnedIds.length);
          for (let i = 0; i < returnedIds.length; i++) {
            var studentId = returnedIds[i];
            console.log("studentId:"+ studentId);

            pool.query('CALL get_student(?)', [studentId], function (err, rows, fields) {
              if (err || rows[0].length == 0) {
                console.log("no students found.");
              }
              else{
              var studentName = rows[0][0].student_name;
              var status = getStudentStatus(current_time, session_start_time, session_late_time, session_absent_time);
              // returned list
              recognizedStudentList.push({
                id: studentId,
                name: studentName,
                status: status
              });
              if (!!absentStudents.includes(studentId)) {

                // todo: check update database
                pool.query('CALL update_student_status(?,?,?,?)', [req.body.sessionId, studentId, status, current_time], function (err, rows, fields) {
                  console.log("session: " + req.body.sessionId + "; studentId: " + studentId + "; status: " + status + "; cur_time: " + current_time);
                });
              }

              // return
              if (i == returnedIds.length - 1) {
                console.log("Posting to frontend: " + recognizedStudentList);
                console.log(recognizedStudentList);
                return res.status(200).json({
                  recognizedStudentIds: recognizedStudentList
                });
              }
              }
              });
          }


        });
      }catch(err){ throw 'Error in controllers/faceDetector.js (detectFace):\n'+err; }

    });
  });

});

// convert picture into labeled face descriptors
async function recogData(data){
  try{
    return Promise.all(data.map(d => {
      return new faceapi.LabeledFaceDescriptors(d.label, d.descriptors);
    }))
  }catch(err){ throw 'Error in faceDetector.js (recogData):\n'+err; }
}

module.exports = router;
