document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("contact-form");
  const submitBtn = document.getElementById("submitButton");
  const resultBox = document.getElementById("form-results");

  const inputs = form.querySelectorAll("[data-validate]");

  /* ======================
     VALIDATION
  ====================== */

  function validateInput(input) {
    const type = input.dataset.validate;
    const value = input.value.trim();
    let valid = true;
    let message = "";

    // Empty check
    if (!value) {
      valid = false;
      message = "This field is required";
    }

    // Name & surname
    if (valid && (type === "name" || type === "surname")) {
      if (!/^[A-Za-z]+$/.test(value)) {
        valid = false;
        message = "Only letters allowed";
      }
    }

    // Email
    if (valid && type === "email") {
      if (!/^\S+@\S+\.\S+$/.test(value)) {
        valid = false;
        message = "Invalid email format";
      }
    }

    // Address
    if (valid && type === "address") {
      if (value.length < 5) {
        valid = false;
        message = "Address is too short";
      }
    }

    // Rating
    if (valid && type === "rating") {
      const num = Number(value);
      if (isNaN(num) || num < 0 || num > 10) {
        valid = false;
        message = "Value must be between 0 and 10";
      }
    }

    // Phone (GLOBAL)
    if (valid && type === "phone") {
      const digits = value.replace(/\D/g, "");
      if (digits.length < 7) {
        valid = false;
        message = "Phone number is too short";
      }
    }

    input.classList.toggle("is-valid", valid);
    input.classList.toggle("is-invalid", !valid);
    input.nextElementSibling.textContent = message;

    return valid;
  }

  function checkFormValidity() {
    const allValid = [...inputs].every(validateInput);
    submitBtn.disabled = !allValid;
  }

  inputs.forEach(input => {
    input.addEventListener("input", () => {
      validateInput(input);
      checkFormValidity();
    });
  });

  /* ======================
     GLOBAL PHONE MASKING
  ====================== */

  const phoneInput = document.getElementById("phone");

  phoneInput.addEventListener("input", e => {
    let digits = e.target.value.replace(/\D/g, "");

    // International max length
    digits = digits.slice(0, 15);

    let formatted = "+";
    if (digits.length > 0) formatted += digits.slice(0, 3);
    if (digits.length > 3) formatted += " " + digits.slice(3, 6);
    if (digits.length > 6) formatted += " " + digits.slice(6, 9);
    if (digits.length > 9) formatted += " " + digits.slice(9, 13);

    e.target.value = formatted.trim();
  });

  /* ======================
     SUBMIT HANDLER
  ====================== */

  form.addEventListener("submit", e => {
    e.preventDefault();

    const data = {
      name: firstName.value,
      surname: surname.value,
      email: email.value,
      phone: phone.value,
      address: address.value,
      ratings: [
        Number(rating1.value),
        Number(rating2.value),
        Number(rating3.value)
      ]
    };

    console.log(data);

    const avg =
      data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length;

    let avgClass =
      avg < 4 ? "avg-red" : avg < 7 ? "avg-orange" : "avg-green";

    resultBox.innerHTML = `
      <p>Name: ${data.name}</p>
      <p>Surname: ${data.surname}</p>
      <p>Email: ${data.email}</p>
      <p>Phone number: ${data.phone}</p>
      <p>Address: ${data.address}</p>
      <p class="${avgClass}">
        ${data.name} ${data.surname}: ${avg.toFixed(1)}
      </p>
    `;

    const popup = document.createElement("div");
    popup.className = "success-popup";
    popup.textContent = "Form submitted successfully!";
    document.body.appendChild(popup);

    setTimeout(() => popup.remove(), 3000);
  });

});

document.addEventListener('DOMContentLoaded', function () {
  const boardElement = document.getElementById('memoryGameBoard');
  const difficultySelect = document.getElementById('memoryDifficulty');
  const startButton = document.getElementById('memoryStartBtn');
  const restartButton = document.getElementById('memoryRestartBtn');
  const movesElement = document.getElementById('memoryMoves');
  const matchesElement = document.getElementById('memoryMatches');
  const totalPairsElement = document.getElementById('memoryTotalPairs');
  const winMessageElement = document.getElementById('memoryWinMessage');
  const timerElement = document.getElementById('timer');
  const bestResultEasyElement = document.getElementById('best-result-easy');
  const bestResultHardElement = document.getElementById('best-result-hard');

  // Data set: at least 6 unique items (here: 12 emojis)
  const icons = ['🍎', '🍌', '🍇', '🍉', '🍍', '🥝', '🍒', '🍓', '🥑', '🥕', '🌽', '🍆'];

  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let movesCount = 0;
  let matchesCount = 0;
  let totalPairs = 0;
  let elapsedTime = 0;
  let gameInProgress = false;
  let timer;

  // Retrieve best results from localStorage
  let bestResults = {
    easy: localStorage.getItem('best-easy') ? parseInt(localStorage.getItem('best-easy')) : Infinity,
    hard: localStorage.getItem('best-hard') ? parseInt(localStorage.getItem('best-hard')) : Infinity
  };

  // Initialize best results display
  function updateBestResultsDisplay() {
    bestResultEasyElement.textContent = bestResults.easy === Infinity ? '-' : bestResults.easy + ' moves';
    bestResultHardElement.textContent = bestResults.hard === Infinity ? '-' : bestResults.hard + ' moves';
  }

  // Fisher–Yates shuffle
  function shuffleArray(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Update stats panel
  function updateStats() {
    if (movesElement) movesElement.textContent = movesCount.toString();
    if (matchesElement) matchesElement.textContent = matchesCount.toString();
  }

  // Clear the game board
  function clearBoard() {
    boardElement.innerHTML = '';
  }

  // Reset the game state
  function resetState() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    movesCount = 0;
    matchesCount = 0;
    elapsedTime = 0;
    if (winMessageElement) {
      winMessageElement.textContent = '';
    }
  }

  // Initialize the game (called when starting or restarting)
  function initGame() {
    const difficulty = difficultySelect ? difficultySelect.value : 'easy';
    resetState();
    setupBoard(difficulty);
    updateStats();
    startTimer(); // Start the timer when the game is initialized (i.e., Start button clicked)
    updateBestResultsDisplay();
  }

  // Set up the game board
  function setupBoard(difficulty) {
    clearBoard();

    // Remove previous grid classes
    boardElement.classList.remove('memory-grid--easy', 'memory-grid--hard');
    boardElement.classList.add('memory-grid');

    if (difficulty === 'hard') {
      totalPairs = 12; // 6 x 4 = 24 cards
      boardElement.classList.add('memory-grid--hard');
    } else {
      totalPairs = 6; // 4 x 3 = 12 cards
      boardElement.classList.add('memory-grid--easy');
    }

    const selectedIcons = icons.slice(0, totalPairs);
    const cardValues = shuffleArray(selectedIcons.concat(selectedIcons)); // pair each icon

    cardValues.forEach(function (icon) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'memory-card';
      card.dataset.icon = icon;
      card.setAttribute('aria-label', 'Hidden card');

      card.innerHTML = `
        <div class="memory-card-inner">
          <div class="memory-card-face memory-card-front">?</div>
          <div class="memory-card-face memory-card-back">${icon}</div>
        </div>
      `;

      card.addEventListener('click', onCardClick);
      boardElement.appendChild(card);
    });

    if (totalPairsElement) {
      totalPairsElement.textContent = totalPairs.toString();
    }
  }

  // Handle card click
  function onCardClick(event) {
    const card = event.currentTarget;

    if (lockBoard) return;
    if (card === firstCard) return;
    if (card.classList.contains('matched')) return;

    card.classList.add('flipped');

    if (!firstCard) {
      firstCard = card;
      return;
    }

    secondCard = card;
    lockBoard = true;
    movesCount++;
    updateStats();

    checkForMatch();
  }

  // Check for a match between two flipped cards
  function checkForMatch() {
    const isMatch = firstCard.dataset.icon === secondCard.dataset.icon;

    if (isMatch) {
      setTimeout(handleMatch, 300);
    } else {
      setTimeout(unflipCards, 900); // ~1 second delay as requested
    }
  }

  // Handle matched cards
  function handleMatch() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');

    firstCard.removeEventListener('click', onCardClick);
    secondCard.removeEventListener('click', onCardClick);

    matchesCount++;
    updateStats();
    resetTurn();

    if (matchesCount === totalPairs) {
      stopTimer();
      saveBestResult();
      alert('You win!');
    }
  }

  // Unflip cards if they don't match
  function unflipCards() {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    resetTurn();
  }

  // Reset the turn variables
  function resetTurn() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
  }

  // Start the timer
  function startTimer() {
    if (gameInProgress) return; // Avoid starting the timer multiple times

    gameInProgress = true; // Set the flag to true to start the timer
    timer = setInterval(() => {
      elapsedTime++;
      timerElement.textContent = formatTime(elapsedTime); // Update timer display every second
    }, 1000);
  }

  // Stop the timer
  function stopTimer() {
    clearInterval(timer);
    gameInProgress = false; // Stop the timer and set the flag to false
  }

  // Format time for display (mm:ss)
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // Save the best result for the current difficulty
  function saveBestResult() {
    const difficulty = difficultySelect.value;
    const currentBest = bestResults[difficulty];

    if (movesCount < currentBest) {
      bestResults[difficulty] = movesCount;
      localStorage.setItem(`best-${difficulty}`, movesCount);
    }

    updateBestResultsDisplay();
  }

  // Event Listeners for difficulty + buttons
  if (difficultySelect) {
    difficultySelect.addEventListener('change', initGame);
  }

  if (startButton) {
    startButton.addEventListener('click', initGame); // Timer starts only when the Start button is clicked
  }

  if (restartButton) {
    restartButton.addEventListener('click', initGame); // Resets the game when clicked
  }

  // Initialize best results display
  updateBestResultsDisplay();
});