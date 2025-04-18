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

    const result = analyzeCoefficients(games);
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

// Анализ коэффициентов с учётом динамики и устойчивости
function analyzeCoefficients(games) {
    let player1TotalCoeff = 0;
    let player2TotalCoeff = 0;
    let player1Stability = 0; // Устойчивость коэффициентов
    let player2Stability = 0;

    games.forEach(({ player1, player2, change }) => {
        player1TotalCoeff += player1;
        player2TotalCoeff += player2;

        // Устойчивость определяется по амплитуде изменения коэффициентов
        player1Stability += change;
        player2Stability += change;
    });

    // Сравнение коэффициентов и устойчивости
    const winner = player1TotalCoeff < player2TotalCoeff
        ? "Игрок 1"
        : "Игрок 2";

    return `
        Итоговый анализ:
        <br>Суммарный коэффициент Игрока 1: ${player1TotalCoeff.toFixed(2)}
        <br>Суммарный коэффициент Игрока 2: ${player2TotalCoeff.toFixed(2)}
        <br>Устойчивость Игрока 1: ${player1Stability.toFixed(2)}
        <br>Устойчивость Игрока 2: ${player2Stability.toFixed(2)}
        <br><strong>Вероятный победитель: ${winner}</strong>
    `;
}
