var express = require('express');
var router = express.Router();
var pool = require('../db/pool');

/* GET home page. */
router.get('/:courseId', function(req, res, next) {
  pool.query('CALL get_class(?)', [req.params.courseId], function (err, rows, fields) {
      if (err) throw new Error(err)
      res.json(rows[0][0]);
  })
});

module.exports = router;
