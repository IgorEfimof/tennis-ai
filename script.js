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
    const prediction = isLikelyWinner(result.html);

    let resultHTML = `<p>${result.html}</p>`;

    if (prediction.likely) {
        resultHTML += `
            <p style="color: red; font-weight: bold; font-size: 18px;">
                🔥 Горячая ставка: Игрок ${prediction.player} (ROI: ${prediction.roi}%)<br>
                <span style="font-size: 14px; color: #444;">Похожий паттерн ранее часто срабатывал.</span>
            </p>`;
    }

    if (result.anomalies.length > 0) {
        resultHTML += `
            <div style="margin-top: 25px; padding: 12px; background: #fffbe6; border-left: 5px solid orange; border-radius: 6px;">
                <p style="margin: 0; font-weight: bold; color: #cc7000; font-size: 16px;">🚨 Обнаружены аномалии коэффициентов:</p>
                <ul style="margin: 8px 0 0 16px; padding: 0; color: #555; font-size: 14px;">
                    ${result.anomalies.map(a => {
                        const color = a.direction === "вырос" ? "#cc0000" : "#009900";
                        const arrow = a.direction === "вырос" ? "⬆️" : "⬇️";
                        return `<li><span style="color: ${color}; font-weight: bold;">${arrow}</span> Игрок ${a.player} (Гейм ${a.game}) — коэффициент ${a.direction} на ${a.percent}%</li>`;
                    }).join("")}
                </ul>
                <p style="margin-top: 8px; font-size: 13px; color: #888;">✳️ Возможная ошибка рынка. Проверь ручной анализ перед ставкой.</p>
            </div>
        `;
    }

    document.getElementById("result").innerHTML = resultHTML;
    localStorage.setItem("lastAnalysis", result.html);
}

function clearInputs() {
    document.querySelectorAll("input").forEach(input => input.value = "");
    document.getElementById("result").innerHTML = "<p>Рекомендации будут здесь.</p>";
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
    let player1Sum = 0, player2Sum = 0;
    let player1Drop = 0, player2Drop = 0;
    let anomalies = [];

    for (let i = 0; i < games.length; i++) {
        const { player1, player2, game } = games[i];
        player1Sum += player1;
        player2Sum += player2;

        if (i > 0) {
            const prev = games[i - 1];
            const drop1 = prev.player1 - player1;
            const drop2 = prev.player2 - player2;

            player1Drop += drop1;
            player2Drop += drop2;

            const change1 = (drop1 / prev.player1) * 100;
            const change2 = (drop2 / prev.player2) * 100;

            if (Math.abs(change1) > 5) anomalies.push({ player: 1, game, direction: change1 < 0 ? "вырос" : "упал", percent: Math.abs(change1.toFixed(2)) });
            if (Math.abs(change2) > 5) anomalies.push({ player: 2, game, direction: change2 < 0 ? "вырос" : "упал", percent: Math.abs(change2.toFixed(2)) });
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

    return {
        html: `
            <strong>Средние коэффициенты:</strong><br>
            Игрок 1: ${avgP1.toFixed(2)} | Игрок 2: ${avgP2.toFixed(2)}<br>
            <strong>Имплайд-вероятности с поправкой:</strong><br>
            Игрок 1: ${(scoreP1 * 100).toFixed(1)}% | Игрок 2: ${(scoreP2 * 100).toFixed(1)}%<br>
            <strong>Value-коэффициенты (справедливые):</strong><br>
            Игрок 1: ${fairCoeffP1.toFixed(2)} | Игрок 2: ${fairCoeffP2.toFixed(2)}<br>
            <strong>Ожидаемый ROI:</strong><br>
            Игрок 1: ${roiP1.toFixed(2)}% | Игрок 2: ${roiP2.toFixed(2)}%<br><br>
            <strong>${recommendation}</strong>
        `,
        anomalies
    };
}

function isLikelyWinner(analysisHTML) {
    const roiRegex = /Value-ставка на Игрока ([12]) — ROI:\s*([0-9.]+)%/;
    const fairOddsRegex = /Value-коэффициенты \(справедливые\):\s*Игрок 1: ([0-9.]+) \| Игрок 2: ([0-9.]+)/;
    const avgOddsRegex = /Средние коэффициенты:\s*Игрок 1: ([0-9.]+) \| Игрок 2: ([0-9.]+)/;

    const roiMatch = analysisHTML.match(roiRegex);
    const fairMatch = analysisHTML.match(fairOddsRegex);
    const avgMatch = analysisHTML.match(avgOddsRegex);

    if (roiMatch && fairMatch && avgMatch) {
        const playerIndex = parseInt(roiMatch[1]);
        const roi = parseFloat(roiMatch[2]);
        const fairOdds = parseFloat(playerIndex === 1 ? fairMatch[1] : fairMatch[2]);
        const avgOdds = parseFloat(playerIndex === 1 ? avgMatch[1] : avgMatch[2]);

        if (roi >= 8 && fairOdds < avgOdds) {
            return { likely: true, player: playerIndex, roi: roi.toFixed(2) };
        }
    }
    return { likely: false };
}
