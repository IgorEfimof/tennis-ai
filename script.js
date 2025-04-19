document.getElementById("analyze-btn").addEventListener("click", analyzeGame);
document.getElementById("clear-btn").addEventListener("click", clearInputs);

// Добавим форматирование и автоматический переход для всех полей ввода
const fields = [
    "game-5-player1", "game-5-player2",
    "game-6-player1", "game-6-player2",
    "game-7-player1", "game-7-player2",
    "game-8-player1", "game-8-player2",
    "game-9-player1", "game-9-player2",
    "game-10-player1", "game-10-player2"
];

fields.forEach((fieldId, index) => {
    const nextFieldId = fields[index + 1]; // Следующее поле
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
            player2,
            change: Math.abs(player1 - player2) // Разница коэффициентов для анализа устойчивости
        });
    }

    const result = analyzeCoefficientsAI(games);
    document.getElementById("result").innerHTML = `<p>${result}</p>`;
}

function clearInputs() {
    document.querySelectorAll("input").forEach(input => input.value = "");
    document.getElementById("result").innerHTML = "<p>Рекомендации будут здесь.</p>";
}

function addInputFormatting(inputId, nextInputId) {
    const input = document.getElementById(inputId);
    input.addEventListener("input", () => {
        let value = input.value.replace(/[^0-9]/g, ""); // Удаляем всё, кроме цифр
        if (value.length === 0) {
            input.value = ""; // Если поле пустое, ничего не делаем
        } else if (value.length === 1) {
            input.value = value + "."; // Если введена одна цифра, добавляем точку
        } else if (value.length > 1) {
            input.value = value.slice(0, 1) + "." + value.slice(1, 3); // Форматируем как X.XX
        }

        // Переходим к следующему полю, если длина ввода составляет 4 символа
        if (input.value.length === 4 && nextInputId) {
            const nextInput = document.getElementById(nextInputId);
            if (nextInput) {
                nextInput.focus();
            }
        }
    });
}

// Улучшенный анализ коэффициентов с ИИ
function analyzeCoefficientsAI(games) {
    let player1TotalCoeff = 0;
    let player2TotalCoeff = 0;
    let player1Stability = 0; // Устойчивость коэффициентов
    let player2Stability = 0;
    let player1Dynamic = 0; // Динамика изменений
    let player2Dynamic = 0;

    games.forEach(({ player1, player2, change }, index) => {
        player1TotalCoeff += player1;
        player2TotalCoeff += player2;

        // Устойчивость определяется по амплитуде изменения коэффициентов
        player1Stability += change;
        player2Stability += change;

        // Динамика: оцениваем изменение коэффициентов между играми
        if (index > 0) {
            const prevGame = games[index - 1];
            player1Dynamic += Math.abs(player1 - prevGame.player1);
            player2Dynamic += Math.abs(player2 - prevGame.player2);
        }
    });

    // Средние коэффициенты
    const avgPlayer1Coeff = player1TotalCoeff / games.length;
    const avgPlayer2Coeff = player2TotalCoeff / games.length;

    // Итоговый "Скоринг" для прогнозирования
    const player1Score = (1 / avgPlayer1Coeff) - (player1Stability * 0.5 + player1Dynamic * 0.3);
    const player2Score = (1 / avgPlayer2Coeff) - (player2Stability * 0.5 + player2Dynamic * 0.3);

    // Определяем победителя
    const winner = player1Score > player2Score ? "Игрок 1" : "Игрок 2";

    return `
        Итоговый анализ:
        <br>Средний коэффициент Игрока 1: ${avgPlayer1Coeff.toFixed(2)}
        <br>Средний коэффициент Игрока 2: ${avgPlayer2Coeff.toFixed(2)}
        <br>Устойчивость Игрока 1: ${player1Stability.toFixed(2)}
        <br>Устойчивость Игрока 2: ${player2Stability.toFixed(2)}
        <br>Динамика Игрока 1: ${player1Dynamic.toFixed(2)}
        <br>Динамика Игрока 2: ${player2Dynamic.toFixed(2)}
        <br><strong>Вероятный победитель: ${winner}</strong>
    `;
}
