document.getElementById("analyze-btn").addEventListener("click", analyzeGame);
document.getElementById("clear-btn").addEventListener("click", clearInputs);

// Форматирование и переход между полями
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
            player2,
            changePlayer1: i > 5 ? Math.abs(player1 - games[games.length - 1].player1) : 0,
            changePlayer2: i > 5 ? Math.abs(player2 - games[games.length - 1].player2) : 0
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

// Анализ коэффициентов с фокусом на динамику и средние значения
function analyzeCoefficientsAI(games) {
    let player1TotalCoeff = 0;
    let player2TotalCoeff = 0;
    let player1Dynamic = []; // Динамика изменений Игрока 1
    let player2Dynamic = []; // Динамика изменений Игрока 2

    games.forEach(({ player1, player2, changePlayer1, changePlayer2 }, index) => {
        player1TotalCoeff += player1;
        player2TotalCoeff += player2;

        // Накапливаем изменения коэффициентов для анализа динамики
        if (index > 0) {
            player1Dynamic.push(changePlayer1);
            player2Dynamic.push(changePlayer2);
        }
    });

    // Итоговый "Скоринг" для прогнозирования
    const avgPlayer1Coeff = player1TotalCoeff / games.length;
    const avgPlayer2Coeff = player2TotalCoeff / games.length;

    const player1Score = (1 / avgPlayer1Coeff) - (player1Dynamic.reduce((sum, change) => sum + change, 0) * 0.3);
    const player2Score = (1 / avgPlayer2Coeff) - (player2Dynamic.reduce((sum, change) => sum + change, 0) * 0.3);

    // Прогнозирование победителя
    const winner = player1Score > player2Score ? "Игрок 1" : "Игрок 2";

    // Вывод результатов
    return `
        Итоговый анализ:
        <br>Средний коэффициент Игрока 1: ${avgPlayer1Coeff.toFixed(2)}
        <br>Средний коэффициент Игрока 2: ${avgPlayer2Coeff.toFixed(2)}
        <br>Динамика изменений Игрока 1: ${player1Dynamic.reduce((sum, change) => sum + change, 0).toFixed(2)}
        <br>Динамика изменений Игрока 2: ${player2Dynamic.reduce((sum, change) => sum + change, 0).toFixed(2)}
        <br><strong>Вероятный победитель: ${winner}</strong>
    `;
}
