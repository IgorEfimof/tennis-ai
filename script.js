document.getElementById("analyze-btn").addEventListener("click", analyzeGame);
document.getElementById("clear-btn").addEventListener("click", clearInputs);

function analyzeGame() {
    const games = {};
    for (let i = 5; i <= 10; i++) {
        const player1 = parseFloat(document.getElementById(`game-${i}-player1`).value);
        const player2 = parseFloat(document.getElementById(`game-${i}-player2`).value);

        if (isNaN(player1) || isNaN(player2)) {
            document.getElementById("result").innerHTML = "<p>Пожалуйста, введите все коэффициенты для игр.</p>";
            return;
        }

        games[`game${i}`] = [player1, player2];
    }

    const result = analyzeWinner(games);
    document.getElementById("result").innerHTML = `<p>${result}</p>`;
}

function clearInputs() {
    document.querySelectorAll("input").forEach(input => input.value = "");
    document.getElementById("result").innerHTML = "<p>Рекомендации будут здесь.</p>";
}

function analyzeWinner(data) {
    let player1Score = 0;
    let player2Score = 0;

    Object.values(data).forEach(([player1, player2]) => {
        if (player1 < player2) {
            player1Score++;
        } else {
            player2Score++;
        }
    });

    if (player1Score > player2Score) {
        return "Игрок 1 доминирует и, скорее всего, победит.";
    } else {
        return "Игрок 2 доминирует и, скорее всего, победит.";
    }
}
}
