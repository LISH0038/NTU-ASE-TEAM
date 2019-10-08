var express = require('express');
var router = express.Router();
var pool = require('../db/pool');
var getStudentStatus = require('../utility/getStudentStatus');

router.post('/', function(req, res, next) {
  var absentStudents = [];
  var recognizedStudentList = [];

  pool.query('CALL get_absent_students(?)',[req.body.sessionId],function (err,rows,fields) {
    if (err) return res.status(500).send('Error when retrieving the session');
    if (rows[0].length == 0) return res.status(404).send('The session id was not found');
    rows[0].forEach(row => absentStudents.push(row.student_id));

    pool.query('CALL get_class_start_late_absent_time(?)',[req.body.sessionId],function (err,rows,fields) {
      if (err) return res.status(500).send('Error when retrieving the session');
      if (rows[0].length == 0) return res.status(404).send('The session id was not found');
      var session_start_time = rows[0][0].start_time;
      var session_late_time = session_start_time + rows[0][0].late_time*60;
      var session_absent_time = session_start_time + rows[0][0].absent_time*60;
      console.log("start:" + session_start_time + ";late:" + session_late_time + ";absent:" + session_absent_time);

      // const current_time = Math.floor(Date.now()/1000);
      const current_time = 1570176001;

      const recognizedStudentIds = getRecognisedIds(req.body.image,absentStudents);
      console.log("recognized: "+ recognizedStudentIds);
      for (let i=0; i< recognizedStudentIds.length; i++){
        var studentId = recognizedStudentIds[i];
        pool.query('CALL get_student(?)',[studentId],function (err,rows,fields) {
          var studentName = rows[0][0].student_name;
          var status = getStudentStatus(current_time, session_start_time, session_late_time, session_absent_time);
          // returned list
          recognizedStudentList.push({
            id: studentId,
            name: studentName,
            status: status
          });

          if (i == recognizedStudentIds.length-1){
            console.log(recognizedStudentList);
            return res.status(200).json(recognizedStudentList);
          }

          // todo: check update database
          pool.query('CALL update_student_status(?,?,?,?)',[req.body.sessionId,studentId,status,current_time]);
          console.log("session: " + req.body.sessionId + "; studentId: " + studentId + "; status: "+status+"; cur_time: " + current_time);
        });
      }
    });
  });

});

function getRecognisedIds(image,possible_students){
  //todo: Simon recognition, return list of student IDs
  return ["U0000001J","U0000002J"];
}

module.exports = router;
