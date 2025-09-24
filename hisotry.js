const hisotryList = document.getElementById("hisotry-list");
const backBtn = document.getElementById("backBtn");
const removeAllHisotryBtn = document.getElementById("removeAllHisotryBtn");
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

let entries = [];

for (let i = 0; i < localStorage.length; i++) {
  let key = localStorage.key(i);
  let value = Number(localStorage.getItem(key)); // 数値化
  entries.push([key, value]);
}

// 値の大きい順にソート
entries.sort((a, b) => b[1] - a[1]);

// 表示

// 表示
entries.forEach(([key, value]) => {
  if (key === "lastVolume") return; // lastVolumeはスキップ
  let newLi = document.createElement("p");
  let removeBtn = document.createElement("button");
  removeBtn.textContent = "✖";

  // テキストをspanに分離（削除ボタンと同居させるため）
  let textSpan = document.createElement("span");
  textSpan.textContent = `${key} : ${formatTime(value)}`;

  // ボタンにイベントリスナー
  removeBtn.addEventListener("click", () => {
    localStorage.removeItem(key); // localStorageから削除
    hisotryList.removeChild(newLi); // 表示から削除
  });

  newLi.appendChild(textSpan);
  newLi.appendChild(removeBtn);
  hisotryList.appendChild(newLi);
});
backBtn.addEventListener("click", () => {
  history.back();
});
removeAllHisotryBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all history?")) {
    localStorage.clear();
    hisotryList.innerHTML = "";
  }
});
