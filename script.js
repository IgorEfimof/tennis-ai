document.getElementById("analyze-btn").addEventListener("click", analyzeGame);
document.getElementById("clear-btn").addEventListener("click", clearInputs);
document.getElementById("win-btn").addEventListener("click", markWin);
document.getElementById("lose-btn").addEventListener("click", markLoss);

const fields = [
    "game-5-player1", "game-5-player2",
    "game-6-player1", "game-6-player2",
    "game-7-player1", "game-7-player2",
    "game-8-player1", "game-8-player2",
    "game-9-player1", "game-9-player2",
    "game-10-player1", "game-10-player2"
];

fields.forEach((fieldId, index) => {
    const nextFieldId = fields[index + 1];
    addInputFormatting(fieldId, nextFieldId);
});

let gameHistory = JSON.parse(localStorage.getItem('gameHistory')) || [];

function analyzeGame() {
    const games = [];
    for (let i = 5; i <= 10; i++) {
        const player1 = parseFloat(document.getElementById(`game-${i}-player1`).value);
        const player2 = parseFloat(document.getElementById(`game-${i}-player2`).value);

        if (isNaN(player1) || isNaN(player2)) {
            document.getElementById("result").innerHTML = "<p>Пожалуйста, введите все коэффициенты для игр.</p>";
            return;
        }

        games.push({
            game: i,
            player1,
            player2
        });
    }

    const prediction = predictWinner(games);
    let resultHTML = `<p>Прогноз: Победит Игрок ${prediction.winner} с уверенностью ${prediction.confidence}%</p>`;
    document.getElementById("result").innerHTML = resultHTML;
    
    document.getElementById("ai-prediction").innerHTML = 
        `🤖 Прогноз AI: Победит Игрок ${prediction.winner} (уверенность: ${prediction.confidence}%)`;

    // Сохраняем прогноз в историю
    const analysis = {
        games,
        prediction
    };
    gameHistory.push(analysis);
    localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
}

function clearInputs() {
    document.querySelectorAll("input").forEach(input => input.value = "");
    document.getElementById("result").innerHTML = "<p>Рекомендации будут здесь.</p>";
    document.getElementById("ai-prediction").innerHTML = "";
}

function addInputFormatting(inputId, nextInputId) {
    const input = document.getElementById(inputId);
    input.addEventListener("input", () => {
        let value = input.value.replace(/[^0-9.]/g, "");
        input.value = value;
        
        if (input.value.length === 4 && nextInputId) {
            const nextInput = document.getElementById(nextInputId);
            if (nextInput) {
                nextInput.focus();
            }
        }
    });
}

function predictWinner(games) {
    let player1Sum = 0;
    let player2Sum = 0;

    games.forEach(game => {
        player1Sum += game.player1;
        player2Sum += game.player2;
    });

    const avgP1 = player1Sum / games.length;
    const avgP2 = player2Sum / games.length;

    const impP1 = 1 / avgP1;
    const impP2 = 1 / avgP2;
    const totalImp = impP1 + impP2;

    const winProb1 = impP1 / totalImp;
    const winProb2 = impP2 / totalImp;

    const winner = winProb1 > winProb2 ? 1 : 2;
    const confidence = Math.max(winProb1, winProb2) * 100;

    return { winner, confidence: confidence.toFixed(1) };
}

function markWin() {
    updateHistory('win');
}

function markLoss() {
    updateHistory('loss');
}

function updateHistory(result) {
    const latestAnalysis = gameHistory[gameHistory.length - 1];
    if (latestAnalysis) {
        latestAnalysis.result = result;
        localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
    }
}

