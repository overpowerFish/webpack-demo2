const moment = require('moment');
const db = require('./pool');
const { resFormatter } = require('./format');

const validateSession = (req, res) => {
  const { cookies } = req;
  if (cookies.userId) {
    const querySql = `SELECT * FROM user_table WHERE sessionId='${cookies.userId}'`;
    db.query(querySql, (err, result) => {
      if (result.length && moment(result[0].sessionExpiredTime).valueOf() > moment().valueOf()) {
        return true;
      }
      res.json(resFormatter('', 'NEED_LOGIN', ''));
    })
  } else {
    res.json(resFormatter('', 'NEED_LOGIN', ''));
  }
}

module.exports = validateSession;