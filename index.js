const jfileInput = document.getElementById("fileInput");
const browser = document.getElementById("browser");
const go_hisotry = document.getElementById("go_history");
const video = document.getElementById("videoPlayer");
const playPause = document.getElementById("playPause");
const file_name = document.getElementById("file_name");
const seekBar = document.getElementById("seekBar");
const selectBtn = document.getElementById("selectBtn");
const volumeBtn = document.getElementById("volume");
const volumeBar = document.getElementById("volumeBar");
const container = document.querySelector(".video-container");
const controls = document.querySelector(".controls");
const body = document.body;
const tx = document.querySelector(".tx");
let lastVolume = localStorage.getItem("lastVolume") ?? 1; // 最後の音量を保存
let idleTimer;
let removeItem = false;
video.addEventListener("volumechange", () => {
  if (video.volume > 0) {
    localStorage.setItem("lastVolume", video.volume);
    volumeBtn.src = "imgs/medium-volume.webp";
    lastVolume = video.volume;
  }
  if (video.volume === 0) {
    video.volume = 0;
    volumeBtn.src = "imgs/volume-mute.webp";
    volumeBar.value = 0;
    // 色の境界を明確にするために同じパーセンテージを使用
    volumeBar.style.background = `linear-gradient(to right, #e2e3e2 ${volumeBar.value}%, #444 ${volumeBar.value}%)`;
  }
});
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
  if (!video.duration) return;

  const percent = (video.currentTime / video.duration) * 100;
  seekBar.value = percent;
  seekBar.style.background = `linear-gradient(to right, #449df9 ${percent}%, #444 ${percent}%)`;

  const time = document.getElementById("time");
  let currentTime = Math.floor(video.currentTime); // trunc → floor に変更
  let durationTime = Math.floor(video.duration);
  time.textContent = `${formatTime(currentTime)} / ${formatTime(durationTime)}`;
}

video.addEventListener("pause", () => {
  controls.style.opacity = 1;
  playPause.src = "imgs/pause.webp";
  playPause.alt = "pause";
  updateSeekBar(); // 最後に一度更新
});
video.addEventListener("play", () => {
  playPause.src = "imgs/play.webp";
  playPause.alt = "play";
  controls.style.opacity = 0;
});
video.addEventListener("ended", () => {
  fileInput.click();
});

// 時間が変更されたら常に更新（キーボード操作などに対応）

video.addEventListener("timeupdate", () => {
  updateSeekBar();

  if (
    video.duration &&
    fileInput.files[0] &&
    !removeItem &&
    video.duration * 0.93 < video.currentTime
  ) {
    removeItem = true;
    //localStorage.setItem(fileInput.files[0].name, video.currentTime);
localStorage.setItem("FINISHED__" + fileInput.files[0].name, JSON.stringify({
  time: video.currentTime,
  savedAt: Date.now()
}));
    localStorage.removeItem(fileInput.files[0].name);
    console.log("a");
  } else if (video.duration && fileInput.files[0] && !removeItem) {
	  localStorage.setItem(fileInput.files[0].name, JSON.stringify({
  time: video.currentTime,
  savedAt: Date.now() // UNIXタイムスタンプ
}));
  }
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
  const key = file.name;

  // 完了フラグがある場合
  if (localStorage.getItem("FINISHED__" + key)) {
    if (
      confirm("You have finished watching this video. Do you want to restart?")
    ) {
      localStorage.removeItem(key);
      localStorage.removeItem("FINISHED__" + key);
    } else {
      return;
    }
  } else if (localStorage.getItem(key)) {
    try {
      let obj = JSON.parse(localStorage.getItem(key));
      if (obj && typeof obj.time === "number") {
        video.currentTime = obj.time;
      }
    } catch (e) {
      // 古いデータ（JSONでない場合）は数値として扱う
      video.currentTime = Number(localStorage.getItem(key)) || 0;
    }
  }

  if (container.style.display !== "block") {
    container.style.display = "block";
    body.style.background = "black";
    go_hisotry.style.display = "none";
  }

  const url = URL.createObjectURL(file);
  video.src = url;
  playPause.src = "imgs/play.webp";
  playPause.alt = "play";
  file_name.textContent = key;
  video.play();
  tx.style.display = "none";
  video.volume = lastVolume || 1;
  removeItem = false; // 新しい動画を読み込んだときにフラグをリセット
}

// 再生 / 停止
playPause.addEventListener("click", () => {
  playandpause();
});
volumeBtn.addEventListener("click", () => {
  if (video.volume === 0) {
    video.volume = lastVolume || 1;
    volumeBtn.src = "imgs/medium-volume.webp";
    volumeBar.value = video.volume * 100;
    // 色の境界を明確にするために同じパーセンテージを使用
    volumeBar.style.background = `linear-gradient(to right, #e2e3e2 ${volumeBar.value}%, #444 ${volumeBar.value}%)`;
  } else {
    video.volume = 0;
    volumeBtn.src = "imgs/volume-mute.webp";
    volumeBar.value = 0;
    // 色の境界を明確にするために同じパーセンテージを使用
    volumeBar.style.background = `linear-gradient(to right, #e2e3e2 ${volumeBar.value}%, #444 ${volumeBar.value}%)`;
  }
}); // seekBar操作時に即座に背景を更新
seekBar.addEventListener("input", () => {
  video.currentTime = (seekBar.value / 100) * video.duration;
  updateSeekBar(); // 即座に背景を更新
});
volumeBar.addEventListener("input", () => {
  video.volume = volumeBar.value / 100;
  if (video.volume === 0) {
    clearTimeout(idleTimer);
    volumeBtn.src = "imgs/volume-mute.webp";
    // 色の境界を明確にするために同じパーセンテージを使用
    volumeBar.style.background = `linear-gradient(to right, #e2e3e2 ${volumeBar.value}%, #444 ${volumeBar.value}%)`;
  } else {
    clearTimeout(idleTimer);
    volumeBtn.src = "imgs/medium-volume.webp";
    // 色の境界を明確にするために同じパーセンテージを使用
    volumeBar.style.background = `linear-gradient(to right, #e2e3e2 ${volumeBar.value}%, #444 ${volumeBar.value}%)`;
  }
});
// Spaceキーや速度変更、シーク操作
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault(); // ページスクロールを防ぐ
    playandpause();
  }
  if (e.code === "Enter") {
    playandpause();
  }
  if (e.code === "KeyB") {
    fileInput.click();
  }
  if (e.code === "KeyE") {
    video.playbackRate = 1;
  }
  if (e.code === "ArrowRight") {
    e.preventDefault(); // ページスクロールを防ぐ

    video.currentTime = Math.min(video.currentTime + 10, video.duration);
  }
  if (e.code === "ArrowLeft") {
    e.preventDefault(); // ページスクロールを防ぐ

    video.currentTime = Math.max(video.currentTime - 10, 0);
  }
  if (e.code === "ArrowUp") {
    e.preventDefault();
    video.volume = Math.min(video.volume + 0.1, 1);
    volumeBar.value = video.volume * 100;

    volumeBar.style.background = `linear-gradient(to right, #e2e3e2 ${volumeBar.value}%, #444 ${volumeBar.value}%)`;
  }
  if (e.code === "ArrowDown") {
    e.preventDefault();
    video.volume = Math.max(video.volume - 0.1, 0);
    volumeBar.value = video.volume * 100;
    volumeBar.style.background = `linear-gradient(to right, #e2e3e2 ${volumeBar.value}%, #444 ${volumeBar.value}%)`;
  }
});
// 動画メタデータ読み込み完了時の処理
video.addEventListener("loadedmetadata", () => {
  seekBar.value = 0;
  seekBar.style.background = "linear-gradient(to right, #449df9 0%, #444 0%)";
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
  if (!fileInput.files[0] || video.paused) {
    console.log("dsaldsjakl");
    return;
  }
  clearTimeout(idleTimer); // 前のタイマーをリセット
  idleTimer = setTimeout(() => {
    if (!video.paused) {
      // 再生中なら
      controls.style.opacity = 0;
      console.log("idle");
    }
  }, 5000);
}
