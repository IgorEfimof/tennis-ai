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

        games.push({
            game: i,
            player1,
            player2
        });
    }

    const result = analyzeCoefficientsAI(games);
    const prediction = predictWinner(games);

    let resultHTML = `<p>${result}</p>`;
    document.getElementById("result").innerHTML = resultHTML;

    if (prediction.winner) {
        document.getElementById("ai-prediction").innerHTML =
            `🤖 Прогноз AI: Победит Игрок ${prediction.winner} (уверенность: ${prediction.confidence}%)`;
    } else {
        document.getElementById("ai-prediction").innerHTML =
            `🤖 Прогноз AI: Недостаточно данных для точного прогноза.`;
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
    let player1Drop = 0;
    let player2Drop = 0;

    for (let i = 0; i < games.length; i++) {
        const { player1, player2 } = games[i];
        player1Sum += player1;
        player2Sum += player2;

        if (i > 0) {
            const prev = games[i - 1];
            player1Drop += prev.player1 - player1;
            player2Drop += prev.player2 - player2;
        }
    }

    const avgP1 = player1Sum / games.length;
    const avgP2 = player2Sum / games.length;

    let impP1 = 1 / avgP1;
    let impP2 = 1 / avgP2;
    const totalImp = impP1 + impP2;

    impP1 /= totalImp;
    impP2 /= totalImp;

    const dropBonus1 = Math.max(0, player1Drop) * 0.05;
    const dropBonus2 = Math.max(0, player2Drop) * 0.05;

    const scoreP1 = impP1 + dropBonus1;
    const scoreP2 = impP2 + dropBonus2;

    const fairCoeffP1 = 1 / scoreP1;
    const fairCoeffP2 = 1 / scoreP2;

    const roiP1 = ((avgP1 - fairCoeffP1) / fairCoeffP1) * 100;
    const roiP2 = ((avgP2 - fairCoeffP2) / fairCoeffP2) * 100;

    let recommendation = "";
    if (avgP1 > fairCoeffP1 && roiP1 > 5) {
        recommendation = `🟢 Value-ставка на Игрока 1 — ROI: ${roiP1.toFixed(2)}%`;
    } else if (avgP2 > fairCoeffP2 && roiP2 > 5) {
        recommendation = `🟢 Value-ставка на Игрока 2 — ROI: ${roiP2.toFixed(2)}%`;
    } else {
        recommendation = `⚪️ Явной value-ставки не найдено. Лучше не рисковать.`;
    }

    return `
        <strong>Средние коэффициенты:</strong><br>
        Игрок 1: ${avgP1.toFixed(2)} | Игрок 2: ${avgP2.toFixed(2)}<br>
        <strong>Имплайд-вероятности с поправкой:</strong><br>
        Игрок 1: ${(scoreP1 * 100).toFixed(1)}% | Игрок 2: ${(scoreP2 * 100).toFixed(1)}%<br>
        <strong>Value-коэффициенты (справедливые):</strong><br>
        Игрок 1: ${fairCoeffP1.toFixed(2)} | Игрок 2: ${fairCoeffP2.toFixed(2)}<br>
        <strong>Ожидаемый ROI:</strong><br>
        Игрок 1: ${roiP1.toFixed(2)}% | Игрок 2: ${roiP2.toFixed(2)}%<br><br>
        <strong>${recommendation}</strong>
    `;
}

function predictWinner(games) {
    let player1Trend = 0;
    let player2Trend = 0;
    let drops = 0;

    for (let i = 1; i < games.length; i++) {
        const prev = games[i - 1];
        const curr = games[i];

        const drop1 = prev.player1 - curr.player1;
        const drop2 = prev.player2 - curr.player2;

        if (drop1 > 0) {
            player1Trend += drop1;
            drops++;
        }
        if (drop2 > 0) {
            player2Trend += drop2;
            drops++;
        }
    }

    const avg1 = games.reduce((sum, g) => sum + g.player1, 0) / games.length;
    const avg2 = games.reduce((sum, g) => sum + g.player2, 0) / games.length;

    const imp1 = 1 / avg1;
    const imp2 = 1 / avg2;
    const total = imp1 + imp2;

    const winProb1 = (imp1 / total) + (player1Trend * 0.01);
    const winProb2 = (imp2 / total) + (player2Trend * 0.01);

    if (Math.abs(winProb1 - winProb2) < 0.05) {
        return { winner: null };
    }

    const winner = winProb1 > winProb2 ? 1 : 2;
    const confidence = ((Math.max(winProb1, winProb2)) * 100).toFixed(1);

    return { winner, confidence };
}
