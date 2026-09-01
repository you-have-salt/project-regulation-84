const audioConfig = {
  click: './sounds/click.mp3',
  keypress: './sounds/keypress.mp3',
  success: './sounds/success.mp3',
  error: './sounds/error.mp3'
};
const audioVolumeConfig = {
  click: 0.3,
  keypress: 0.1,
  success: 0.8,
  error: 0.2,
  bgm: 0.2
};
let isMuted = localStorage.getItem('arg_terminal_muted') === 'true';
let bgmStarted = false;
const activeAudioPool = {};

function playSound(type) {
  if (isMuted || !audioConfig[type]) return;

  try {
    if (activeAudioPool[type]) {
      activeAudioPool[type].currentTime = 0;
      activeAudioPool[type].play().catch(() => {});
      return;
    }
    const audio = new Audio(audioConfig[type]);
    audio.volume = audioVolumeConfig[type] !== undefined ? audioVolumeConfig[type] : 0.1;
    activeAudioPool[type] = audio;
    audio.play().catch(() => {});
    audio.onended = () => {
      delete activeAudioPool[type];
    };
  } catch (err) {
  }
}

function initBGM() {
  const bgm = document.getElementById('bgmAudio');
  if (!bgm) return;
  bgm.volume = audioVolumeConfig.bgm || 0.2;
  const playBGM = () => {
    if (!isMuted && bgm.paused) {
      bgm.play().then(() => {
        bgmStarted = true;
      }).catch(() => {});
    }
  };
  playBGM();

  const handleFirstInteraction = () => {
    if (!bgmStarted && !isMuted) {
      playBGM();
    }
    if (bgmStarted) {
      removeInteractionListeners();
    }
  };
  const removeInteractionListeners = () => {
    document.removeEventListener('click', handleFirstInteraction);
    document.removeEventListener('touchstart', handleFirstInteraction);
    document.removeEventListener('mousemove', handleFirstInteraction);
    document.removeEventListener('scroll', handleFirstInteraction);
    document.removeEventListener('keydown', handleFirstInteraction);
  };
  document.addEventListener('click', handleFirstInteraction, { passive: true });
  document.addEventListener('touchstart', handleFirstInteraction, { passive: true });
  document.addEventListener('mousemove', handleFirstInteraction, { passive: true });
  document.addEventListener('scroll', handleFirstInteraction, { passive: true });
  document.addEventListener('keydown', handleFirstInteraction, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (!bgm.paused) {
        bgm.pause();
      }
    } else {
      if (!isMuted && bgmStarted) {
        bgm.play().catch(() => {});
      }
    }
  });
}

function toggleAudio() {
  isMuted = !isMuted;
  localStorage.setItem('arg_terminal_muted', isMuted);
  const bgm = document.getElementById('bgmAudio');
  if (bgm) {
    if (isMuted) {
      bgm.pause();
    } else {
      bgm.play().catch(() => {});
    }
  }
  updateAudioButtonUI();
}

function updateAudioButtonUI() {
  const btn = document.getElementById('audio-toggle-btn');
  if (!btn) return;
  if (isMuted) {
    btn.textContent = 'AUDIO';
    btn.classList.add('muted');
  } else {
    btn.textContent = 'AUDIO';
    btn.classList.remove('muted');
  }
}

const levelDatabase = [
  {
    level: 1,
    title: "黑暗中閃爍的綠光",
    summary: "一台需要授權的電腦，解開終端金鑰以獲取初步權限",
    clueText: "觀察社群貼文中發布的神秘畫面\n提示：便利貼的英文和上面的黑線是否與畫面有關聯?\n嘗試著由左到右串聯起來吧",
    passcodes: ["unlock 81230", "81230"],
    isReleased: true,
    reward: {
      title: "報告：機密檔案已開啟",
      text: "【系統警告】授權成功\n你發現了一張看似員工手冊條規說明的圖片\n其中畫面上重要的內容被塗黑了",
      imageUrl: "./images/level1.png",
      audioUrl: "",
      videoUrl: ""
    }
  },
  {
    level: 2,
    title: "非日常籌備",
    summary: "一張貼在牆上的營運表",
    clueText: "觀察社群貼文中發布的圖片\n提示：部分數字被圈起來是有什麼目的嗎?\n為什麼有幾串數字的顏色不一樣?",
    passcodes: ["unlock 63015", "63015"],
    isReleased: true,
    reward: {
      title: "報告：機密檔案已開啟",
      text: "【系統警告】授權成功\n一張被撕掉的告示表\n除了內容被塗黑外好像在哪看過它?",
      imageUrl: "./images/level2.png",
      audioUrl: "",
      videoUrl: ""
    }
  },
  {
    level: 3,
    title: "除舊換新",
    summary: "防火牆阻擋了去路",
    clueText: "請靜待社群發布線索",
    passcodes: ["unlock MATRIX999", "MATRIX999"],
    isReleased: false,
    reward: {
      title: "報告：機密檔案已開啟",
      text: "【恭喜通關】你已完成全數關卡，解開最終迷局！",
      imageUrl: "",
      audioUrl: "",
      videoUrl: ""
    }
  },
  {
    level: 4,
    title: "第三階段：終極協定",
    summary: "最後的防火牆阻擋了去路，拼湊所有舊線索解開總機密。",
    clueText: "【機密線索 #03】\n將所有過關獲得的關鍵字組合成最終金鑰。",
    passcodes: ["unlock MATRIX999", "MATRIX999"],
    isReleased: false,
    reward: {
      title: "第三階段：通關機密檔案",
      text: "【恭喜通關】你已完成全數關卡，解開最終迷局！",
      imageUrl: "",
      audioUrl: "",
      videoUrl: ""
    }
  }
];
let currentLevelIndex = 0;

function loadProgress() {
  const savedLevel = localStorage.getItem('arg_current_level');
  if (savedLevel !== null) {
    currentLevelIndex = parseInt(savedLevel, 10);
    if (currentLevelIndex >= levelDatabase.length) {
      currentLevelIndex = levelDatabase.length - 1;
    }
  }
}

function saveProgress() {
  localStorage.setItem('arg_current_level', currentLevelIndex);
}

function startLoadingAnimation() {
  const loader = document.getElementById('boot-loader');
  const img = document.getElementById('boot-img');
  const fill = document.getElementById('boot-progress-fill');
  const percentText = document.getElementById('boot-percentage');
  const statusText = document.getElementById('boot-status-text');


  const imageInitial = "./images/logo1.PNG";
  const imageCompleted = "./images/logo2.PNG";

  let progress = 0;
  if (img) {
    img.onerror = function() {
      this.onerror = null;
      this.src = 'https://placehold.co/400x200/0d1117/8be9fd?text=PROJECT+REGULATION+84';
    };
    img.src = imageInitial;
  }

  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 5) + 2;

    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);

      if (fill) {
        fill.style.width = '100%';
        fill.style.backgroundColor = 'var(--accent-green)';
      }
      if (percentText) {
        percentText.textContent = '100%';
        percentText.style.color = 'var(--accent-green)';
      }
      if (statusText) {
        statusText.textContent = 'DECRYPTION COMPLETE. ACCESS GRANTED.';
        statusText.style.color = 'var(--accent-green)';
      }
      if (img) {
        img.src = imageCompleted;
      }
      playSound('success');
      setTimeout(() => {
        if (loader) loader.classList.add('fade-out');
      }, 1200);
    } else {
      if (fill) fill.style.width = progress + '%';
      if (percentText) percentText.textContent = progress + '%';
    }
  }, 60);
}

document.addEventListener('DOMContentLoaded', () => {
  loadProgress();
  updateAudioButtonUI();
  startLoadingAnimation();
  initBGM();
  const audioBtn = document.getElementById('audio-toggle-btn');
  if (audioBtn) {
    audioBtn.addEventListener('click', toggleAudio);
  }
  const executeBtn = document.getElementById('execute-btn');
  const cmdInput = document.getElementById('terminal-input');
  executeBtn.addEventListener('click', handleExecute);
  cmdInput.addEventListener('keydown', (e) => {
    playSound('keypress');
    if (e.key === 'Enter') {
      handleExecute();
    }
  });
  renderUI();
});

function renderUI() {
  const currentData = levelDatabase[currentLevelIndex];
  const clearanceBadge = document.getElementById('current-clearance');
  const formattedLevel = String(currentData.level).padStart(2, '0');
  clearanceBadge.textContent = `CLEARANCE: LEVEL ${formattedLevel}`;
  const cmdInput = document.getElementById('terminal-input');
  const executeBtn = document.getElementById('execute-btn');
  if (!currentData.isReleased) {
    cmdInput.disabled = true;
    executeBtn.disabled = true;
    cmdInput.placeholder = "系統鎖定：靜待指定社群公布最新線索";
  } else {
    cmdInput.disabled = false;
    executeBtn.disabled = false;
    cmdInput.placeholder = `請在此輸入 LEVEL ${formattedLevel} 解鎖指令...`;
  }
  renderCluesList();
}

function handleExecute() {
  const cmdInput = document.getElementById('terminal-input');
  const inputVal = cmdInput.value.trim();
  if (!inputVal) return;
  const consoleOutput = document.getElementById('console-output');
  const currentData = levelDatabase[currentLevelIndex];
  appendConsoleLog(`> ${inputVal}`, 'system');
  const isCorrect = currentData.passcodes.some(code => code.toLowerCase() === inputVal.toLowerCase());
  if (isCorrect) {
    playSound('success');
    appendConsoleLog(`[SUCCESS] 存取授權成功！已解開 LEVEL ${String(currentData.level).padStart(2, '0')} 密鑰`, 'success');
    cmdInput.value = '';
    openRewardModal(currentLevelIndex);
    if (currentLevelIndex < levelDatabase.length - 1) {
      currentLevelIndex++;
      saveProgress();
      renderUI();
    } else {
      appendConsoleLog(`ALL CLEARED 你已破譯所有已知層級的終端協定！`, 'success');
    }
  } else {
    playSound('error');
    appendConsoleLog(`ERROR 金鑰錯誤或權限不足，請重新驗證指令`, 'error');
  }
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function appendConsoleLog(text, type) {
  const consoleOutput = document.getElementById('console-output');
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.textContent = text;
  consoleOutput.appendChild(entry);
}

function renderCluesList() {
  const container = document.getElementById('clues-container');
  container.innerHTML = '';
  levelDatabase.forEach((lvl, index) => {
    if (index > currentLevelIndex && !lvl.isReleased) return;
    const card = document.createElement('div');
    let statusClass = '';
    let statusBadgeText = '';
    let statusBadgeColor = '';
    if (index < currentLevelIndex) {
      statusClass = 'cleared';
      statusBadgeText = 'CLEAR';
      statusBadgeColor = 'green';
    } else if (index === currentLevelIndex) {
      if (lvl.isReleased) {
        statusClass = 'active';
        statusBadgeText = 'ACT';
        statusBadgeColor = 'red';
      } else {
        statusClass = 'locked';
        statusBadgeText = 'LOCK';
        statusBadgeColor = 'yellow';
      }
    }
    card.className = `clue-card ${statusClass}`;
    let actionsHTML = '';
    if (lvl.isReleased) {
      actionsHTML += `<button class="action-btn view-clue-btn" onclick="openClueModal(${index})">代碼提示</button>`;
    }
    if (index < currentLevelIndex) {
      actionsHTML += `<button class="action-btn view-reward-btn" onclick="openRewardModal(${index})">已解線索</button>`;
    }
    card.innerHTML = `
      <div class="clue-card-header">
        <div class="clue-title-group">
          <span class="clue-level-tag">LEVEL ${String(lvl.level).padStart(2, '0')}</span>
          <span class="clue-card-title">${lvl.title}</span>
        </div>
        <span class="status-badge ${statusBadgeColor}">${statusBadgeText}</span>
      </div>
      <div class="clue-card-body">
        <p>${lvl.summary}</p>
      </div>
      ${actionsHTML ? `<div class="clue-card-actions">${actionsHTML}</div>` : ''}
    `;

    container.appendChild(card);
  });
}

function openClueModal(index) {
  playSound('click');
  const lvl = levelDatabase[index];
  document.getElementById('modal-clue-title').textContent = `LEVEL ${String(lvl.level).padStart(2, '0')} 機密線索`;
  document.getElementById('modal-clue-text').textContent = lvl.clueText;
  document.getElementById('clue-modal').classList.add('active');
}
function closeClueModal() {
  playSound('click');
  document.getElementById('clue-modal').classList.remove('active');
}
function openRewardModal(index) {
  playSound('click');
  const lvl = levelDatabase[index];
  const reward = lvl.reward;
  document.getElementById('reward-modal-title').textContent = `${reward.title}`;
  document.getElementById('reward-text-content').textContent = reward.text;
  const mediaContainer = document.getElementById('reward-media-container');
  mediaContainer.innerHTML = '';
  if (reward.imageUrl) {
    const img = document.createElement('img');
    img.src = reward.imageUrl;
    mediaContainer.appendChild(img);
  }
  if (reward.audioUrl) {
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = reward.audioUrl;
    mediaContainer.appendChild(audio);
  }
  if (reward.videoUrl) {
    const video = document.createElement('video');
    video.controls = true;
    video.src = reward.videoUrl;
    mediaContainer.appendChild(video);
  }
  document.getElementById('reward-modal').classList.add('active');
}
function closeRewardModal() {
  playSound('click');
  document.getElementById('reward-modal').classList.remove('active');
}