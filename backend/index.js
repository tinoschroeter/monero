const express = require("express");
const app = express();

const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST',
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.get("/", (req, res) => {
  let miner = [];
  let data, logs;

  pool
    .query("SELECT * FROM minergate ORDER BY id desc LIMIT 1")
    .then((result) => {
      data = result;
      pool
        .query("SELECT logs FROM cpuminerlogs ORDER BY id desc LIMIT 20")
        .then((result) => {
          logs = result;

          delete data.rows[0].id;
          delete data.rows[0].time;

          miner.push(data.rows[0]);
          miner.push(logs.rows);

          res.json({ miner });
        });
    })
    .catch((e) => {
      console.error(e);
      res.status(500).end();
    });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`app listening at Port ${port}`);
});
