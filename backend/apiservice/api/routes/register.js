var express = require('express');
var router = express.Router();
var pool = require('../db/pool');

/* GET home page. */
router.post('/', function(req, res, next) {
  res.json({"register_body": req.body});
});

module.exports = router;