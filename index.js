const fileInput = document.getElementById("fileInput");
const browser = document.getElementById("browser");
const video = document.getElementById("videoPlayer");
const playPause = document.getElementById("playPause");
const file_name = document.getElementById("file_name");
const seekBar = document.getElementById("seekBar");
const selectBtn = document.getElementById("selectBtn");
const container = document.querySelector(".video-container");
const controls = document.querySelector(".controls");
const tx = document.querySelector(".tx");

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

function browserFIle() {
  const file = fileInput.files[0];
  if (file) {
    const ext = file.name.split(".").pop().toLowerCase();
    if (["mp4", "mkv", "webm"].includes(ext)) {
      loadVideo(file);
      document.title = file.name;
    } else {
      alert("対応形式は mp4, mkv, webm です");
    }
  }
}
function playandpause() {
  if (video.paused) {
    video.play();
    controls.style.opacity = 0;
  } else {
    video.pause();
    controls.style.opacity = 1;
  }
}
video.addEventListener("pause", () => {
  playPause.src = "imgs/pause.webp";
  playPause.alt = "pause";
});
video.addEventListener("play", () => {
  playPause.src = "imgs/play.webp";
  playPause.alt = "play";
});

controls.addEventListener("mouseenter", () => {
  if (!video.paused) {
    controls.style.opacity = 1;
  }
});

controls.addEventListener("mouseleave", () => {
  if (!video.paused) {
    controls.style.opacity = 0;
  }
});

video.addEventListener("click", () => {
  playandpause();
});

// ファイル選択
browser.addEventListener("click", () => fileInput.click());
selectBtn.addEventListener("click", (e) => {
  e.preventDefault(); // ← ページ遷移を止める
  fileInput.click();
});
fileInput.addEventListener("change", () => {
  browserFIle();
});

function loadVideo(file) {
  if (container.style.display !== "block") {
    container.style.display = "block";
  }
  const key = file.name;
  const url = URL.createObjectURL(file);
  video.src = url;
  playPause.src = "imgs/play.webp";
  playPause.alt = "play";
  if (localStorage.getItem(`${key}_unchi`)) {
    video.currentTime = localStorage.getItem(`${key}_time`);
  } else {
    localStorage.setItem(`${key}_unchi`, `${key}`);
  }
  file_name.textContent = key;
  video.play();
  tx.style.display = "none";
}

// 再生 / 停止
playPause.addEventListener("click", () => {
  playandpause();
});

// シークバー更新
video.addEventListener("timeupdate", () => {
  seekBar.value = (video.currentTime / video.duration) * 100;
});

seekBar.addEventListener("input", () => {
  video.currentTime = (seekBar.value / 100) * video.duration;
});

// Spaceキーや速度変更、シーク操作
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault(); // ページスクロールを防ぐ
    playandpause();
  }

  if (e.code === "KeyB") {
    fileInput.click();
  }
  if (e.code === "KeyE") {
    video.playbackRate = 1;
  }
  if (e.code === "ArrowRight") {
    // 10秒進める
    video.currentTime = Math.min(video.currentTime + 10, video.duration);
  }
  if (e.code === "ArrowLeft") {
    // 10秒戻す
    video.currentTime = Math.max(video.currentTime - 10, 0);
  }
});

// timeupdateイベントの進捗更新処理を修正
video.addEventListener("timeupdate", () => {
  if (!video.duration) return;

  const value = (video.currentTime / video.duration) * 100;
  seekBar.value = value;

  let currentTime = Math.trunc(video.currentTime);
  let durationTime = Math.trunc(video.duration);
  const time = document.getElementById("time");
  const key = fileInput.files[0]?.name; // ファイル名をキーに
  if (key) {
    localStorage.setItem(`${key}_time`, `${currentTime}`);
  }
  time.textContent = `${formatTime(currentTime)} / ${formatTime(durationTime)}`;

  // 進捗バーの背景を動的に更新
  seekBar.style.background = `linear-gradient(to right, #54fc17 ${value}%, #444 ${value}%)`;
});

// 動画メタデータ読み込み完了時の処理を追加
video.addEventListener("loadedmetadata", () => {
  seekBar.value = 0;
  seekBar.style.background = "linear-gradient(to right, #54fc17 0%, #444 0%)";
});
// body全体にドラッグ&ドロップ対応
document.body.addEventListener("dragover", (e) => {
  e.preventDefault();
});
document.body.addEventListener("drop", (e) => {
  e.preventDefault();
  if (e.dataTransfer.files.length > 0) {
    fileInput.files = e.dataTransfer.files; // input[type=file] にセット
    browserFIle(); // 共通の関数を呼ぶ
  }
});
