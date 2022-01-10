const Tail = require("tail").Tail;
const tail = new Tail("/var/log/metrics.log");

const { Client } = require("pg");

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

client.connect();

console.log("starting log shipper...");
tail.on("line", (data) => {
  const query = `INSERT INTO cpuminerlogs(logs) VALUES ('${data}')`;
  console.log(query);

  client.query(query, (err, res) => {
    if (err) {
      console.error(err);
      return;
    }
  });
});
