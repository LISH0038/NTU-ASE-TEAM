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
              await save_images(req.body.images, studentIdName).then(()=>{
              pool.query('CALL get_student_status(?,?)', [req.body.sessionId, req.body.studentId], function (err, rows, fields) {
                let student_status = rows[0][0].attend_status;

                if (student_status=="absent"){
                  // const current_time = Math.floor(Date.now()/1000);
                  const current_time = 1570176010;
                  pool.query('CALL get_class_start_late_absent_time(?)',[req.body.sessionId],async function (err,rows,fields) {
                    if (err) return res.status(500).send('Error when retrieving the session');
                    if (rows[0].length == 0) return res.status(404).send('The session id was not found');
                    let session_start_time = rows[0][0].start_time;
                    let session_late_time = session_start_time + rows[0][0].late_time * 60;
                    let session_absent_time = session_start_time + rows[0][0].absent_time * 60;
                    student_status = getStudentStatus(current_time, session_start_time, session_late_time, session_absent_time);
                    pool.query('CALL update_student_status(?,?,?,?)', [req.body.sessionId, studentId, student_status, current_time], function (err,rows,fields) {
                      if (err) return res.status(500).send('Error when updating the student status');
                      return res.status(200).send(
                          {id: studentId,
                            name: studentName,
                            status: student_status});
                    });
                  });
                } else{
                  return res.status(200).send();
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
  let image = env.faceDB + studentIdName + "/" + `${new Date().getTime()}.jpeg`;
  await fs.writeFile(image, buf, {encoding: 'base64'});
}

async function save_images(images, studentIdName, res){
  let promises = images.map(imageBase64String => save_each_image(imageBase64String,studentIdName));
  await Promise.all(promises);
}

module.exports = router;
