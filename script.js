let currentPlayer = "";
let askedEquations = [];
let currentEquation;
let startTime;

function updatePlayerSelectionVisibility() {
    const playerSelection = document.getElementById("player-selection");
    const nextButton = document.getElementById("nextButton");
    playerSelection.style.display =
        nextButton.style.display !== "none" ? "block" : "none";
}

function showGame() {
    document.getElementById("game-view").style.display = "block";
    document.getElementById("stats-view").style.display = "none";
    document.getElementById("nextButton").style.display = "block";
    document.getElementById("submitButton").style.display = "none";
    document.getElementById("answer").style.display = "none";
    document.getElementById("equation").textContent = "";
    document.getElementById("message").textContent = "";
    updatePlayerSelectionVisibility();
}

function startGame() {
    const playerName = document.getElementById("player-name").value.trim();
    if (playerName) {
        currentPlayer = playerName;
        document.getElementById("player-selection").style.display = "none";
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
    document.getElementById("equation").textContent =
        `${equation.a} * ${equation.b} = ?`;
    document.getElementById("answer").value = "";
    startTime = Date.now();
}

function nextEquation() {
    const submitButton = document.getElementById("submitButton");
    const nextButton = document.getElementById("nextButton");
    const answerInput = document.getElementById("answer");
    submitButton.style.display = "block";
    nextButton.style.display = "none";
    answerInput.style.display = "block";
    updatePlayerSelectionVisibility();

    // Get stats from localStorage
    let stats =
        JSON.parse(localStorage.getItem("multiplicationStats")) || [];

    // Sort stats by time (descending order)
    stats.sort((a, b) => b.time - a.time);

    // Filter out equations that have been recently asked
    let availableEquations = stats.filter(
        (stat) =>
            !askedEquations.some(
                (asked) =>
                    asked.a === stat.equation.a && asked.b === stat.equation.b
            )
    );

    // Check if all possible equations (1-10 x 1-10) have been done
    const allPossibleEquations = 100; // 10 x 10 = 100 possible equations
    const uniqueEquations = new Set(
        stats.map((stat) => `${stat.equation.a}x${stat.equation.b}`)
    );

    if (uniqueEquations.size < allPossibleEquations) {
        // Not all equations have been done, so we might generate a new one
        let newEquation;
        do {
            newEquation = generateEquation();
        } while (
            stats.some(
                (stat) =>
                    stat.equation.a === newEquation.a &&
                    stat.equation.b === newEquation.b
            )
        );

        // Decide whether to use the new equation or an existing one
        if (Math.random() < 0.8 || availableEquations.length === 0) {
            currentEquation = newEquation;
        } else {
            currentEquation = availableEquations[0].equation;
        }
    } else if (availableEquations.length > 0) {
        // All equations have been done, pick from available equations
        currentEquation = availableEquations[0].equation;
    } else {
        // All equations have been asked recently, pick a random one
        const randomStat = stats[Math.floor(Math.random() * stats.length)];
        currentEquation = randomStat.equation;
    }

    // Add the current equation to the asked list
    askedEquations.push(currentEquation);

    displayEquation(currentEquation);
}

function saveResult(equation, time) {
    const result = { equation, time };
    let stats =
        JSON.parse(localStorage.getItem("multiplicationStats")) || [];
    stats.push(result);
    localStorage.setItem("multiplicationStats", JSON.stringify(stats));
}

function submitAnswer() {
    const userAnswer = parseInt(document.getElementById("answer").value);
    const timeTaken = (Date.now() - startTime) / 1000;
    const messageElement = document.getElementById("message");
    const submitButton = document.getElementById("submitButton");
    const nextButton = document.getElementById("nextButton");
    const answerInput = document.getElementById("answer");

    if (userAnswer === currentEquation.result) {
        messageElement.textContent = `Richtig! Zeit: ${formatGermanDecimal(timeTaken)} sekunden`;
        messageElement.style.color = "green";
        saveResult(currentEquation, timeTaken);
        // Hide submit button and show next button
        submitButton.style.display = "none";
        nextButton.style.display = "block";
        // Focus on the next button
        nextButton.focus();
    } else {
        messageElement.textContent = "Leider falsch. Probiere es nochmal!";
        messageElement.style.color = "red";
        answerInput.value = "";
        // Keep focus on the answer input
        answerInput.focus();
    }
}

nextButton.addEventListener("click", () => {
    if (!currentPlayer) {
        startGame();
    } else {
        nextEquation();
    }
});

submitButton.addEventListener("click", submitAnswer);

// Add event listener for keydown on the answer input
document.getElementById("answer").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        if (submitButton.style.display !== "none") {
            submitAnswer();
        } else {
            nextEquation();
            submitButton.style.display = "block";
            nextButton.style.display = "none";
        }
    }
});

// Add event listener for keydown on the document
document.addEventListener("keydown", (event) => {
    const answerInput = document.getElementById("answer");

    // Check if the pressed key is a number (0-9) or backspace
    if (
        (event.key >= "0" && event.key <= "9") ||
        event.key === "Backspace"
    ) {
        // If the answer input is not focused, focus it and let the default behavior happen
        if (document.activeElement !== answerInput) {
            answerInput.focus();
        }
    } else if (event.key === "Enter") {
        event.preventDefault();
        if (submitButton.style.display !== "none") {
            submitAnswer();
        } else {
            nextEquation();
            submitButton.style.display = "block";
            nextButton.style.display = "none";
        }
    }
});

// Modify saveResult function to use player-specific storage
function saveResult(equation, time) {
    const result = { equation, time };
    let stats =
        JSON.parse(
            localStorage.getItem(`multiplicationStats_${currentPlayer}`)
        ) || [];
    stats.push(result);
    localStorage.setItem(
        `multiplicationStats_${currentPlayer}`,
        JSON.stringify(stats)
    );
}

showGame();