// ========== SOUND ICON FOR START SCREEN VIDEO ===========
document.addEventListener('DOMContentLoaded', function() {
  const startBgVideo = document.getElementById('startBgVideo');
  const startSoundToggle = document.getElementById('startSoundToggle');
  const startSoundIcon = document.getElementById('startSoundIcon');
  let startAudioOn = false;
  if (startSoundToggle && startBgVideo) {
    startSoundToggle.addEventListener('click', function() {
      startAudioOn = !startAudioOn;
      startBgVideo.muted = !startAudioOn;
      if (startAudioOn) {
        startSoundIcon.textContent = '🔊';
      } else {
        startSoundIcon.textContent = '🔇';
      }
    });
  }
});
// Auto-loop video background sebelum habis (elak skrin hitam)
document.addEventListener('DOMContentLoaded', function() {
  const startBgVideo = document.getElementById('startBgVideo');
  if (startBgVideo) {
    startBgVideo.addEventListener('timeupdate', function() {
      if (startBgVideo.duration && startBgVideo.currentTime > startBgVideo.duration - 0.8) {
        startBgVideo.currentTime = 0.79;
        startBgVideo.play();
      }
    });
  }
});
// ========== AUDIO BACKGROUND ===========
const bgAudio = document.getElementById('bgAudio');
const soundToggle = document.getElementById('soundToggle');
const soundIcon = document.getElementById('soundIcon');
let audioOn = true;

function playBgAudio() {
  if (bgAudio && audioOn) {
    bgAudio.volume = 0.5;
    bgAudio.play().catch(()=>{});
  }
}
function pauseBgAudio() {
  if (bgAudio) bgAudio.pause();
}
if (soundToggle) {
  soundToggle.addEventListener('click', () => {
    audioOn = !audioOn;
    if (audioOn) {
      playBgAudio();
      if (soundIcon) soundIcon.textContent = '🔊';
    } else {
      pauseBgAudio();
      if (soundIcon) soundIcon.textContent = '🔇';
    }
  });
}
// ========== Permulaan Game: Input Nama Pemain, Token, Dadu ===========
const startScreen = document.getElementById('startScreen');
const gameContainer = document.getElementById('gameContainer');
const playerForm = document.getElementById('playerForm');
let playerNames = [];
let playerPositions = [];
let currentPlayer = 0;
let playerLaps = [];
const maxLaps = 2;
let roundCount = 0;
const maxRounds = 3;
const tokensBar = document.getElementById('tokensBar');
const diceBox = document.getElementById('diceBox');
const diceIcon = document.getElementById('diceIcon');
const diceNum = document.getElementById('diceNum');
const turnInfo = document.getElementById('turnInfo');
// Laluan token: ikut urutan custom user
function getPathBoxes() {
  const board = document.getElementById('board');
  // Ambil semua kotak ikut id dan data-id
  const kosong1 = document.getElementById('kosong1');
  const kosong2 = document.querySelector('.box.kosong .kosong-label:nth-child(1)').parentElement.nextElementSibling;
  const kosong3 = document.querySelector('.box.kosong .kosong-label:nth-child(1)').parentElement.nextElementSibling.nextElementSibling;
  // Lebih selamat: cari semua kotak kosong ikut label
  const kosongLabels = Array.from(board.querySelectorAll('.box.kosong .kosong-label'));
  const kosongBoxes = kosongLabels.map(label => label.parentElement);
  // Cari semua kotak QR ikut data-id
  function qr(id) { return board.querySelector('.box.qr[data-id="'+id+'"]'); }

  // Urutan laluan mengikut user
  return [
    kosongBoxes[0], // kosong 1
    qr(1),
    kosongBoxes[1], // kosong 2
    qr(2), qr(3),
    kosongBoxes[2], // kosong 3
    qr(4), qr(5), qr(6), qr(7),
    kosongBoxes[3], // kosong 4
    qr(8), qr(9), qr(10),
    kosongBoxes[4], // kosong 5
    qr(11), qr(12), qr(13),
    kosongBoxes[5], // kosong 6
    qr(14)
  ];
}
let pathBoxes = getPathBoxes();

if (playerForm) {
  playerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // Stop video background bila mula
    const startBgVideo = document.getElementById('startBgVideo');
    if (startBgVideo) {
      startBgVideo.pause();
      startBgVideo.currentTime = 0;
    }
    playerNames = [];
    for (let i = 1; i <= 4; i++) {
      const name = playerForm[`player${i}`].value.trim();
      if (name) playerNames.push(name);
    }
    if (playerNames.length > 0) {
      startScreen.style.display = 'none';
      gameContainer.style.display = '';
      // Reset posisi token dan pusingan
      playerPositions = Array(playerNames.length).fill(0); // 0 = pathBoxes[0] = kotak kosong 1
      playerLaps = Array(playerNames.length).fill(0);
      currentPlayer = 0;
      roundCount = 0;
      rollDiceBtn.disabled = false;
      updateTokens();
      updateTurnInfo();
      renderTokensOnBoard();
      if (diceResult) diceResult.textContent = '';
    } else {
      alert('Sila masukkan sekurang-kurangnya satu nama pemain!');
    }
  });
}
// ========== Permulaan Game: Input Nama Pemain, Token, Dadu ===========

function updateTokens() {
  if (!tokensBar) return;
  tokensBar.innerHTML = '';
  playerNames.forEach((name, idx) => {
    const token = document.createElement('div');
    token.className = 'player-token';
    token.textContent = name[0] ? name[0].toUpperCase() : '?';
    token.title = name;
    token.style.background = tokenColors[idx % tokenColors.length];
    tokensBar.appendChild(token);
  });
}

function updateTurnInfo() {
  if (turnInfo && playerNames.length > 0) {
    turnInfo.textContent = `Giliran: ${playerNames[currentPlayer]}`;
  }
}

function moveToken(playerIdx, steps) {
  pathBoxes = getPathBoxes();
  let oldPos = playerPositions[playerIdx];
  playerPositions[playerIdx] += steps;
  if (playerPositions[playerIdx] >= pathBoxes.length) {
    playerPositions[playerIdx] = playerPositions[playerIdx] % pathBoxes.length;
    playerLaps[playerIdx]++;
  }
  renderTokensOnBoard();
}

function renderTokensOnBoard() {
  pathBoxes = getPathBoxes();
  // Buang token lama
  pathBoxes.forEach(box => {
    box.querySelectorAll('.player-token').forEach(t => t.remove());
  });
  // Letak token pada kotak
  playerPositions.forEach((pos, idx) => {
    if (pos >= 0 && pos < pathBoxes.length) {
      const token = document.createElement('div');
      token.className = 'player-token';
      token.textContent = playerNames[idx][0] ? playerNames[idx][0].toUpperCase() : '?';
      token.title = playerNames[idx];
      token.style.background = tokenColors[idx % tokenColors.length];
      pathBoxes[pos].appendChild(token);
    }
  });
}

const tokenColors = ['#ffb703', '#219ebc', '#8ecae6', '#fb8500'];


if (diceBox) {
  diceBox.addEventListener('click', function() {
    if (playerNames.length === 0) return;
    // Permainan tamat jika pusingan >= maxLaps DAN token berada di kotak kosong 1
    const kosong1 = document.getElementById('kosong1');
    let kosong1Index = 0;
    if (kosong1) {
      pathBoxes = getPathBoxes();
      kosong1Index = pathBoxes.indexOf(kosong1);
      if (kosong1Index === -1) kosong1Index = 0;
    }
    if (playerLaps[currentPlayer] >= maxLaps && playerPositions[currentPlayer] === kosong1Index) {
      if (turnInfo) turnInfo.textContent = `Permainan Tamat! ${playerNames[currentPlayer]} menang!`;
      diceBox.classList.add('disabled');
      return;
    }
    // Animasi dadu
    diceNum.style.display = 'none';
    diceIcon.style.display = '';
    diceBox.classList.add('animating');
    setTimeout(() => {
      diceBox.classList.remove('animating');
      // Roll dadu 1-3
      const roll = Math.floor(Math.random() * 3) + 1;
      diceIcon.style.display = 'none';
      diceNum.textContent = roll;
      diceNum.style.display = '';
      moveToken(currentPlayer, roll);
      // Tukar giliran
      currentPlayer = (currentPlayer + 1) % playerNames.length;
      updateTurnInfo();
    }, 500);
  });
}
// @ts-nocheck

/* ================= QR ================= */
const allBoxes = document.querySelectorAll('.box');
const movableBoxes = allBoxes;
const lockButton = document.getElementById("lockButton");
const unlockButton = document.getElementById("unlockButton");

allBoxes.forEach(box=>{
  if(box.classList.contains('qr')){
    box.addEventListener("click", ()=>openQR(box.dataset.id));
  } else if(box.classList.contains('video')){
    box.addEventListener("click", openVideoMenu);
  } else if(box.classList.contains('soalan')){
    box.addEventListener("click", openSoalanMenu);
  }
});

/* ===== QR popup ===== */
function openQR(id){
  const img = document.getElementById("popupImg");
  const text = document.getElementById("popupText");
  img.src = `qr/${id}.png`;
  text.textContent = `QR رقم ${id}`;
  document.getElementById("popup").style.display='flex';
}

function closePopup(){ document.getElementById("popup").style.display='none'; }

// Add event listener for close button in QR popup
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('closePopupBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closePopup);
  }
});

/* ================= Drag & Drop ================= */
interact('.box').draggable({
  modifiers: [interact.modifiers.restrictRect({restriction:'parent', endOnly:true})],
  listeners:{
    move(event){
      const t = event.target;
      const x = (parseFloat(t.getAttribute('data-x'))||0)+event.dx;
      const y = (parseFloat(t.getAttribute('data-y'))||0)+event.dy;
      t.style.transform = `translate(${x}px,${y}px)`;
      t.setAttribute('data-x',x);
      t.setAttribute('data-y',y);
    }
  }
});

/* ================= LOCK ================= */
lockButton.addEventListener("click", ()=>{
  const positions = [];
  allBoxes.forEach((box, idx)=>{
    const rect = box.getBoundingClientRect();
    const parentRect = box.parentElement.getBoundingClientRect();
    const topP = ((rect.top - parentRect.top)/parentRect.height)*100;
    const leftP = ((rect.left - parentRect.left)/parentRect.width)*100;
    box.style.top = topP+"%";
    box.style.left = leftP+"%";
    box.style.transform="none";
    box.removeAttribute('data-x');
    box.removeAttribute('data-y');
    positions.push({index: idx, top: topP, left: leftP});
  });
  localStorage.setItem('boxPositions', JSON.stringify(positions));
  interact('.box').draggable(false);
  allBoxes.forEach(box=>box.classList.add('invisible'));
  lockButton.disabled=true;
  lockButton.textContent="✅ Susunan Locked";
  unlockButton.style.display = '';

  // Mainkan audio background selepas lock
  playBgAudio();
});

// UNLOCK button logic
if (unlockButton) {
  unlockButton.addEventListener('click', () => {
    allBoxes.forEach(box => box.classList.remove('invisible'));
    interact('.box').draggable(true);
    lockButton.disabled = false;
    lockButton.textContent = '🔒 Lock Susunan';
    unlockButton.style.display = 'none';
    // Pause audio bila unlock
    pauseBgAudio();
  });
}

// Restore box positions from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
      const positions = JSON.parse(localStorage.getItem('boxPositions') || '[]');
      if (positions.length > 0) {
        allBoxes.forEach((box, idx) => {
          const pos = positions.find(p => p.index === idx);
          if (pos) {
            box.style.top = pos.top + '%';
            box.style.left = pos.left + '%';
            box.style.transform = 'none';
            box.removeAttribute('data-x');
            box.removeAttribute('data-y');
          }
        });
        interact('.box').draggable(false);
        allBoxes.forEach(box=>box.classList.add('invisible'));
        lockButton.disabled=true;
        lockButton.textContent="✅ Susunan Locked";
        if (unlockButton) unlockButton.style.display = '';
      }
    // Papar nama pemain di bar atas board
    const bar = document.getElementById('playerNamesBar');
    if (bar) {
      bar.innerHTML = '';
      playerNames.forEach((name, idx) => {
        const span = document.createElement('span');
        span.className = 'player-name';
        span.textContent = name;
        bar.appendChild(span);
      });
    }
    // Reset posisi token
    pathBoxes = getPathBoxes();
    // Cari index kotak kosong 1 sebenar dalam pathBoxes
    const kosong1 = document.getElementById('kosong1');
    let kosong1Index = 0;
    if (kosong1) {
      kosong1Index = pathBoxes.indexOf(kosong1);
      if (kosong1Index === -1) kosong1Index = 0;
    }
    playerPositions = Array(playerNames.length).fill(kosong1Index); // Semua mula di kotak kosong 1 sebenar
    currentPlayer = 0;
    updateTokens();
    updateTurnInfo();
    renderTokensOnBoard();
    if (diceResult) diceResult.textContent = '';
});

/* ================= VIDEO ================= */
const videoPopup = document.getElementById("videoPopup");
const videoPlayer = document.getElementById("videoPlayer");
const videoListDiv = document.getElementById("videoList");


function populateVideoList() {
  videoListDiv.innerHTML = "";
  videoListDiv.style.display = 'block';
  for(let i=1;i<=11;i++){
    const btn = document.createElement("button");
    btn.textContent = `Video ${i}`;
    btn.onclick = ()=>{
      videoPlayer.src = `video/${i}.mp4`;
      videoPlayer.style.display = 'block';
      videoPopup.style.display='flex';
      videoListDiv.style.display = 'none';
      videoPlayer.play();
    };
    videoListDiv.appendChild(btn);
  }
}
// Populate on load
populateVideoList();

function openVideoMenu(){
  populateVideoList();
  videoPlayer.style.display = 'none';
  videoPopup.style.display='flex';
}

function closeVideo(){
  videoPlayer.pause();
  videoPlayer.currentTime=0;
  videoPlayer.src = "";
  videoPlayer.style.display = 'none';
  videoPopup.style.display='none';
  videoListDiv.style.display = 'block';
}



const soalanPopup = document.getElementById("soalanPopup");
const soalanRawakBtn = document.getElementById("soalanRawakBtn");
const soalanImageWrap = document.getElementById("soalanImageWrap");

function openSoalanMenu(){
  if (soalanImageWrap) soalanImageWrap.innerHTML = '';
  if (soalanRawakBtn) soalanRawakBtn.style.display = '';
  soalanPopup.style.display = 'flex';
}

function closeSoalan(){
  soalanPopup.style.display = 'none';
  if (soalanImageWrap) soalanImageWrap.innerHTML = '';
}

if (soalanRawakBtn) {
  soalanRawakBtn.onclick = function() {
    // Pilih nombor rawak 1-10
    const n = Math.floor(Math.random() * 10) + 1;
    if (soalanImageWrap) {
      soalanImageWrap.innerHTML = `<img src="soalan/${n}.png" alt="Soalan Rawak" style="max-width:80vw;max-height:60vh;border-radius:10px;box-shadow:0 2px 12px #0002;">`;
    }
    // Sembunyikan butang Soalan Rawak selepas ditekan
    soalanRawakBtn.style.display = 'none';
  };
}