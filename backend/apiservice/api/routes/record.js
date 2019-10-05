var express = require('express');
var router = express.Router();
var pool = require('../db/pool');

/* GET home page. */
router.get('/:sessionId', function(req, res, next) {
  res.json({"record_params": req.params})
});

module.exports = router;
