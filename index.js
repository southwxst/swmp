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
let saveInterval;
let idleTimer;
let rafId; // requestAnimationFrame ID

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
  } else {
    video.pause();
  }
}

// 再生中だけ進捗を更新する関数
function updateSeekBar() {
  const value = (video.currentTime / video.duration) * 100;
  seekBar.value = value;
  seekBar.style.background = `linear-gradient(to right, #54fc17 ${value}%, #444 ${value}%)`;

  // 時間表示も更新
  let currentTime = Math.trunc(video.currentTime);
  let durationTime = Math.trunc(video.duration);
  const time = document.getElementById("time");
  time.textContent = `${formatTime(currentTime)} / ${formatTime(durationTime)}`;

  if (!video.paused && !video.ended) {
    rafId = requestAnimationFrame(updateSeekBar);
  }
}

video.addEventListener("pause", () => {
  playPause.src = "imgs/pause.webp";
  playPause.alt = "pause";
  controls.style.opacity = 1;
  clearInterval(saveInterval);
  cancelAnimationFrame(rafId); // 背景更新を止める
  updateSeekBar(); // 最後に一度更新
});

video.addEventListener("play", () => {
  playPause.src = "imgs/play.webp";
  playPause.alt = "play";
  controls.style.opacity = 0;
  saveInterval = setInterval(() => {
    const key = fileInput.files[0]?.name;
    if (key) {
      localStorage.setItem(`${key}_time`, `${video.currentTime}`);
    }
  }, 10000);

  requestAnimationFrame(updateSeekBar); // 背景更新を開始
});

controls.addEventListener("mousemove", () => {
  if (!video.paused) {
    controls.style.opacity = 1;
    startIdleTimer();
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

seekBar.addEventListener("input", () => {
  video.currentTime = (seekBar.value / 100) * video.duration;
});

// Spaceキーや速度変更、シーク操作
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault(); // ページスクロールを防ぐ
    playandpause();
  }

  if (e.code === "KeyO") {
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

// 動画メタデータ読み込み完了時の処理を追加
video.addEventListener("loadedmetadata", () => {
  seekBar.value = 0;
  seekBar.style.background = "linear-gradient(to right, #54fc17 0%, #444 0%)";
  updateSeekBar(); // 読み込んだら一度更新
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

function startIdleTimer() {
  if (!fileInput.files[0] && !video.paused) {
    return;
  }
  clearTimeout(idleTimer); // 前のタイマーをリセット
  idleTimer = setTimeout(() => {
    controls.style.opacity = 0;
  }, 5000);
}
