document.getElementById("analyze-btn").addEventListener("click", analyzeGame);
document.getElementById("clear-btn").addEventListener("click", clearInputs);

// Добавим слушатели ввода для всех полей коэффициентов
for (let i = 5; i <= 10; i++) {
    addInputFormatting(`game-${i}-player1`);
    addInputFormatting(`game-${i}-player2`);
}

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

function quickFill(gameId, player1, player2) {
    document.getElementById(`${gameId}-player1`).value = player1.toFixed(2);
    document.getElementById(`${gameId}-player2`).value = player2.toFixed(2);
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

// Функция для форматирования ввода в полях
function addInputFormatting(inputId) {
    const input = document.getElementById(inputId);
    input.addEventListener("input", () => {
        let value = input.value.replace(/[^0-9]/g, ""); // Убираем всё, кроме цифр
        if (value.length === 0) {
            input.value = ""; // Если ничего не введено, оставляем поле пустым
        } else if (value.length === 1) {
            input.value = value + "."; // Если введена одна цифра, добавляем точку
        } else if (value.length > 1) {
            input.value = value.slice(0, 1) + "." + value.slice(1, 3); // Ограничиваем до одной цифры перед точкой и двух после
        }
    });
}
