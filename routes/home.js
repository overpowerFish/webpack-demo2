const express = require('express');
const { resFormatter } = require('../utils/format');
const router = express.Router();
const validateSession = require('../utils/validateSession');

router.get('/list', function (req, res, next) {
  if (validateSession(req, res)) {
    res.json(resFormatter('no list'))
  }
})

module.exports = router;