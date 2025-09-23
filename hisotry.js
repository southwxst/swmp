const hisotryList = document.getElementById("hisotry-list");
const backBtn = document.getElementById("backBtn");
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
entries.forEach(([key, value]) => {
	if (key === "lastVolume") return; // lastVolumeはスキップ
  let newLi = document.createElement("p");
  newLi.textContent = `${key} : ${formatTime(value)}`;
  hisotryList.appendChild(newLi);
});
backBtn.addEventListener("click", () => {
	 history.back();
});
//let i = 0; i < localStorage.length; i++
