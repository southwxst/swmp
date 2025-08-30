    const fileInput = document.getElementById("fileInput");
    const selectBtn = document.getElementById("selectBtn");
    const video = document.getElementById("videoPlayer");
    const playPause = document.getElementById("playPause");
    const seekBar = document.getElementById("seekBar");
    const container = document.querySelector(".video-container");
const controls = document.querySelector(".controls");

function browserFIle(){
      const file = fileInput.files[0];
      if (file) {
        const ext = file.name.split('.').pop().toLowerCase();
        if (["mp4", "mkv", "webm"].includes(ext)) {
          loadVideo(file);
          document.title = file.name;
        } else {
          alert("対応形式は mp4, mkv, webm です");
        }
      }
}
function playandpause(){
  if (video.paused) {
    playPause.textContent = "︎⏸";
    video.play();
    
  } else {
      playPause.textContent = "▶";
    video.pause();
  }
}
container.addEventListener("mousemove", (e) => {
  const rect = container.getBoundingClientRect();
  const y = e.clientY - rect.top;

  if (y > rect.height - 100) { // 下から100pxの範囲
    controls.style.opacity = 1;
  } else {
    controls.style.opacity = 0;
  }
});


    // ファイル選択
    selectBtn.addEventListener("click", () => fileInput.click());
    browser.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", () => {
      browserFIle();
    });

function loadVideo(file) {
  const url = URL.createObjectURL(file);
  video.src = url;
          playPause.textContent = "⏸";
    video.play();              // 再生開始


  selectBtn.remove();
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

    // Spaceキーで再生/停止
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault(); // ページスクロールを防ぐ
        playandpause();
      }
    });

container.addEventListener("click", (e) => {
  // コントロールをクリックしたときは無効化
  if (e.target.closest(".controls")) return;
  playandpause();

});
