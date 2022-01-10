const hs = Math.round(window.screen.height / 9);
const ws = Math.round(window.screen.width / 4);

binary();
main();
setInterval(() => main(), 60000);

function main() {
  const page = document.querySelector("#page");
  page.innerHTML = "";
  binary();

  //Font: arrows
  //https://www.kammerl.de/ascii/AsciiSignature.php

  setText(1, 4, "111       111");
  setText(2, 4, "11 111   1111");
  setText(3, 4, "111 111 1 111    111     11111111    1111    11 1111    111");
  setText(4, 4, "111  111  111  111  111   111  111 11   111   111     111  111");
  setText(5, 4, "111   11  111 111    111  111  111 111111111  111    111    111");
  setText(6, 4, "111       111  111  111   111  111 11         111     111  111");
  setText(7, 4, "111       111    111     1111  111  111111   1111       111");

  fetch("/api", {
    method: "GET",
  })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      setText(9, 4, `${json.miner[0].eur} EUR`);
      setText(9, 24, `${json.miner[0].goodshares} Good Shares`);
      setText(9, 44, `${json.miner[0].mined} COINS`);

      setText(11, 4, "Logfiles:");
      setText(13, 4, `--${cut(json.miner[1][12].logs)}`, "red");
      setText(15, 4, `--${cut(json.miner[1][11].logs)}`, "red");

      setText(17, 4, `--${cut(json.miner[1][10].logs)}`, "red");
      setText(19, 4, `--${cut(json.miner[1][9].logs)}`, "red");
      setText(21, 4, `--${cut(json.miner[1][8].logs)}`, "red");

      setText(23, 4, `--${cut(json.miner[1][7].logs)}`, "red");
      setText(25, 4, `--${cut(json.miner[1][6].logs)}`, "red");

      setText(27, 4, `--${cut(json.miner[1][5].logs)}`, "red");
      setText(29, 4, `--${cut(json.miner[1][4].logs)}`, "red");
      setText(31, 4, `--${cut(json.miner[1][3].logs)}`, "red");

      setText(33, 4, `--${cut(json.miner[1][2].logs)}`, "red");
      setText(35, 4, `--${cut(json.miner[1][1].logs)}`, "red");
      setText(37, 4, `--${cut(json.miner[1][0].logs)}`, "red");
    });
}

function cut(text) {
  return text
    .replace("\u001b[31m", "")
    .replace("\u001b[0m", "")
    .replace("\u001b[37m", "")
    .replace("\u001b[32m", "")
    .replace("\u001b[33m", "")
    .split("]")[1];
}

function setText(h, w, text, color = "green") {
  h = Math.round(h);
  w = Math.round(w);
  const start = document.querySelector(`#h${h}w${w}`);
  const textLenght = text.length;
  start.innerHTML = `<span class="${color}">${text[0]}</span>`;
  for (let i = 1; i < textLenght; i++) {
    const letter = document.querySelector(`#h${h}w${w + i}`);
    if (i + w > ws) {
      continue;
    }
    if (text[i] === " ") {
      letter.innerText = "0"; //Math.round(Math.random());
    } else {
      letter.innerHTML = `<span class="${color}">${text[i]}</span>`;
    }
  }
}

function binary() {
  const page = document.querySelector("#page");
  for (let a = 0; hs >= a; a++) {
    const rows = document.createElement("p");
    rows.classList.add("binary");
    for (let i = 0; ws >= i; i++) {
      let rand = Math.round(Math.random());
      const columns = document.createElement("span");
      columns.id = `h${a}w${i}`;
      columns.innerText = rand;
      rows.appendChild(columns);
    }
    page.appendChild(rows);
  }
}
