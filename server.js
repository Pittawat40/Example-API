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
});

/// login ///
app.post("/login", async (req, res) => {
  const { name, password } = req.body;
  let arr = [name, password];
  if (arr.includes(undefined))
    return res
      .status(400)
      .send({ message: "Invalid Data !!", payload: [], result: 0 });

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
      .status(400)
      .send({ message: "Invalid Data !!", payload: [], result: 0 });

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
  const { name, take, skip } = req.query;

  try {
    let query = `SELECT * FROM activity ${
      name ? `WHERE name = '${name}'` : ""
    }`;
    if (take && skip) query = `${query} LIMIT ${take} OFFSET ${skip}`;

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
      .status(400)
      .send({ message: "Invalid Data !!", payload: [], result: 0 });

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

/// update user join event ///
app.post("/user/:id", async (req, res) => {
  const id = req.params.id;
  if (!id)
    return res
      .status(400)
      .send({ message: "Invalid Data !!", payload: [], result: 0 });

  if (Object.keys(req.body).length === 0)
    return res
      .status(400)
      .send({ message: "Invalid Data !!", payload: [], result: 0 });
  const { event_id } = req.body;

  try {
    let date = new Date();
    let newDate = moment(date).format("YYYY-MM-DD HH:mm:ss");

    let query = `UPDATE user SET 
                    ${event_id ? `event_id = '${event_id}',` : ""}
                    update_dt = '${newDate}'
                    WHERE id = ${id}`;

    connection.query(query, (err, result) => {
      if (err) {
        console.log(err);
        res
          .status(400)
          .send({ message: "Update data fail !!", payload: [], result: 0 });
      }

      res
        .status(200)
        .json({ message: "Update Success !!", payload: [], result: 1 });
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
      .status(400)
      .send({ message: "Invalid Data !!", payload: [], result: 0 });

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
