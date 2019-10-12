const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const data = require('../data.json');
const Joi = require('joi');
var cachedData = require('./cache');
var getStudentListIdAndName = require('../utility/getStudentListIdAndName');

/* GET home page. */
router.get('/:classId', function(req, res, next) {
    // 400 Bad Request for wrong class index
    const {error} = validateClass(req.params.classId);
    if (error)
        return res.status(400).send("The class index can only be 5 digit integers.");

    // 404 if the class index is not in the database
    /**
     class: {
      "class_index":10000,
      "late_time": 15,
      "absent_time": 30
    }
     **/

    const course = data.class.find(c => c.class_index === parseInt(req.params.classId));
    if (!course) return res.status(404).send('The class index was not found.');

    const sessions = data.class_session.filter(sessions => sessions.class_index === parseInt(req.params.classId));
    /**
     session: {
      "class_index": 10001,
      "session_id": 1,
      "start_time": 1570176000
    }
     */
    const session = getSession(sessions);
    if (!session) return res.status(404).send('The session index was not found');

    const session_start_time = session.start_time;
    const session_late_time = session_start_time + course.late_time*60;
    const session_absent_time = session_start_time + course.absent_time*60;

    const studentsInClass = data.studentClass.filter(c => c.class_index === parseInt(req.params.classId));
    const studentList = getStudentListIdAndName(studentsInClass);

    cachedData.class_index = course.class_index;
    cachedData.session_id = session.session_id;
    cachedData.session_start_time = session_start_time;
    cachedData.session_late_time = session_late_time;
    cachedData.session_absent_time = session_absent_time;
    cachedData.absentList = studentList;

    return res.status(200).send({
        "index": course.class_index,
        "sessionId": session.session_id,
        "schedule": {
            "startTime": session_start_time,
            "lateTime": session_late_time,
            "endTime": session_absent_time
        },
        "studentList": studentList
    });

    // res.send(req.params);
  // pool.query('CALL get_class(?)', [req.params.classId], function (err, rows, fields) {
  //     if (err) throw new Error(err)
  //     res.json(rows[0][0]);
  // })
});

// validate the class index is 5-digit integers.
function validateClass(classId){
    const pattern_class = /^[0-9]{5}$/;
    const schema = Joi.string().regex(pattern_class);
    return Joi.validate(classId,schema);
}

// get the session with the unix time that is within 30 minutes difference from current time.
function getSession(sessions, time_diff = 30){
    //todo: change back afterwards
    // const current_time = Date.now()/1000;
    const current_time = 1570176001;
    for (i = 0; i < sessions.length; i++) {
        if (Math.abs(parseInt(sessions[i].start_time) - current_time) < time_diff * 60){
            return sessions[i];
        }
    }
    return null;
}

module.exports = router;

