const express = require('express'),
    router = express.Router(),
    pool = require('../db/pool');
    env = require(process.env.node_env),
    jsonfile = require('jsonfile'),
    fs = require('fs-extra'),
    controller = require('../controllers/faceDetector.js'),
    getStudentStatus = require('../utility/getStudentStatus');

router.post('/', function(req, res, next) {
  var absentStudents = [];
  var recognizedStudentList = [];

  pool.query('CALL get_absent_students(?)',[req.body.sessionId],function (err,rows,fields) {
    if (err) return res.status(500).send('Error when retrieving the session');
    if (rows[0].length == 0) return res.status(404).send('The session id was not found');
    rows[0].forEach(row => absentStudents.push(row.student_id));
    console.log(absentStudents);

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

      console.log("testhere");

      cont.detectFace(labeledDescriptor, req.body.imageName).then(function(data){

        console.log(data);
        console.log("recognized: "+ data.recognizedStudentIds);
        for (let i=0; i< data.recognizedStudentIds.length; i++) {
          var studentId = data.recognizedStudentIds[i];
          if (!!absentStudents.includes(studentId)) {
            pool.query('CALL get_student(?)', [studentId], function (err, rows, fields) {
              var studentName = rows[0][0].student_name;
              var status = getStudentStatus(current_time, session_start_time, session_late_time, session_absent_time);
              // returned list
              recognizedStudentList.push({
                id: studentId,
                name: studentName,
                status: status
              });

              // todo: check update database
              pool.query('CALL update_student_status(?,?,?,?)', [req.body.sessionId, studentId, status, current_time]);
              console.log("session: " + req.body.sessionId + "; studentId: " + studentId + "; status: " + status + "; cur_time: " + current_time);

              // return
              if (i == data.recognizedStudentIds.length - 1) {
                console.log(recognizedStudentList);
                return res.status(200).json({
                  box: data.box,
                  // imageName: returnedJsonRecognized.imageName,
                  recognizedStudentIds: recognizedStudentList
                });
              }
            });
          }
        }
      });


    });
  });

});

// test with local image
async function getRecognisedIds(imageBase64){

}

module.exports = router;
