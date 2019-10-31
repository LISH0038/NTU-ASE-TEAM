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
    var studentList = [];

    pool.query('CALL get_class_start_late_absent_time(?)',[req.params.sessionId],function (err,rows,fields) {
        console.log(err)
        if (err) return res.status(500).send('Error when retrieving the session');
        if (rows[0].length == 0) return res.status(404).send('The session id is not found');
        else{
            class_index = rows[0][0].class_index;
            pool.query('CALL get_complete_report(?)',[req.params.sessionId],function (err,rows,fields) {
                if (err) return res.status(500).send('Error when retrieving the session');
                if (rows[0].length == 0) return res.status(404).send('The session id is not found');
                else{
                    console.log(rows[0])
                    rows[0].forEach(row => studentList.push({
                        id: row.student_id,
                        name: row.student_name,
                        attendance: row.attend_status,
                        email: row.email
                    }));
                    return res.status(200).send({
                        index: class_index,
                        sessionId: req.params.sessionId,
                        students: studentList
                    });
                }

            });
        }
    });


});

router.patch('/:sessionId', function(req, res, next) {
    // 400 Bad Request for wrong class index
    const {error} = validateSession(req.params.sessionId);
    if (error)
        return res.status(400).send("The session index can only be integers.");

    let arrival_time = 1000000000
    pool.query('CALL update_student_status(?,?,?,?)',[req.params.sessionId,req.body.studentId,req.body.attendance,arrival_time],function (err,rows,fields) {
        console.log(err)
        if (err) return res.status(500).send('Error when updating the student status');
        else{
            return res.status(200).send()
        }
    });
});

// validate the class index is integers.
function validateSession(sessionId){
    const pattern_class = /^[0-9]+$/;
    const schema = Joi.string().regex(pattern_class);
    return Joi.validate(sessionId,schema);
}

module.exports = router;
