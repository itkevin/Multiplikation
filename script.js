let currentPlayer = "";
let askedEquations = [];
let currentEquation;
let startTime;

document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});

function focusInputField() {
    const answerInput = document.getElementById("answer");
    answerInput.focus();
    answerInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function startGame() {
    const playerName = document.getElementById("player-name").value.trim();
    if (playerName) {
        currentPlayer = playerName;
        document.getElementById("player-selection").style.display = 'none';
        document.getElementById("game-controls").style.display = 'block';
        document.getElementById("equation").style.display = 'block';
        document.getElementById("stats-button").style.display = 'block'; // Show stats button
        nextEquation();
    } else {
        alert("Bitte gib einen Spielernamen ein.");
    }
}

function generateEquation() {
    let a, b;
    do {
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * 10) + 1;
    } while (a * b > 100);
    return { a, b, result: a * b };
}

function displayEquation(equation) {
    document.getElementById("equation").textContent = `${equation.a} * ${equation.b} = ?`;
    document.getElementById("answer").value = "";
    startTime = Date.now();
    focusInputField();
}

function nextEquation() {
    let stats = JSON.parse(localStorage.getItem(`multiplicationStats_${currentPlayer}`)) || [];
    stats.sort((a, b) => b.time - a.time);

    let availableEquations = stats.filter(
        (stat) => !askedEquations.some(
            (asked) => asked.a === stat.equation.a && asked.b === stat.equation.b
        )
    );

    const allPossibleEquations = 100;
    const uniqueEquations = new Set(stats.map((stat) => `${stat.equation.a}x${stat.equation.b}`));

    if (uniqueEquations.size < allPossibleEquations) {
        let newEquation;
        do {
            newEquation = generateEquation();
        } while (stats.some((stat) => stat.equation.a === newEquation.a && stat.equation.b === newEquation.b));

        currentEquation = Math.random() < 0.8 || availableEquations.length === 0 ? newEquation : availableEquations[0].equation;
    } else if (availableEquations.length > 0) {
        currentEquation = availableEquations[0].equation;
    } else {
        currentEquation = stats[Math.floor(Math.random() * stats.length)].equation;
    }

    askedEquations.push(currentEquation);
    displayEquation(currentEquation);
}

function submitAnswer() {
    const userAnswer = parseInt(document.getElementById("answer").value);
    const timeTaken = (Date.now() - startTime) / 1000;
    const messageElement = document.getElementById("message");
    const answerInput = document.getElementById("answer");

    if (userAnswer === currentEquation.result) {
        messageElement.textContent = `Richtig! Zeit: ${formatGermanDecimal(timeTaken)} sekunden`;
        messageElement.className = 'alert alert-success';
        saveResult(currentEquation, timeTaken);
        answerInput.value = "";
        nextEquation();  // Automatically show next equation
    } else {
        messageElement.textContent = "Leider falsch. Probiere es nochmal!";
        messageElement.className = 'alert alert-danger';
        answerInput.value = "";
        focusInputField();
    }
}

function saveResult(equation, time) {
    const result = { equation, time };
    let stats = JSON.parse(localStorage.getItem(`multiplicationStats_${currentPlayer}`)) || [];
    stats.push(result);
    localStorage.setItem(`multiplicationStats_${currentPlayer}`, JSON.stringify(stats));
}

function formatGermanDecimal(number, decimals = 2) {
    return number.toFixed(decimals).replace('.', ',');
}

function updateStatsLink() {
    const playerName = document.getElementById("player-name").value.trim();
    const statsLink = document.getElementById("stats-link");
    statsLink.href = `stats.html?player=${encodeURIComponent(playerName)}`;
}

document.getElementById("answer").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        const submitButton = document.getElementById("submitButton");
        if (submitButton.style.display !== 'none') {
            submitAnswer();
        } else {
            nextEquation();
        }
    }
});

document.getElementById("startButton").addEventListener("click", startGame);

document.getElementById("nextButton").addEventListener("click", () => {
    if (!currentPlayer) {
        startGame();
    } else {
        nextEquation();
    }
});

document.getElementById("submitButton").addEventListener("click", submitAnswer);

document.getElementById("player-name").addEventListener("input", updateStatsLink);

document.addEventListener("keydown", (event) => {
    const answerInput = document.getElementById("answer");
    if ((event.key >= "0" && event.key <= "9") || event.key === "Backspace") {
        if (document.activeElement !== answerInput) {
            focusInputField();
        }
    }
});

document.addEventListener('DOMContentLoaded', (event) => {
    const urlParams = new URLSearchParams(window.location.search);
    const playerName = urlParams.get('player');
    if (playerName) {
        document.getElementById("player-name").value = playerName;
        updateStatsLink();
        startGame();  // Automatically start the game if player name is provided
    } else {
        // Hide equation, game controls, and stats button if game hasn't started
        document.getElementById("equation").style.display = 'none';
        document.getElementById("game-controls").style.display = 'none';
        document.getElementById("stats-button").style.display = 'none';
    }
});
