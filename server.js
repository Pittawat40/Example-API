const express = require('express')
const mysql = require('mysql');

const cors = require('cors')

const moment = require('moment');

const app = express()
app.use(express.json())
app.use(cors())

const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'node-project',
    port     : '8889'
});

connection.connect((err) => {
    if (err) {
        console.log("Error connect db !!")
        return
    }
    console.log("Connect db success !!")
    console.log("==========================")
})

app.get('/', function (req, res) {
    res.send('Hello World')
})

app.get('/home', async (req, res) => {
    const { take, skip } = req.query

    try {
        let query = "SELECT id, name, description, price, post_code FROM house WHERE delete_flag = '0'"
        if (take && skip) query = `${query} LIMIT ${take} OFFSET ${skip}`

        connection.query(query,
        (err, result) => {
            if (err) {
                console.log(err)
                res.status(400).send({ message:"Get data fail !!"})
            }
            res.status(200).json({ message: "Get Success !!", payload: result, count: result.length})
        })

    } catch (err) {
        console.log(err)
        res.status(500).send({ message: "Something wrong !!", payload: []})
    }
})

///////  CREATE DATA  ///////
app.post('/home', async (req, res) => {
    const { name, desc, price, post_code } = req.body
    let arr = [name, desc, price, post_code]
    if (arr.includes(undefined)) return res.status(400).send({ message: "Invalid Data !!", payload: []})

    let checkData = await checkInt([price, post_code])
    if (!checkData) return res.status(400).send({ message: "Data type Error !!", payload: []})

    try {
        connection.query("INSERT INTO house(name, description, price, post_code) VALUES(?, ?, ?, ?)",
        [name, desc, price, post_code],
        (err, result) => {
            if (err) {
                console.log(err)
                res.status(400).send({ message:"Insert Error !!", payload: []})
            }
            res.status(200).json({ message: "Insert Success !!", payload: []})
        })

    } catch (err) {
        console.log(err)
        res.status(500).send({ message:"Something wrong !!"})
    }
})

app.get('/postCode', async (req, res) => {
    try {
        connection.query("SELECT DISTINCT post_code FROM house WHERE delete_flag = '0'",
        (err, result) => {
            if (err) {
                console.log(err)
                res.status(400).send({ message:"Get data fail !!", payload: []})
            }
            res.status(200).json({ message: "Get Success !!", payload: result, count: result.length})
        })

    } catch (err) {
        console.log(err)
        res.status(500).send({ message:"Something wrong !!", payload: []})
    }
})

app.get('/postCode/:id', async (req, res) => {
    const id = req.query.id
    if (!id) return res.status(400).send({ message: "Invalid Data !!", payload: []})

    try {
        connection.query(`SELECT price FROM house WHERE post_code = ${id}`,
        (err, result) => {
            if (err) {
                console.log(err)
                res.status(400).send({ message:"Get data fail !!", payload: []})
            }

            let arr = []
            let { average, median } = 0
            if (result.length > 0) {
                for (const r of result) {
                    arr.push(r.price)
                }
                let sum = arr.reduce((a, b) => a + b);
                average = sum / arr.length

                arr.sort((a, b) => a - b);

                let half = Math.floor(arr.length / 2);
                if (arr.length % 2) median = arr[half];
                else median = (arr[half - 1] + arr[half]) / 2;

                res.status(200).json({ message: "Get Success !!", payload: { average: average, median: median }})
            } else res.status(200).json({ message: "Get Success (data not found) !!", payload: []})
        })

    } catch (err) {
        console.log(err)
        res.status(500).send({ message:"Something wrong !!", payload: []})
    }
})

///////  UPDATE DATA  ///////
app.patch('/home/:id', async (req, res) => {
    const id = req.query.id
    if (!id) return res.status(400).send({ message: "Invalid Data !!", payload: []})

    if (Object.keys(req.body).length === 0) return res.status(400).send({ message: "Invalid Data !!"})
    const { name, desc, price, post_code } = req.body

    let checkData = await checkInt([price, post_code])
    if (!checkData) return res.status(400).send({ message: "Data type Error !!", payload: []})

    try {
        let date = new Date()
        let newDate = moment(date).format('YYYY-MM-DD HH:mm:ss')

        let query = `UPDATE house SET 
                    ${name ? `name = '${name}',` : "" } 
                    ${desc ? `description = '${desc}',` : "" } 
                    ${price ? `price = '${price}',` : "" } 
                    ${post_code ? `post_code = '${post_code}',` : "" }
                    update_dt = '${newDate}'
                    WHERE id = ${id}`

        connection.query(query, (err, result) => {
            if (err) {
                console.log(err)
                res.status(400).send({ message: "Update data fail !!", payload: []})
            }

            connection.query(`SELECT name, description, price, post_code FROM house WHERE id = ${id}`,
            (err, result) => {
                if (err) {
                    console.log(err)
                    res.status(400).send({ message: "Get new data fail !!", payload: []})
                }

               res.status(200).json({ message: "Update Success !!", payload: result})
            })
        })

    } catch (err) {
        console.log(err)
        res.status(500).send({ message:"Something wrong !!", payload: []})
    }
})

///////  DELETE DATA  ///////
app.delete('/home/:id', async (req, res) => {
    const id = req.query.id
    if (!id) return res.status(400).send({ message: "Invalid Data !!", payload: []})

    try {
        let date = new Date()
        let newDate = moment(date).format('YYYY-MM-DD HH:mm:ss')

        let query = `UPDATE house SET update_dt = '${newDate}', delete_flag = '1' WHERE id = '${id}'`

        connection.query(query, (err, result) => {
            if (err) {
                console.log(err)
                res.status(400).send({ message: "Delete data fail !!", payload: []})
            }

            res.status(200).json({ message: "Delete data Success !!", payload: []})
        })

    } catch (err) {
        console.log(err)
        res.status(500).send({ message:"Something wrong !!", payload: []})
    }
})

async function checkInt(...data) {
    for (const d of data) {
        if (!(d !== null && d !== "" && parseInt(d) == Number(parseInt(d)))) return false 
    }
    return true
}

app.listen(3000, ()=> {
    console.log("==========================")
    console.log("Node API app is running !!")
})