document.getElementById("analyze-btn").addEventListener("click", analyzeGame);
document.getElementById("clear-btn").addEventListener("click", clearInputs);
document.getElementById("win-btn").addEventListener("click", () => saveResult(true));
document.getElementById("lose-btn").addEventListener("click", () => saveResult(false));

function analyzeGame() {
    const games = [];
    for (let i = 5; i <= 10; i++) {
        const p1 = parseFloat(document.getElementById(`game-${i}-player1`).value);
        const p2 = parseFloat(document.getElementById(`game-${i}-player2`).value);

        if (isNaN(p1) || isNaN(p2)) {
            document.getElementById("ai-prediction").innerText = "Пожалуйста, заполните все поля.";
            return;
        }

        games.push({ player1: p1, player2: p2 });
    }

    const result = smartAIAnalysis(games);
    localStorage.setItem("lastAnalysisData", JSON.stringify({ games, result }));

    document.getElementById("ai-prediction").innerText =
        `🤖 AI прогноз: Победит Игрок ${result.winner} (уверенность: ${result.confidence}%)`;
}

function clearInputs() {
    document.querySelectorAll("input").forEach(input => input.value = "");
    document.getElementById("ai-prediction").innerText = "";
}

function smartAIAnalysis(games) {
    let trendP1 = 0, trendP2 = 0;
    let avgP1 = 0, avgP2 = 0;

    games.forEach((g, i) => {
        avgP1 += g.player1;
        avgP2 += g.player2;
        if (i > 0) {
            trendP1 += games[i - 1].player1 - g.player1;
            trendP2 += games[i - 1].player2 - g.player2;
        }
    });

    avgP1 /= games.length;
    avgP2 /= games.length;

    let imp1 = 1 / avgP1;
    let imp2 = 1 / avgP2;
    const totalImp = imp1 + imp2;

    imp1 /= totalImp;
    imp2 /= totalImp;

    const boostP1 = trendP1 * 0.02;
    const boostP2 = trendP2 * 0.02;

    const score1 = imp1 + boostP1;
    const score2 = imp2 + boostP2;

    const winner = score1 > score2 ? 1 : 2;
    const confidence = Math.abs(score1 - score2) * 100 + 50;

    return { winner, confidence: confidence.toFixed(1) };
}

function saveResult(didWin) {
    const last = JSON.parse(localStorage.getItem("lastAnalysisData"));
    if (!last) return;

    const entry = {
        timestamp: new Date().toISOString(),
        prediction: last.result.winner,
        confidence: last.result.confidence,
        actualResult: didWin ? "win" : "loss",
        games: last.games
    };

    let history = JSON.parse(localStorage.getItem("history") || "[]");
    history.push(entry);
    localStorage.setItem("history", JSON.stringify(history));
    alert("Результат сохранен.");
}
