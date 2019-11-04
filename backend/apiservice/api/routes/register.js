const express = require('express'),
        router = express.Router(),
        pool = require('../db/pool'),
        mkdirp = require('mkdirp'),
        faceapi = require('face-api.js'),
        canvas = require('canvas'),
        path = require('path'),
        fetch = require('node-fetch'),
        tf = require('@tensorflow/tfjs-node'),
        jsonfile = require('jsonfile'),
        MODELS_URL = path.join(__dirname, '/../public/models/'),
        fs = require('fs-extra'),
    base64ToImage = require('base64-to-image'),
    getStudentStatus = require('../utility/getStudentStatus');
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData, fetch });

/* Register new photos. */
router.post('/', function(req, res, next) {
  pool.query('CALL get_class_start_late_absent_time(?)',[req.body.sessionId],function (err,rows,fields){
    if (err) return res.status(500).send('Error when retrieving the session');
    if (rows[0].length == 0) return res.status(404).send('The session id was not found');
    var class_index = rows[0][0].class_index;

    pool.query('CALL get_student_with_id_in_class(?,?)',[class_index, req.body.studentId],async function (err,rows,fields) {
      if (err) return res.status(500).send('Error when retrieving the session');
      if (rows[0].length == 0) return res.status(404).send('The student is not supposed to be in the class');
      var studentId = rows[0][0].student_id;
      var studentName = rows[0][0].student_name;
      var studentIdName =  studentId + '_' + studentName;
      console.log(studentIdName);
      try {
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_URL);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_URL);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_URL);
        // create folder if it does not exist
        mkdirp(env.faceDB + studentIdName, async function (err) {
          if (err) {
            return res.status(500).send('Unable to create folder');
          } else {
            // remove files in folder
            fs.readdir(env.faceDB + studentIdName, (err, files) => {
              if (err) throw err;

              for (const file of files) {
                fs.unlink(path.join(directory, file), err => {
                  if (err) throw err;
                });
              }
            });
              await save_images(req.body.images, studentIdName).then(()=>{
                console.log("all images saved.");
              pool.query('CALL get_student_status(?,?)', [req.body.sessionId, req.body.studentId], function (err, rows, fields) {
                let student_status = rows[0][0].attend_status;
                console.log("current status: "+student_status);

                if (student_status=="absent"){
                  // const current_time = Math.floor(Date.now()/1000);
                  const current_time = 1570176010;
                  pool.query('CALL get_class_start_late_absent_time(?)',[req.body.sessionId],async function (err,rows,fields) {
                    if (err) return res.status(500).send('Error when retrieving the session');
                    if (rows[0].length == 0) return res.status(404).send('The session id was not found');
                    let session_start_time = rows[0][0].start_time;
                    let session_late_time = session_start_time + rows[0][0].late_time * 60;
                    let session_absent_time = session_start_time + rows[0][0].absent_time * 60;
                    let new_student_status = getStudentStatus(current_time, session_start_time, session_late_time, session_absent_time);
                    pool.query('CALL update_student_status(?,?,?,?)', [req.body.sessionId, studentId, new_student_status, current_time], function (err,rows,fields) {
                      if (err) return res.status(500).send('Error when updating the student status');
                      console.log("returning1: " + studentId + "_" + studentName + "_" + new_student_status);
                      return res.status(200).send(
                          {id: studentId,
                            name: studentName,
                            status: new_student_status});
                    });
                  });
                } else{
                  console.log("returning: " + studentId + "_" + studentName + "_" + student_status);
                  return res.status(200).send({id: studentId,
                    name: studentName,
                    status: student_status});
                }
              });
            });
          }
        });
      } catch(err){ throw 'Error in register.js (uploadFace):\n'+err; }
    });

  });

});

// save each image.
async function save_each_image(imageBase64String,studentIdName){
  let imageBase64 = await imageBase64String.replace(/^data:image\/\w+;base64,/, "");
  let buf = await new Buffer(imageBase64, 'base64');
  let image = env.faceDB + studentIdName + "/" + Math.random() + "_" + `${new Date().getTime()}.jpeg`;
  await fs.writeFile(image, buf, {encoding: 'base64'},async (err)=>{
    if (err) throw err;
    console.log("saved: " + image);
  });
}

async function save_images(images, studentIdName, res){
  console.log("Storing images.");
  let promises = await images.map(imageBase64String => save_each_image(imageBase64String,studentIdName));
  await Promise.all(promises);
}

module.exports = router;
