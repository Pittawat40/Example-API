const express = require("express");
const mysql = require("mysql");

const cors = require("cors");

const moment = require("moment");

const app = express();
app.use(express.json());
app.use(cors());

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: null,
  database: "lucky_draw",
});

connection.connect((err) => {
  if (err) {
    console.log("Error connect db !!");
    return;
  }
  console.log("Connect db success !!");
  console.log("==========================");

  let firstCreateQuery = `CREATE TABLE IF NOT EXISTS user (
                  id int,
                  name varchar(255),
                  password varchar(255),
                  active int,
                  role varchar(255),
                  update_dt DATETIME,
                  PRIMARY KEY (id)
              )`;

  connection.query(firstCreateQuery, (err, response) => {
    if (err) console.log(err);
    else console.log("Create db success !!");
  });

  let firstInsertQuery = `INSERT INTO user (id, name, password, active, role, update_dt) VALUES
      (1, 'admin', 'admin', 1, 'admin', '2025-03-10 01:55:12'),
      (2, 'arm', '1234', 1, 'user', '2025-03-10 10:29:02'),
      (3, 'bow', '1234', 0, 'user', '2025-03-09 20:17:31'),
      (4, 'boy', '1234', 1, 'user', '2025-03-09 20:17:37'),
      (5, 'go', '1234', 1, 'user', '2025-03-09 20:19:51'),
      (6, 'jack', '1234', 0, 'user', '2025-03-09 20:22:47'),
      (7, 'jo', '1234', 0, 'user', '2025-03-09 20:22:54'),
      (8, 'joy', '1234', 0, 'user', '2025-03-09 20:23:12'),
      (9, 'man', '1234', 0, 'user', '2025-03-09 20:23:24'),
      (10, 'sand', '1234', 0, 'user', '2025-03-09 20:23:34'),
      (11, 'may', '1234', 0, 'user', '2025-03-09 20:23:46'),
      (12, 'chom', '1234', 0, 'user', '2025-03-09 20:37:00'),
      (13, 'warm', '1234', 0, 'user', '2025-03-09 22:58:26'),
      (14, 'ta', '1234', 0, 'user', '2025-03-09 22:58:32'),
      (15, 'pop', '1234', 0, 'user', '2025-03-09 22:58:39'),
      (16, 'bee', '1234', 0, 'user', '2025-03-09 22:58:47'),
      (17, 'tae', '1234', 0, 'user', '2025-03-09 22:58:54'),
      (18, 'tang', '1234', 0, 'user', '2025-03-09 22:59:02'),
      (19, 'aom', '1234', 0, 'user', '2025-03-09 23:56:09'),
      (20, 'game', '1234', 0, 'user', '2025-03-09 23:56:09')
      ON DUPLICATE KEY UPDATE id = id`;

  connection.query(firstInsertQuery, (err, response) => {
    if (err) console.log(err);
    else {
      console.log("Insert db success !!");
      console.log("==========================");
    }
  });

  let secondCreateQuery = `CREATE TABLE IF NOT EXISTS activity (
                  id int,
                  name varchar(255),
                  location varchar(255),
                  flag_random int,
                  user_id varchar(255),
                  update_dt DATETIME,
                  PRIMARY KEY (id)
              )`;

  connection.query(secondCreateQuery, (err, response) => {
    if (err) console.log(err);
    else console.log("Create db success !!");
  });

  let secondInsertQuery = `INSERT INTO activity (id, name, location, flag_random, user_id, update_dt) VALUES
      (1, 'DANCING AT LUGHNASA', 'มหาวิทยาลัยกรุงเทพ', 0, '', '0000-00-00 00:00:00'),
      (2, 'FUDDY MEERS', 'มหาวิทยาลัยกรุงเทพ', 1, '16,6,15,14,5,13,4,3,11,17', '2025-03-10 01:52:52'),
      (3, 'Mission Impossibamm Concert', 'The Street Hall, The Street Ratchada', 1, '1,3,12,5,9,4,7,11,8,6', '2025-03-09 22:47:41'),
      (4, 'Layzy Music Festival', 'SEA SAND SUN RESORT, HUAHIN', 0, '', '0000-00-00 00:00:00'),
      (5, 'HOLLY JOLLY FUN RUN', 'Sri Nakhon Khuean Khan Park (Bang Krachao), Samut Prakan', 0, '', '0000-00-00 00:00:00'),
      (6, 'SIAM J-SHOW FAN CONCERT', 'โรงละครสยามแฟนตาซี (เอเชียทีค เดอะ ริเวอร์ฟร้อนท์)', 0, '', '0000-00-00 00:00:00'),
      (7, 'James Alyn - Coming Home Concert', 'Lido Connect, Hall 3', 1, '3,5,1,16,18,17,7,10,12,13', '2025-03-10 00:25:23'),
      (8, 'MU:IN PRESENTS MR.BLACK', '5th floor of Donki Mall. ', 1, '6,11,16,3,8,18,12,5,17,14', '2025-03-09 22:59:34')
      ON DUPLICATE KEY UPDATE id = id`;

  connection.query(secondInsertQuery, (err, response) => {
    if (err) console.log(err);
    else {
      console.log("Insert db success !!");
      console.log("==========================");
    }
  });
});

/// login ///
app.post("/login", async (req, res) => {
  const { name, password } = req.body;
  let arr = [name, password];
  if (arr.includes(undefined))
    return res
      .status(200)
      .send({ message: "Please enter this field !!", payload: [], result: 0 });

  try {
    let query = `SELECT * FROM user WHERE name = '${name}'`;
    connection.query(query, (err, response) => {
      if (err) {
        console.log(err);
        res
          .status(400)
          .send({ message: "Get data fail !!", payload: [], result: 0 });
      }

      let date = new Date();
      let newDate = moment(date).format("YYYY-MM-DD HH:mm:ss");

      if (response.length) {
        if (response[0].password != password) {
          return res
            .status(200)
            .send({ message: "Password not match !!", payload: [], result: 0 });
        }

        try {
          let query = `UPDATE user SET 
                            active = '1' ,
                            update_dt = '${newDate}'
                            WHERE id = ${response[0].id}`;

          connection.query(query, (err, result) => {
            if (err) {
              console.log(err);
              res.status(400).send({
                message: "Update data fail !!",
                payload: [],
                result: 0,
              });
            }
            res.status(200).json({
              message: "Login Success !!",
              payload: response[0],
              result: 1,
            });
          });
        } catch (err) {
          console.log(err);
          res
            .status(500)
            .send({ message: "Something wrong !!", payload: [], result: 0 });
        }
      } else {
        try {
          connection.query(
            "INSERT INTO user(name, password, active, role, update_dt) VALUES(?, ?, ?, ?, ?)",
            [name, password, 1, "user", newDate],
            (err, data) => {
              if (err) {
                console.log(err);
                res
                  .status(400)
                  .send({ message: "Login Error !!", payload: [], result: 0 });
              }

              let query = `SELECT * FROM user WHERE id = '${data.insertId}'`;
              connection.query(query, (err, newData) => {
                if (err) {
                  console.log(err);
                  res.status(400).send({
                    message: "Get data fail !!",
                    payload: [],
                    result: 0,
                  });
                }

                res.status(200).json({
                  message: "Login Success !!",
                  payload: newData[0],
                  result: 1,
                });
              });
            }
          );
        } catch (err) {
          console.log(err);
          res
            .status(500)
            .send({ message: "Something wrong !!", payload: [], result: 0 });
        }
      }
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ message: "Something wrong !!", payload: [], result: 0 });
  }
});

/// logout ///
app.post("/logout/:id", async (req, res) => {
  const id = req.params.id;
  if (!id)
    return res
      .status(200)
      .send({ message: "Please enter this field !!", payload: [], result: 0 });

  try {
    let date = new Date();
    let newDate = moment(date).format("YYYY-MM-DD HH:mm:ss");

    let query = `UPDATE user SET event_id = null, active = '0', update_dt = '${newDate}' WHERE id = '${id}'`;

    connection.query(query, (err, result) => {
      if (err) {
        console.log(err);
        res
          .status(400)
          .send({ message: "Logout fail !!", payload: [], result: 0 });
      }

      res
        .status(200)
        .json({ message: "Logout Success !!", payload: [], result: 1 });
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ message: "Something wrong !!", payload: [], result: 0 });
  }
});

/// list activity ///
app.get("/activity", async (req, res) => {
  try {
    let query = `SELECT * FROM activity`;
    // if (take && skip) query = `${query} LIMIT ${take} OFFSET ${skip}`;

    connection.query(query, (err, result) => {
      if (err) {
        console.log(err);
        res
          .status(400)
          .send({ message: "Get data fail !!", payload: [], result: 0 });
      }
      res.status(200).json({
        message: "Get Success !!",
        payload: result,
        count: result.length,
        result: 1,
      });
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ message: "Something wrong !!", payload: [], result: 0 });
  }
});

/// get activity detail ///
app.get("/activity/:id", async (req, res) => {
  const id = req.params.id;
  if (!id)
    return res
      .status(200)
      .send({ message: "Please enter this field !!", payload: [], result: 0 });

  try {
    let query = `SELECT * FROM activity WHERE id = ${id}`;

    connection.query(query, (err, result) => {
      if (err) {
        console.log(err);
        res
          .status(400)
          .send({ message: "Get Data fail !!", payload: [], result: 0 });
      }

      let userList = [];
      if (result[0].user_id) {
        let query = `SELECT * FROM user WHERE id IN (${result[0].user_id})`;

        connection.query(query, (err, response) => {
          if (err) {
            console.log(err);
            res
              .status(400)
              .send({ message: "Get Data fail !!", payload: [], result: 0 });
          }

          userList = response;
          result[0].userList = userList;
          delete result[0].user_id;

          res.status(200).json({
            message: "Get Data Success !!",
            payload: result[0],
            result: 1,
          });
        });
      } else {
        delete result[0].user_id;
        res.status(200).json({
          message: "Get Data Success !!",
          payload: result[0],
          result: 1,
        });
      }
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ message: "Something wrong !!", payload: [], result: 0 });
  }
});

/// random lucky ///
app.get("/random/:id", async (req, res) => {
  const id = req.params.id;
  if (!id)
    return res
      .status(200)
      .send({ message: "Please enter this field !!", payload: [], result: 0 });

  try {
    let query = `SELECT * FROM user WHERE role != 'admin'`;

    connection.query(query, (err, result) => {
      if (err) {
        console.log(err);
        res
          .status(400)
          .send({ message: "Get data fail !!", payload: [], result: 0 });
      }

      if (result.length) {
        let arrayLucky = [];
        let userId = [];
        let array = [...result];
        let totalLucky = 10;
        for (let i = 0; i < totalLucky; i++) {
          const index = Math.floor(Math.random() * array.length);
          let data = array.splice(index, 1)[0];
          userId.push(data.id);
          arrayLucky.push(data);
        }

        try {
          let date = new Date();
          let newDate = moment(date).format("YYYY-MM-DD HH:mm:ss");

          let query = `UPDATE activity SET
                            flag_random = '1',
                            update_dt = '${newDate}',
                            user_id = '${userId}'
                            WHERE id = ${id}`;

          connection.query(query, (err, result) => {
            if (err) {
              console.log(err);
              res.status(400).send({
                message: "Update Data fail !!",
                payload: [],
                result: 0,
              });
            }

            res.status(200).json({
              message: "Update Data Success !!",
              payload: arrayLucky,
              result: 1,
            });
          });
        } catch (err) {
          console.log(err);
          res
            .status(500)
            .send({ message: "Something wrong !!", payload: [], result: 0 });
        }
      }
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send({ message: "Something wrong !!", payload: [], result: 0 });
  }
});

app.listen(4000, () => {
  console.log("==========================");
  console.log("Node API app is running !!");
});
