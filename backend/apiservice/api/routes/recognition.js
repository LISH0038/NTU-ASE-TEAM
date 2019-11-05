const express = require('express'),
    router = express.Router(),
    pool = require('../db/pool');
    env = require(process.env.node_env),
    jsonfile = require('jsonfile'),
    controller = require('../controllers/faceDetector.js'),
    getStudentStatus = require('../utility/getStudentStatus');


router.post('/', function(req, res, next) {
  let absentStudents = [];
  let recognizedStudentList = [];

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
      let session_start_time = rows[0][0].start_time;
      let session_late_time = session_start_time + rows[0][0].late_time*60;
      let session_absent_time = session_start_time + rows[0][0].absent_time*60;
      console.log("start:" + session_start_time + ";late:" + session_late_time + ";absent:" + session_absent_time);

      // const current_time = Math.floor(Date.now()/1000);
      const current_time = 1570176001;

      const var_controller = new controller();

      // get RecData.json in a list
      const labeledDescriptor = [];
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

      var_controller.detectFace(labeledDescriptor,req.body.imageName, function(returnedIds){
        let recognizedStudentList = [];
        console.log("Absent students:" + absentStudents);
        console.log(returnedIds.length);
        for (let i = 0; i < returnedIds.length; i++) {
          let studentId = returnedIds[i];
          console.log("studentId:" + studentId);

          pool.query('CALL get_student(?)', [studentId], function (err, rows, fields) {
            if (err || rows[0].length == 0) {
              console.log("no students found.");
            } else {
              let studentName = rows[0][0].student_name;
              let status = getStudentStatus(current_time, session_start_time, session_late_time, session_absent_time);
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
        };
      }).catch(function(err){
        console.log(err);
        res.send(err);
      });
    });
  });
});

module.exports = router;
