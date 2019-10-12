var express = require('express');
var router = express.Router();
var pool = require('../db/pool');
var cachedData = require('./cache');

/* Register new photos. */
router.post('/', function(req, res, next) {
  return res.status(upload_photos(req.body)).send();
});

function upload_photos(images){
  // todo: Simon
  const status = 200;
  return status;
}

module.exports = router;
