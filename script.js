const board = document.getElementById("gameBoard");
const movesText = document.getElementById("moves");
const timerText = document.getElementById("timer");
const winMessage = document.getElementById("winMessage");
const restartBtn = document.getElementById("restartBtn");
const difficultySelect = document.getElementById("difficulty");
const rankingModal = document.getElementById("rankingModal");
const rankingList = document.getElementById("rankingList");
const startBtn = document.getElementById("startBtn");

let allEmojis = ["🍎","🍌","🍓","🍇","🍍","🥝","🍒","🍉"];
let cardsArray;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let timer = 0;
let interval = null;
let matchedPairs = 0;
let currentLevel = 4;
let gameStarted = false;

/* ESCONDER TABULEIRO NO INÍCIO */
board.style.display = "none";

/* INICIAR JOGO */
function startGame() {
  board.innerHTML = "";
  moves = 0;
  timer = 0;
  matchedPairs = 0;
  movesText.textContent = 0;
  timerText.textContent = 0;
  winMessage.textContent = "";
  firstCard = null;
  secondCard = null;
  lockBoard = false;

  clearInterval(interval);
  interval = setInterval(() => {
    timer++;
    timerText.textContent = timer;
  }, 1000);

  currentLevel = Number(difficultySelect.value);
  let selectedEmojis = allEmojis.slice(0, currentLevel);

  cardsArray = [...selectedEmojis, ...selectedEmojis];
  cardsArray.sort(() => Math.random() - 0.5);

  cardsArray.forEach(emoji => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.emoji = emoji;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back">${emoji}</div>
      </div>
    `;

    card.addEventListener("click", flipCard);
    board.appendChild(card);
  });
}

/* BOTÃO INICIAR */
startBtn.addEventListener("click", () => {
  board.style.display = "grid";
  startBtn.style.display = "none";
  gameStarted = true;
  startGame();
});

/* REINICIAR */
restartBtn.addEventListener("click", () => {
  if (!gameStarted) return;
  startGame();
});

/* TROCAR DIFICULDADE */
difficultySelect.addEventListener("change", () => {
  if (!gameStarted) return;
  startGame();
});

/* VIRAR CARTA */
function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  moves++;
  movesText.textContent = moves;

  checkMatch();
}

/* VERIFICAR */
function checkMatch() {
  if (firstCard.dataset.emoji === secondCard.dataset.emoji) {
    matchedPairs++;
    firstCard.removeEventListener("click", flipCard);
    secondCard.removeEventListener("click", flipCard);
    resetBoard();

    if (matchedPairs === currentLevel) {
      clearInterval(interval);
      let levelName = difficultySelect.options[difficultySelect.selectedIndex].text;
      winMessage.textContent = `🏆 Vitória no modo ${levelName}! ${moves} jogadas em ${timer}s`;
      saveRanking();
    }

  } else {
    lockBoard = true;
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      resetBoard();
    }, 800);
  }
}

function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

/* SALVAR RANKING */
function saveRanking() {
  let ranking = JSON.parse(localStorage.getItem("ranking")) || {};
  if (!ranking[currentLevel]) ranking[currentLevel] = [];

  ranking[currentLevel].push({ moves, time: timer });
  ranking[currentLevel].sort((a,b) => a.moves - b.moves);
  ranking[currentLevel] = ranking[currentLevel].slice(0,5);

  localStorage.setItem("ranking", JSON.stringify(ranking));
}

/* MOSTRAR RANKING */
document.getElementById("showRanking").addEventListener("click", () => {
  rankingModal.style.display = "flex";
  rankingList.innerHTML = "";

  let ranking = JSON.parse(localStorage.getItem("ranking")) || {};
  let levelRanking = ranking[currentLevel] || [];

  if (levelRanking.length === 0) {
    rankingList.innerHTML = "<li>Nenhum registro ainda</li>";
  } else {
    levelRanking.forEach((r, index) => {
      rankingList.innerHTML += `<li>${index+1}º - ${r.moves} jogadas (${r.time}s)</li>`;
    });
  }
});

function closeRanking() {
  rankingModal.style.display = "none";
}
