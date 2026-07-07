const DIFFICULTY_SETTINGS = {
    easy: {
        pairs: 6,
        desktop: { columns: 4, rows: 3 },
        tablet: { columns: 4, rows: 3 },
        mobile: { columns: 3, rows: 4 }
    },
    medium: {
        pairs: 10,
        desktop: { columns: 5, rows: 4 },
        tablet: { columns: 5, rows: 4 },
        mobile: { columns: 4, rows: 5 }
    },
    hard: {
        pairs: 16,
        desktop: { columns: 8, rows: 4 },
        tablet: { columns: 4, rows: 8 },
        mobile: { columns: 4, rows: 8 }
    }
};

const gameBoard = document.getElementById("gameBoard");
const movesEl = document.getElementById("moves");
const matchesEl = document.getElementById("matches");
const restartBtn = document.getElementById("restartBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const winMessage = document.getElementById("winMessage");
const difficultySelect = document.getElementById("difficultySelect");
const timerEl = document.getElementById("timer");
const finalStatsEl = document.getElementById("finalStats");
const flipSound = document.getElementById("flipSound");
const winSound = document.getElementById("winSound");

let firstCard = null;
let secondCard = null;
let lockBoard = false;

let moves = 0;
let matches = 0;
let totalPairs = DIFFICULTY_SETTINGS.hard.pairs;

let timerInterval = null;
let secondsElapsed = 0;

function startTimer() {
    stopTimer();

    secondsElapsed = 0;
    timerEl.textContent = formatTime(secondsElapsed);

    timerInterval = setInterval(() => {
        secondsElapsed++;
        timerEl.textContent = formatTime(secondsElapsed);
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const paddedMinutes = String(minutes).padStart(2, "0");
    const paddedSeconds = String(seconds).padStart(2, "0");

    return `${paddedMinutes}:${paddedSeconds}`;
}

function startGame() {
    const difficulty = difficultySelect.value;
    const settings = DIFFICULTY_SETTINGS[difficulty];

    totalPairs = settings.pairs;

    firstCard = null;
    secondCard = null;
    lockBoard = false;
    moves = 0;
    matches = 0;

    startTimer();

    movesEl.textContent = moves;
    matchesEl.textContent = `${matches} / ${totalPairs}`;
    winMessage.classList.add("hidden");

    gameBoard.innerHTML = "";

    updateBoardSizing(settings);

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
    console.log("card flipped");

    if (lockBoard) return;
    if (card.classList.contains("flipped")) return;
    if (card.classList.contains("matched")) return;

    card.classList.add("flipped");
    playFlipSound();

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
        stopTimer();
        playWinSound();
        
        const finalTime = formatTime(secondsElapsed);

        finalStatsEl.textContent = `You completed the game in ${finalTime} with ${moves} moves.`;

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

function playFlipSound() {
    if (!flipSound) return;

    flipSound.currentTime = 0;
    flipSound.play().catch(() => {
        // Some browsers block audio until the user interacts with the page.
        // Since this runs on card click, it should usually work.
    });
}

function playWinSound() {
  if (!winSound) return;

  winSound.currentTime = 0;
  winSound.play().catch(() => {
    // Browser may block audio in rare cases.
  });
}

function getLayout(settings) {
    const width = window.innerWidth;

    if (width <= 600) {
        return settings.mobile;
    }

    if (width <= 900) {
        return settings.tablet;
    }

    return settings.desktop;
}

function updateBoardSizing(settings) {
    const layout = getLayout(settings);

    const boardRect = gameBoard.getBoundingClientRect();

    const gap = parseFloat(getComputedStyle(gameBoard).gap) || 12;

    const availableWidth = boardRect.width;
    const availableHeight = boardRect.height;

    const totalGapWidth = gap * (layout.columns - 1);
    const totalGapHeight = gap * (layout.rows - 1);

    const maxCardWidth = (availableWidth - totalGapWidth) / layout.columns;
    const maxCardHeight = (availableHeight - totalGapHeight) / layout.rows;

    const cardRatio = 1.2;

    let cardWidth = maxCardWidth;
    let cardHeight = cardWidth * cardRatio;

    if (cardHeight > maxCardHeight) {
        cardHeight = maxCardHeight;
        cardWidth = cardHeight / cardRatio;
    }

    gameBoard.style.setProperty("--card-size", `${cardWidth}px`);
    gameBoard.style.setProperty("--card-height", `${cardHeight}px`);
    gameBoard.style.gridTemplateColumns = `repeat(${layout.columns}, var(--card-size))`;
}

restartBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", startGame);

window.addEventListener("resize", () => {
    const difficulty = difficultySelect.value;
    const settings = DIFFICULTY_SETTINGS[difficulty];

    updateBoardSizing(settings);
});

difficultySelect.addEventListener("change", startGame);

startGame();