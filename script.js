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

    if (!winner) {
        document.getElementById("result").innerHTML = `<p style="color: green;">🤖 Недостаточно уверенности для прогноза.</p>`;
        document.getElementById("ai-prediction").innerHTML = "";
        return;
    }

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

    const resultHTML = `
        <p style="color: green; font-weight: bold;">
            🤖 Победитель: Игрок ${winner} (уверенность: ${confidence}%)
        </p>
        <p>
            <strong>Средние коэффициенты:</strong> Игрок 1: ${avg1} | Игрок 2: ${avg2}<br>
            <strong>Справедливые коэффициенты (AI):</strong> Игрок 1: ${fair1} | Игрок 2: ${fair2}<br>
            <strong>Value-переоценка:</strong> 
            Игрок 1: ${vp1}% | Игрок 2: ${vp2}%
        </p>
    `;

    document.getElementById("result").innerHTML = resultHTML;
    document.getElementById("ai-prediction").innerHTML = "";
    localStorage.setItem("lastAnalysis", resultHTML);

    historyData.push({
        avg1: parseFloat(avg1),
        avg2: parseFloat(avg2),
        fair1: parseFloat(fair1),
        fair2: parseFloat(fair2),
        value1: parseFloat(vp1),
        value2: parseFloat(vp2)
    });
    renderChart();
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
        return { winner: null };
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

// ==== Chart.js визуализация ====
let chartInstance = null;
const historyData = [];

function renderChart() {
    const labels = historyData.map((_, i) => `Анализ ${i + 1}`);
    const avg1Data = historyData.map(h => h.avg1);
    const avg2Data = historyData.map(h => h.avg2);
    const fair1Data = historyData.map(h => h.fair1);
    const fair2Data = historyData.map(h => h.fair2);
    const value1Data = historyData.map(h => h.value1);
    const value2Data = historyData.map(h => h.value2);

    const ctx = document.getElementById('chart').getContext('2d');

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Коэф. Игрок 1',
                    data: avg1Data,
                    borderColor: 'blue',
                    backgroundColor: 'blue',
                    tension: 0.3
                },
                {
                    label: 'Коэф. Игрок 2',
                    data: avg2Data,
                    borderColor: 'red',
                    backgroundColor: 'red',
                    tension: 0.3
                },
                {
                    label: 'Справедл. Игрок 1',
                    data: fair1Data,
                    borderColor: 'blue',
                    borderDash: [5, 5],
                    tension: 0.3
                },
                {
                    label: 'Справедл. Игрок 2',
                    data: fair2Data,
                    borderColor: 'red',
                    borderDash: [5, 5],
                    tension: 0.3
                },
                {
                    label: 'Value Игрок 1 (%)',
                    data: value1Data,
                    borderColor: 'green',
                    tension: 0.3
                },
                {
                    label: 'Value Игрок 2 (%)',
                    data: value2Data,
                    borderColor: 'orange',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Значения'
                    }
                }
            }
        }
    });
}
