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
            document.getElementById("result").innerHTML = "<p>Пожалуйста, введите все коэффициенты для игр.</p>";
            return;
        }

        games.push({ game: i, player1, player2 });
    }

    const result = analyzeCoefficientsAI(games);
    const prediction = predictWinner(games);

    document.getElementById("result").innerHTML = `<p>${result}</p>`;

    const aiPrediction = document.getElementById("ai-prediction");
    if (prediction.winner) {
        aiPrediction.style.color = "#007700"; // зелёный
        aiPrediction.innerHTML =
            `🤖 Победит <strong>Игрок ${prediction.winner}</strong> (уверенность: ${prediction.confidence}%)`;
    } else {
        aiPrediction.style.color = "#777";
        aiPrediction.innerHTML = `🤖 Недостаточно уверенности для прогноза.`;
    }

    localStorage.setItem("lastAnalysis", result);
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

function analyzeCoefficientsAI(games) {
    let player1Sum = 0;
    let player2Sum = 0;

    for (let i = 0; i < games.length; i++) {
        player1Sum += games[i].player1;
        player2Sum += games[i].player2;
    }

    const avgP1 = player1Sum / games.length;
    const avgP2 = player2Sum / games.length;

    const fairImp1 = 1 / avgP1;
    const fairImp2 = 1 / avgP2;
    const totalImp = fairImp1 + fairImp2;

    const norm1 = fairImp1 / totalImp;
    const norm2 = fairImp2 / totalImp;

    const fairCoeff1 = 1 / norm1;
    const fairCoeff2 = 1 / norm2;

    const roiP1 = ((avgP1 - fairCoeff1) / fairCoeff1) * 100;
    const roiP2 = ((avgP2 - fairCoeff2) / fairCoeff2) * 100;

    let recommendation = "";
    if (roiP1 > 5 && avgP1 > fairCoeff1) {
        recommendation = `🟢 Value-ставка на Игрока 1 — ROI: ${roiP1.toFixed(2)}%`;
    } else if (roiP2 > 5 && avgP2 > fairCoeff2) {
        recommendation = `🟢 Value-ставка на Игрока 2 — ROI: ${roiP2.toFixed(2)}%`;
    } else {
        recommendation = `⚪️ Явной value-ставки не найдено.`;
    }

    return recommendation;
}

function predictWinner(games) {
    const weights = [0.05, 0.1, 0.15, 0.2, 0.25, 0.25];
    let imp1 = 0, imp2 = 0, sumWeights = 0;
    let diffs1 = [], diffs2 = [];

    for (let i = 0; i < games.length; i++) {
        const w = weights[i] || 0.1;
        const g = games[i];
        imp1 += (1 / g.player1) * w;
        imp2 += (1 / g.player2) * w;
        sumWeights += w;
    }

    const normImp1 = imp1 / sumWeights;
    const normImp2 = imp2 / sumWeights;
    const total = normImp1 + normImp2;

    const winProb1 = normImp1 / total;
    const winProb2 = normImp2 / total;

    for (let i = 1; i < games.length; i++) {
        diffs1.push(games[i - 1].player1 - games[i].player1);
        diffs2.push(games[i - 1].player2 - games[i].player2);
    }

    const dropTrend1 = diffs1.reduce((a, b) => a + b, 0);
    const dropTrend2 = diffs2.reduce((a, b) => a + b, 0);

    const finalScore1 = winProb1 + dropTrend1 * 0.02;
    const finalScore2 = winProb2 + dropTrend2 * 0.02;

    const confidence = (Math.abs(finalScore1 - finalScore2) * 100 + 50).toFixed(1);

    if (Math.abs(finalScore1 - finalScore2) < 0.05) {
        return { winner: null };
    }

    return {
        winner: finalScore1 > finalScore2 ? 1 : 2,
        confidence
    };
}
