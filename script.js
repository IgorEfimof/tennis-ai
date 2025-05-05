document.getElementById("analyze-btn").addEventListener("click", analyzeGame);
document.getElementById("clear-btn").addEventListener("click", clearInputs);
document.getElementById("victory-btn").addEventListener("click", handleVictory);
document.getElementById("loss-btn").addEventListener("click", handleLoss);

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

let prediction = {};

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

    const result = analyzeCoefficientsAI(games);
    prediction = predictWinner(games);
    
    let history = JSON.parse(localStorage.getItem("predictionHistory") || "[]");
    let accuracy = 0;
    if (history.length > 0) {
        const correctPredictions = history.filter(item => item.result === "победил" && item.prediction.winner === item.resultPlayer).length;
        accuracy = (correctPredictions / history.length) * 100;
    }

    let adjustedConfidence = prediction.confidence;
    if (accuracy > 80) {
        adjustedConfidence *= 1.1;
    } else if (accuracy < 60) {
        adjustedConfidence *= 0.9;
    }

    let resultHTML = `<p>${result}</p>`;
    document.getElementById("result").innerHTML = resultHTML;

    if (prediction.winner) {
        document.getElementById("ai-prediction").innerHTML =
            `🤖 Прогноз AI: Победит Игрок ${prediction.winner} (уверенность: ${(adjustedConfidence).toFixed(1)}%)<br>` +
            (accuracy > 0 ? `📊 Историческая точность: ${accuracy.toFixed(1)}%` : '');
    } else {
        document.getElementById("ai-prediction").innerHTML =
            `🤖 Прогноз AI: Недостаточно данных для точного прогноза.`;
    }

    localStorage.setItem("lastAnalysis", result);
}

function handleVictory() {
    const result = { 
        game: prediction.game, 
        prediction: prediction, 
        result: "победил",
        resultPlayer: prediction.winner
    };
    saveGameResult(result);
}

function handleLoss() {
    const result = { 
        game: prediction.game, 
        prediction: prediction, 
        result: "проиграл",
        resultPlayer: prediction.winner === 1 ? 2 : 1 
    };
    saveGameResult(result);
}

function saveGameResult(result) {
    let history = JSON.parse(localStorage.getItem("predictionHistory") || "[]");
    history.push(result);
    localStorage.setItem("predictionHistory", JSON.stringify(history));
}

function clearInputs() {
    document.querySelectorAll("input").forEach(input => input.value = "");
    document.getElementById("result").innerHTML = "<p>Рекомендации будут здесь.</p>";
    document.getElementById("ai-prediction").innerHTML = "";
}

function addInputFormatting(inputId, nextInputId) {
    const input = document.getElementById(inputId);
    input.addEventListener("input", () => {
        let value = input.value.replace(/[^0-9]/g, "");
        if (value.length === 0) {
            input.value = "";
        } else if (value.length === 1) {
            input.value = value + ".";
        } else if (value.length > 1) {
            input.value = value.slice(0, 1) + "." + value.slice(1, 3);
        }

        if (input.value.length === 4 && nextInputId) {
            const nextInput = document.getElementById(nextInputId);
            if (nextInput) {
                nextInput.focus();
            }
        }
    });
}

// Функции анализа коэффициентов и прогноза
function analyzeCoefficientsAI(games) {
    // Логика анализа коэффициентов...
}

function predictWinner(games) {
    // Логика предсказания победителя...
}
