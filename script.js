document.getElementById("analyze-btn").addEventListener("click", analyzeGame);
document.getElementById("clear-btn").addEventListener("click", clearInputs);

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

function analyzeGame() {
    const games = [];
    for (let i = 5; i <= 10; i++) {
        const player1 = parseFloat(document.getElementById(`game-${i}-player1`).value);
        const player2 = parseFloat(document.getElementById(`game-${i}-player2`).value);

        if (isNaN(player1) || isNaN(player2)) {
            document.getElementById("result").innerHTML = "<p style='color: red;'>Пожалуйста, введите все коэффициенты для игр.</p>";
            document.getElementById("ai-prediction").innerHTML = "";
            return;
        }

        games.push({ player1, player2 });
    }

    const prediction = smartAIPrediction(games);

    if (prediction.winner) {
        document.getElementById("result").innerHTML = "";
        document.getElementById("ai-prediction").innerHTML =
            `<span style="color: green; font-weight: bold;">🤖 Прогноз AI: Победит Игрок ${prediction.winner} (уверенность: ${prediction.confidence}%)</span>`;
    } else {
        document.getElementById("result").innerHTML = "";
        document.getElementById("ai-prediction").innerHTML =
            `<span style="color: orange; font-weight: bold;">🤖 Прогноз AI: Недостаточно уверенности для прогноза.</span>`;
    }

    localStorage.setItem("lastAnalysis", JSON.stringify(prediction));
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

// Умный анализ коэффициентов
function smartAIPrediction(games) {
    let totalAdj1 = 0;
    let totalAdj2 = 0;
    let player1Trend = 0;
    let player2Trend = 0;

    for (let i = 0; i < games.length; i++) {
        const { player1, player2 } = games[i];
        const imp1 = 1 / player1;
        const imp2 = 1 / player2;
        const sumImp = imp1 + imp2;

        const adj1 = imp1 / sumImp;
        const adj2 = imp2 / sumImp;

        totalAdj1 += adj1;
        totalAdj2 += adj2;

        if (i > 0) {
            const prev = games[i - 1];
            const drop1 = prev.player1 - player1;
            const drop2 = prev.player2 - player2;
            if (drop1 > 0) player1Trend += drop1;
            if (drop2 > 0) player2Trend += drop2;
        }
    }

    const avgAdj1 = totalAdj1 / games.length;
    const avgAdj2 = totalAdj2 / games.length;

    const trendWeight = 0.01; // Вес тренда
    const score1 = avgAdj1 + player1Trend * trendWeight;
    const score2 = avgAdj2 + player2Trend * trendWeight;

    const diff = Math.abs(score1 - score2);
    const threshold = 0.05; // Порог для уверенного прогноза

    if (diff < threshold) return { winner: null };

    const winner = score1 > score2 ? 1 : 2;
    const confidence = (Math.max(score1, score2) * 100).toFixed(1);

    return { winner, confidence };
}
