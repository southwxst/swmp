const hisotryList = document.getElementById("hisotry-list");
const backBtn = document.getElementById("backBtn");
const removeAllHisotryBtn = document.getElementById("removeAllHisotryBtn");
const importBtn = document.getElementById("importBtn");
const exportBtn = document.getElementById("exportBtn");

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  } else {
    return `${m}:${String(s).padStart(2, "0")}`;
  }
}

function noHistory() {
  if (!hisotryList.hasChildNodes()) {
    let newLi = document.createElement("p");
    newLi.textContent = "No history found.";
    hisotryList.appendChild(newLi);
  }
}

let entries = [];

for (let i = 0; i < localStorage.length; i++) {
  let key = localStorage.key(i);
  if (key === "lastVolume") continue;

  try {
    let obj = JSON.parse(localStorage.getItem(key));
    if (!obj || typeof obj.time !== "number") continue; //スキップ returnはそこの処理を根本的に停止させるが contiuneはそこだけ消す
    entries.push([key, obj.time, obj.savedAt]);
  } catch (e) {
    continue;
  }
}

entries.sort((a, b) => b[2] - a[2]);

entries.forEach(([key, value, savedAt]) => {
  let newLi = document.createElement("p");
  let removeBtn = document.createElement("button");
  removeBtn.textContent = "✖";

  let textSpan = document.createElement("span");
  let date = new Date(savedAt).toLocaleString();
  textSpan.textContent = `${key} : ${formatTime(value)} (${date})`;

  removeBtn.addEventListener("click", () => {
    localStorage.removeItem(key);
    hisotryList.removeChild(newLi);
    noHistory();
  });

  newLi.appendChild(textSpan);
  newLi.appendChild(removeBtn);
  hisotryList.appendChild(newLi);
});

noHistory();

backBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

removeAllHisotryBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all history?")) {
    localStorage.clear();
    hisotryList.innerHTML = "";
    noHistory();
  }
});

// ======== Export JSON ========
exportBtn.addEventListener("click", () => {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    // i 番目のやつを返す 1だったらlcoalstorage 1番目のやつを出す
    // この場合localStorage.key(0)したら 'video.mp4'が出てくる
    data[key] = localStorage.getItem(key);
  }
  //  const key = "video1";
  // data[key] = "value";
  // console.logしてみるとこうなる{ video1: "value" }
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  //JSON.stringifyはdateをjsonん変化するためのやつ
  //blobは一時的にファイルを作るやつ null2は配列の仕方
  //"application/json",これはオプションで ファイルのMIMEタイプ（種類） を指定します。ブラウザやOSに「これはJSONファイルだよ」と教えるためです。
  const url = URL.createObjectURL(blob); //javascriptじょうでurlを使えるようやつ
  const a = document.createElement("a");
  let time = Date.now(); //// → Tue Nov 4 2025 22:15:32 GMT+0900 (Japan Standard Time)
  let dateStr = new Date(time).toLocaleString();
  a.href = url; //htmlのurlを設定する
  a.download = `swmp ${dateStr}`; //普通にhtmlのdownlod属性
  a.click();

  URL.revokeObjectURL(url); //url消すやつ
});

// ======== Import JSON ========
importBtn.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      // 🔹 JSON.parse(text)

      // JSON.parse() は、JSON形式の文字列をオブジェクトに変換する関数です。

      // たとえば：

      // const text = '{"name": "Alice", "age": 25}';
      // const data = JSON.parse(text);
      // console.log(data.name); // "Alice"

      // JSON（ジェイソン）は、ただの「文字列」。
      // JSON.parse() で「文字列 → 実際に使えるオブジェクト」に直します。
      if (confirm("Import settings? This will overwrite existing data.")) {
        for (const [key, value] of Object.entries(data)) {
          //keyは名前 valueは数字
          localStorage.setItem(key, value);
        }
        location.reload();
      }
    } catch (e) {
      alert("Invalid JSON file.");
    }
  });
  input.click();
});
