var express = require('express');
var router = express.Router();
var pool = require('../db/pool');
const Joi = require('joi');
const data = require('../data.json');
var cachedData = require('./cache');
var getStudentName = require('../utility/getStudentName');
var getStudentListIdAndName = require('../utility/getStudentListIdAndName');

/* GET report. */
router.get('/:sessionId', function(req, res, next) {
  // 400 Bad Request for wrong class index
  const {error} = validateSession(req.params.sessionId);
  if (error)
    return res.status(400).send("The session index can only be integers.");

  // 404 if the session index is not in the database
  const sessions = data.class_session.filter(sessions => sessions.session_id === parseInt(req.params.sessionId));
  if (!sessions) return res.status(404).send('The session index was not found');

  const class_index = sessions[0].class_index;
  const course = data.class.find(c => c.class_index === parseInt(class_index));
  if (!course) return res.status(404).send('The class index was not found.');

  const session_start_time = sessions[0].start_time;
  const session_late_time = session_start_time + course.late_time*60;
  const session_absent_time = session_start_time + course.absent_time*60;

  const studentsInClass = data.studentClass.filter(c => c.class_index === parseInt(class_index));
  const studentList = getStudentListIdAndName(studentsInClass);
  var presentList = [];
  var lateList = [];
  var absentList = studentList;
  console.log(studentsInClass);

  /**
   {
      "session_id": 1,
      "student_id": "U0000001J",
      "arrival_time": 1570176000,
      "status": "on-time"
    }
   */
  const studentsInSession = data.report.filter(report=>report.session_id === parseInt(req.params.sessionId));

  for (i=0;i<studentsInSession.length;i++){
    if (studentsInSession[i].status==="on-time"){
      presentList.unshift({
        id:studentsInSession[i].student_id,
        name:getStudentName(studentsInSession[i].student_id)
      });

      // remove from absentList
      for (j = 0; j < absentList.length; j++) {
        if (absentList[j].id === studentsInSession[i].student_id) {
          absentList.splice(j, 1);
          break;
        }
      }

    } else if (studentsInSession[i].status==="late") {
      lateList.unshift({
        id: studentsInSession[i].student_id,
        name: getStudentName(studentsInSession[i].student_id)
      });

      // remove from absentList
      for (j = 0; j < absentList.length; j++) {
        if (absentList[j].id === studentsInSession[i].student_id) {
          absentList.splice(j, 1);
          break;
        }
      }
    }
  }


  // refresh cachedData
  cachedData.class_index = course.class_index;
  cachedData.session_id =  parseInt(req.params.sessionId);
  cachedData.session_start_time = session_start_time;
  cachedData.session_late_time = session_late_time;
  cachedData.session_absent_time = session_absent_time;
  cachedData.absentList = studentList;

  return res.status(200).send({
    "index": course.class_index,
    "sessionId": parseInt(req.params.sessionId),
    "schedule": {
      "startTime": session_start_time,
      "lateTime": session_late_time,
      "endTime": session_absent_time
    },
    "presentList": presentList,
    "lateList": lateList,
    "absentList": absentList
  });

});

// validate the class index is integers.
function validateSession(sessionId){
  const pattern_class = /^[0-9]+$/;
  const schema = Joi.string().regex(pattern_class);
  return Joi.validate(sessionId,schema);
}

module.exports = router;
