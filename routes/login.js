const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const { v4 } = require('uuid');
const moment = require('moment');
const { resFormatter } = require('../utils/format');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'live_streaming',
})

connection.connect();
const maxAge = 600000;
const cookieOpts = {
  maxAge: maxAge,
  httpOnly: true,
}

router.post('/', function (req, res, next) {
  const { body, headers: { cookie } } = req;
  try {
    if (body.type === 'register') {
      if (body.inviteCode === '220') {
        // 查询是否重复
        const querySql = 'SELECT * FROM user_table WHERE username=?';
        connection.query(querySql, [body.username], (err, result) => {
          if (err) {
            res.send(err)
            return;
          }
          if (result.length) {
            res.json(resFormatter(null, 'FAIL', '用户名重复'));
          } else {
            const timeStamp = moment().valueOf();
            const sessionId = v4();
            const insertSql = `INSERT INTO user_table(username, pwd, sessionId, sessionExpiredTime) VALUES ('${body.username}', '${body.pwd}', '${sessionId}', str_to_date( '${moment(timeStamp + maxAge).format('YYYY-MM-DD HH:mm:ss')}', '%Y-%m-%d %H:%i:%s'))`;
            connection.query(insertSql, (err, result) => {
              if (err) {
                res.json(resFormatter('', 'FAIL', err))
                return;
              }
              res.cookie('userId', sessionId, cookieOpts)
                .json(resFormatter('注册成功'))
            })
          }
        })
      } else {
        res.json(resFormatter(null, 'FAIL', '邀请码错误'));
      }
    } else if (body.type === 'login') {
      // 查询是否有该用户
      const querySql = `SELECT * FROM user_table WHERE username='${body.username}' AND pwd='${body.pwd}'`;
      connection.query(querySql, (err, result) => {
        if (err) {
          res.json(resFormatter('', 'FAIL', err))
          return;
        }
        if (result.length) {
          const timeStamp = moment().valueOf();
          const sessionId = v4();
          const updateSql = `UPDATE user_table SET sessionId='${sessionId}', sessionExpiredTime=str_to_date( '${moment(timeStamp + maxAge).format('YYYY-MM-DD HH:mm:ss')}', '%Y-%m-%d %H:%i:%s') WHERE username='${body.username}' AND pwd='${body.pwd}'`
          connection.query(updateSql, (err, result) => {
            if (err) {
              res.json(resFormatter('', 'FAIL', err))
              return;
            }
            res.cookie('userId', sessionId, cookieOpts)
              .json(resFormatter('登陆成功'))
          })
        } else {
          res.json(resFormatter(null, 'FAIL', '用户名或密码错误'))
        }
      })
    }
  } catch (err) {
    res.json(resFormatter(null, 'System Error', err));
  }
});

module.exports = router;