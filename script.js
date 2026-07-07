const DIFFICULTY_SETTINGS = {
  easy: {
    pairs: 6,
    columns: 4
  },
  medium: {
    pairs: 10,
    columns: 5
  },
  hard: {
    pairs: 16,
    columns: 8
  }
};

const gameBoard = document.getElementById("gameBoard");
const movesEl = document.getElementById("moves");
const matchesEl = document.getElementById("matches");
const restartBtn = document.getElementById("restartBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const winMessage = document.getElementById("winMessage");
const difficultySelect = document.getElementById("difficultySelect");

let firstCard = null;
let secondCard = null;
let lockBoard = false;

let moves = 0;
let matches = 0;
let totalPairs = DIFFICULTY_SETTINGS.hard.pairs;

function startGame() {
  const difficulty = difficultySelect.value;
  const settings = DIFFICULTY_SETTINGS[difficulty];

  totalPairs = settings.pairs;

  firstCard = null;
  secondCard = null;
  lockBoard = false;
  moves = 0;
  matches = 0;

  movesEl.textContent = moves;
  matchesEl.textContent = `${matches} / ${totalPairs}`;
  winMessage.classList.add("hidden");

  gameBoard.innerHTML = "";

  gameBoard.style.gridTemplateColumns = `repeat(${settings.columns}, 1fr)`;

  if (!window.IMAGE_FILES || window.IMAGE_FILES.length < totalPairs) {
    gameBoard.innerHTML = `
      <p class="error">
        You need at least ${totalPairs} playable images for ${difficulty} mode.
      </p>
    `;
    return;
  }

  const selectedImages = pickRandomImages(window.IMAGE_FILES, totalPairs);

  const cards = [...selectedImages, ...selectedImages].map((image, index) => {
    return {
      id: index,
      image: image,
      matchId: image
    };
  });

  const shuffledCards = shuffleArray(cards);

  shuffledCards.forEach(cardData => {
    const card = createCard(cardData);
    gameBoard.appendChild(card);
  });
}

function pickRandomImages(images, count) {
  const shuffledImages = shuffleArray([...images]);
  return shuffledImages.slice(0, count);
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function createCard(cardData) {
  const card = document.createElement("div");
  card.classList.add("card");

  card.dataset.matchId = cardData.matchId;

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-front">
        <img src="images/card-cover.jpg" alt="Card cover" />
      </div>
      <div class="card-back">
        <img src="images/${cardData.image}" alt="Memory card image" />
      </div>
    </div>
  `;

  card.addEventListener("click", () => handleCardClick(card));

  return card;
}

function handleCardClick(card) {
  if (lockBoard) return;
  if (card.classList.contains("flipped")) return;
  if (card.classList.contains("matched")) return;

  card.classList.add("flipped");

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  moves++;
  movesEl.textContent = moves;

  checkForMatch();
}

function checkForMatch() {
  const isMatch = firstCard.dataset.matchId === secondCard.dataset.matchId;

  if (isMatch) {
    handleMatch();
  } else {
    handleMismatch();
  }
}

function handleMatch() {
  firstCard.classList.add("matched");
  secondCard.classList.add("matched");

  matches++;
  matchesEl.textContent = `${matches} / ${totalPairs}`;

  resetTurn();

  if (matches === totalPairs) {
    setTimeout(() => {
      winMessage.classList.remove("hidden");
    }, 500);
  }
}

function handleMismatch() {
  lockBoard = true;

  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");

    resetTurn();
  }, 900);
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

restartBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", startGame);

difficultySelect.addEventListener("change", startGame);

startGame();