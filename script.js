// JavaScript логика с ИИ
document.getElementById("analyze-btn").addEventListener("click", analyzeGame);
document.getElementById("clear-btn").addEventListener("click", clearInputs);

function analyzeGame() {
    const game5Player1 = parseFloat(document.getElementById("game-5-player1").value);
    const game5Player2 = parseFloat(document.getElementById("game-5-player2").value);

    const game6Player1 = parseFloat(document.getElementById("game-6-player1").value);
    const game6Player2 = parseFloat(document.getElementById("game-6-player2").value);

    if (isNaN(game5Player1) || isNaN(game5Player2) || isNaN(game6Player1) || isNaN(game6Player2)) {
        document.getElementById("result").innerHTML = "<p>Пожалуйста, введите все коэффициенты.</p>";
        return;
    }

    // Пример ИИ анализа - простое сравнение коэффициентов
    const result = analyzeWinner({
        game5: [game5Player1, game5Player2],
        game6: [game6Player1, game6Player2],
    });

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
