const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const data = require('../data.json');
const Joi = require('joi');
var getStudentListIdAndName = require('../utility/getStudentListIdAndName');

/* GET home page. */
router.get('/:classId', function(req, res, next) {
  // 400 Bad Request for wrong class index
  const {error} = validateClass(req.params.classId);
  if (error) return res.status(400).send("The class index can only be 5 digit integers.");

  pool.query('CALL get_class(?)', [req.params.classId], function (err, rows, fields) {
    if (err) return res.status(500).send('Error when retriving class');

    if (rows[0].length == 0) return res.status(404).send('The class index was not found.');
    const course = rows[0][0];

    pool.query('CALL get_session_at_time(?, ?)', [req.params.classId, Math.floor(Date.now() / 1000)], function (err, rows, fields) {
      if (err) return res.status(500).send('Error when retriving session');
      if (rows[0].length == 0) return res.status(404).send('The session index was not found');

      const session = rows[0][0];
      const session_start_time = session.start_time;
      const session_late_time = session_start_time + course.late_time*60;
      const session_absent_time = session_start_time + course.absent_time*60;

      pool.query('CALL get_student_in_class(?)', [req.params.classId], function (err, rows, fields) {
        if (err) return res.status(500).send('Error when retriving student');
        const students = rows[0];

        return res.status(200).send({
          "index": course.class_index,
          "sessionId": session.session_id,
          "schedule": {
            "startTime": session_start_time,
            "lateTime": session_late_time,
            "endTime": session_absent_time
          },
          "studentList": students
        });
      });
    });
  });
});

// validate the class index is 5-digit integers.
function validateClass(classId){
  const pattern_class = /^[0-9]{5}$/;
  const schema = Joi.string().regex(pattern_class);
  return Joi.validate(classId,schema);
}


module.exports = router;
