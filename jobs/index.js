const puppeteer = require("puppeteer");
const { Client } = require("pg");

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

client.connect();

getBalance();

async function getBalance() {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: "/usr/bin/chromium-browser",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 720 });
    await page.goto("https://minergate.com/login", {
      waitUntil: "networkidle0",
    });

    await page.type(
      ".login-form > form > .form-group > .form-control:nth-child(2)",
      process.env.MINERGATE_USER
    );
    await page.type(
      ".login-form > form > .form-group > .form-control:nth-child(4)",
      process.env.MINERGATE_PASS
    );
    await page.click(".form-container > .login-form > form > .buttons > .btn");
    await page.click(".form-container > .login-form > form > .buttons > .btn");

    await page._frameManager._mainFrame.waitForNavigation();

    await page.waitForSelector(
      ".mining-block > .exchange-small:nth-child(5) > div > .exchange-rate > .UIDropdown"
    );
    await page.select(
      ".mining-block > .exchange-small:nth-child(5) > div > .exchange-rate > .UIDropdown",
      "eur"
    );
    await page.waitForSelector(
      ".mining-block > .exchange-small:nth-child(5) > div > .exchange-rate > .UIDropdown"
    );
    await page.click(
      ".mining-block > .exchange-small:nth-child(5) > div > .exchange-rate > .UIDropdown"
    );

    await page.waitForSelector(".mining-block-mined-sum");
    const eur = await page.evaluate(
      () => document.querySelector(".mining-block-mined-sum").innerText
    );

    const mined = await page.evaluate(
      () =>
        document.querySelector(
          ".col-xs-12:nth-child(8) > .mining-panel > .row > .col-xs-6 > .mining-block > .data > .subdata:nth-child(1) > b:nth-child(2)"
        ).innerText
    );

    const goodShares = await page.evaluate(
      () =>
        document.querySelector(
          ".col-xs-12:nth-child(8) > .mining-panel > .row > .col-xs-6 > .mining-block > .data > .subdata:nth-child(2) > b:nth-child(2)"
        ).innerText
    );

    const badShares = await page.evaluate(
      () =>
        document.querySelector(
          ".col-xs-12:nth-child(8) > .mining-panel > .row > .col-xs-6 > .mining-block > .data > .subdata:nth-child(3) > b"
        ).innerText
    );

    await browser.close();

    const query = `INSERT INTO minergate(eur, mined, goodshares, badshares, time) VALUES (${eur}, ${mined}, ${goodShares}, ${badShares}, NOW())`;
    console.log(query);

    client.query(query, (err, res) => {
      if (err) {
        console.error(err);
        client.end();
        return;
      }
      console.log(res);
      client.end();
    });
  } catch (e) {
    console.log(e);
    client.end();
  }
}
