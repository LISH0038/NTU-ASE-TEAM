var express = require('express');
var router = express.Router();
var pool = require('../db/pool');
const Joi = require('joi');

/* GET report. */
router.get('/:sessionId', function(req, res, next) {
  // 400 Bad Request for wrong class index
  const {error} = validateSession(req.params.sessionId);
  if (error)
    return res.status(400).send("The session index can only be integers.");

  var class_index;
  var onTimeList =[];
  var lateList = [];
  var absentList =[] ;
  var session_start_time;
  var session_late_time;
  var session_absent_time;

  // 404 if the session index is not in the database
  pool.query('CALL get_class_start_late_absent_time(?)',[req.params.sessionId],function (err,rows,fields) {
    if (err) return res.status(500).send('Error when retrieving the session');
    if (rows[0].length == 0) return res.status(404).send('The session id is not found');
    session_start_time = rows[0][0].start_time;
    session_late_time = session_start_time + rows[0][0].late_time*60;
    session_absent_time = session_start_time + rows[0][0].absent_time*60;
    class_index = rows[0][0].class_index;
    // console.log("session_start_time: " + session_start_time);

    pool.query('CALL get_on_time_students(?)',[req.params.sessionId],function (err,rows,fields) {
      if (err) return res.status(500).send('Error when retrieving the session');
      if (rows[0].length != 0) {
        rows[0].forEach(row => onTimeList.unshift({
          id: row.student_id,
          name: row.student_name
        }));
        // console.log("on time list: " + onTimeList);
      }

      pool.query('CALL get_late_students(?)',[req.params.sessionId],function (err,rows,fields) {
        if (err) return res.status(500).send('Error when retrieving the session');
        if (rows[0].length != 0) {
          rows[0].forEach(row => lateList.unshift({
            id: row.student_id,
            name: row.student_name
          }));
          // console.log("late time list: " + lateTimeList);
        }

        pool.query('CALL get_absent_students(?)',[req.params.sessionId],function (err,rows,fields) {
          if (err) return res.status(500).send('Error when retrieving the session');
          if (rows[0].length != 0) {
            rows[0].forEach(row => absentList.unshift({
              id: row.student_id,
              name: row.student_name
            }));
            // console.log("absent time list: " + absentList);
          }

          // console.log(JSON.stringify({
          //   index: class_index,
          //   sessionId: req.params.sessionId,
          //   schedule: {
          //     startTime: session_start_time,
          //     lateTime: session_late_time,
          //     endTime: session_absent_time
          //   },
          //   onTimeList: onTimeList,
          //   lateList: lateList,
          //   absentList: absentList
          // }));
          return res.status(200).send({
            index: class_index,
            sessionId: req.params.sessionId,
            schedule: {
              startTime: session_start_time,
              lateTime: session_late_time,
              endTime: session_absent_time
            },
            onTimeList: onTimeList,
            lateList: lateList,
            absentList: absentList
          });

        });

      });

    });

  });

});

// validate the class index is integers.
function validateSession(sessionId){
  const pattern_class = /^[0-9]+$/;
  const schema = Joi.string().regex(pattern_class);
  return Joi.validate(sessionId,schema);
}

module.exports = router;
