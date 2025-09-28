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
  if (key === "lastVolume") continue;

  try {
    let obj = JSON.parse(localStorage.getItem(key));
    if (!obj || typeof obj.time !== "number") continue;
    entries.push([key, obj.time, obj.savedAt]);
  } catch (e) {
    // 古いデータ(JSONじゃない)はスキップ
    continue;
  }
}

// 保存した日付（新しい順）でソート
entries.sort((a, b) => b[2] - a[2]);

// 表示
entries.forEach(([key, value, savedAt]) => {
  let newLi = document.createElement("p");
  let removeBtn = document.createElement("button");
  removeBtn.textContent = "✖";

  let textSpan = document.createElement("span");
  let date = new Date(savedAt).toLocaleString(); // 保存日時を表示
  textSpan.textContent = `${key} : ${formatTime(value)} (${date})`;

  removeBtn.addEventListener("click", () => {
    localStorage.removeItem(key);
    hisotryList.removeChild(newLi);
  });

  newLi.appendChild(textSpan);
  newLi.appendChild(removeBtn);
  hisotryList.appendChild(newLi);
});

// 戻るやつい
backBtn.addEventListener("click", () => {
  history.back();
});
removeAllHisotryBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all history?")) {
    localStorage.clear();
    hisotryList.innerHTML = "";
  }
});
