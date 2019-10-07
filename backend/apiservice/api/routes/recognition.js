var express = require('express');
var router = express.Router();
var pool = require('../db/pool');
const data = require('../data.json');
var cachedData = require('./cache');
var getStudentStatus = require('../utility/getStudentStatus');
var getStudentName = require('../utility/getStudentName');

router.post('/', function(req, res, next) {
  const studentIds = getRecognisedIds(req.body,cachedData.absentList);
  const recognizedStudentList = [];
  studentIds.forEach(studentId =>{
    const studentName = getStudentName(studentId);
    // const current_time = Math.floor(Date.now()/1000);
    const current_time = 1570176001;
    const status = getStudentStatus(current_time,
        cachedData.session_start_time,
        cachedData.session_late_time,
        cachedData.session_absent_time);

    // returned list
    recognizedStudentList.push({
      id: studentId,
      name: studentName
    });

    // update Report DB
    updateReportDB(studentId,cachedData.session_id, current_time,status);

    // update cached data
    if (status==="on-time") {
      cachedData.presentList.unshift({
        id: studentId,
        name: studentName
      });
    } else if (status==="late"){
      cachedData.lateList.unshift({
        id: studentId,
        name: studentName
      });
    }
    if (status !== "absent") {
      for (i = 0; i < cachedData.absentList.length; i++) {
        if (cachedData.absentList[i].id === studentId) {
          cachedData.absentList.splice(i, 1);
          break;
        }
      }
    }

  });
  console.log( cachedData);
  return res.status(200).json(recognizedStudentList);
});

function getRecognisedIds(image,possible_students){
  //todo: Simon recognition, return list of student IDs
  return ["U0000001J","U0000002J"];
}

function updateReportDB(studentId, sessionId, arrival_time,status){
  // mock db
  data.report.push({
    session_id: sessionId,
    studentId: studentId,
    arrival_time: arrival_time,
    status: status
  });
}

module.exports = router;
