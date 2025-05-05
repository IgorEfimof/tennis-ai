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

    const { winner, confidence, fairOdds, valuePercents } = predictWinner(games);

    const playerAvg = games.reduce((acc, g) => {
        acc.player1 += g.player1;
        acc.player2 += g.player2;
        return acc;
    }, { player1: 0, player2: 0 });

    const avg1 = (playerAvg.player1 / games.length).toFixed(2);
    const avg2 = (playerAvg.player2 / games.length).toFixed(2);

    const vp1 = valuePercents.player1.toFixed(1);
    const vp2 = valuePercents.player2.toFixed(1);
    const fair1 = fairOdds.player1.toFixed(2);
    const fair2 = fairOdds.player2.toFixed(2);

    // Доп. рынки:
    const totalPointsArr = games.map(g => g.player1 + g.player2);
    const avgTotal = totalPointsArr.reduce((a, b) => a + b, 0) / games.length;
    const totalLine = 18.5;
    const totalPrediction = `${avgTotal.toFixed(1)} → ${avgTotal > totalLine ? 'Тотал Больше' : 'Тотал Меньше'} ${totalLine}`;

    const spreads = games.map(g => g.player1 - g.player2);
    const avgSpread = spreads.reduce((a, b) => a + b, 0) / spreads.length;
    const handicapPrediction = `Фора ${avgSpread > 0 ? '-' : '+'}${Math.abs(avgSpread).toFixed(1)} на Игрока ${avgSpread > 0 ? '1' : '2'}`;

    let evenCount = 0;
    games.forEach(g => {
        const total = g.player1 + g.player2;
        if (total % 2 === 0) evenCount++;
    });
    const evenOrOdd = evenCount >= 4 ? `Чет (в ${evenCount} из 6 игр)` : `Нечет (в ${6 - evenCount} из 6 игр)`;

    let resultHTML = `
        <p style="color: green; font-weight: bold;">
            🤖 Победитель: ${winner ? `Игрок ${winner} (уверенность: ${confidence}%)` : 'Недостаточно уверенности для прогноза'}
        </p>
        <p>
            <strong>Средние коэффициенты:</strong> Игрок 1: ${avg1} | Игрок 2: ${avg2}<br>
            <strong>Справедливые коэффициенты (AI):</strong> Игрок 1: ${fair1} | Игрок 2: ${fair2}<br>
            <strong>Value-переоценка:</strong> Игрок 1: ${vp1}% | Игрок 2: ${vp2}%
        </p>
        <p><strong>Доп. рынки:</strong></p>
        <ul>
            <li>🏓 <strong>Средний тотал:</strong> ${totalPrediction}</li>
            <li>📈 <strong>Средняя фора:</strong> ${handicapPrediction}</li>
            <li>⚖️ <strong>Чет/Нечет:</strong> ${evenOrOdd}</li>
        </ul>
    `;

    document.getElementById("result").innerHTML = resultHTML;
    document.getElementById("ai-prediction").innerHTML = "";
    localStorage.setItem("lastAnalysis", resultHTML);
}

function predictWinner(games) {
    const avg1 = games.reduce((sum, g) => sum + g.player1, 0) / games.length;
    const avg2 = games.reduce((sum, g) => sum + g.player2, 0) / games.length;

    const imp1 = 1 / avg1;
    const imp2 = 1 / avg2;
    const total = imp1 + imp2;

    let trend1 = 0, trend2 = 0;
    for (let i = 1; i < games.length; i++) {
        trend1 += Math.max(0, games[i - 1].player1 - games[i].player1);
        trend2 += Math.max(0, games[i - 1].player2 - games[i].player2);
    }

    const adjImp1 = imp1 / total + trend1 * 0.015;
    const adjImp2 = imp2 / total + trend2 * 0.015;
    const adjTotal = adjImp1 + adjImp2;

    const prob1 = adjImp1 / adjTotal;
    const prob2 = adjImp2 / adjTotal;

    const fairOdds = {
        player1: 1 / prob1,
        player2: 1 / prob2
    };

    const valuePercents = {
        player1: ((avg1 - fairOdds.player1) / fairOdds.player1) * 100,
        player2: ((avg2 - fairOdds.player2) / fairOdds.player2) * 100
    };

    if (Math.abs(prob1 - prob2) < 0.05) {
        return { winner: null, confidence: null, fairOdds, valuePercents };
    }

    const winner = prob1 > prob2 ? 1 : 2;
    const confidence = ((Math.max(prob1, prob2)) * 100).toFixed(1);

    return { winner, confidence, fairOdds, valuePercents };
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
