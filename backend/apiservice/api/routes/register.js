var express = require('express');
var router = express.Router();
var pool = require('../db/pool');


/* Register new photos. */
router.post('/', function(req, res, next) {
  pool.query('CALL get_class_start_late_absent_time(?)',[req.body.sessionId],function (err,rows,fields){
    if (err) return res.status(500).send('Error when retrieving the session');
    if (rows[0].length == 0) return res.status(404).send('The session id was not found');
    var class_index = rows[0][0].class_index;

    pool.query('CALL get_student_id_in_class(?,?)',[class_index, req.body.studentId],function (err,rows,fields) {
      if (err) return res.status(500).send('Error when retrieving the session');
      if (rows[0].length == 0) return res.status(404).send('The student is not supposed to be in the class');
      var status = upload_photos(req.body.images,req.body.studentId);
      return res.status(status).send(status);
    });

  });

});

function upload_photos(images,studentId){
  // todo: Simon
  const status = 200;
  return status;
}

module.exports = router;
