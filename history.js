document.addEventListener("DOMContentLoaded", function () {
    const historyContent = document.getElementById("history-content");

    // Получаем историю из localStorage
    const history = JSON.parse(localStorage.getItem("analysisHistory")) || [];

    // Функция для извлечения признаков ставки
    function extractBetFeatures(bet) {
        const chosenPlayer = bet.chosenPlayer; // "player1" или "player2"
        const odds = bet[chosenPlayer + '_odds'];
        const fairOdds = bet[chosenPlayer + '_fairOdds'];
        const probability = bet[chosenPlayer + '_probability'];
        const expectedROI = bet[chosenPlayer + '_expectedROI'];

        return {
            chosen_player: chosenPlayer,
            chosen_odds: odds,
            expected_roi: expectedROI,
            value_margin: odds - fairOdds,
            is_favorite: odds < 2,
            probability: probability,
        };
    }

    // Функция для построения профилей успешных ставок
    function buildSuccessfulProfiles(history) {
        return history
            .filter(bet => bet.result === "win") // Только прошедшие
            .map(bet => extractBetFeatures(bet));
    }

    // Функция для предсказания новой ставки
    function predictNewBet(newBet, successfulProfiles) {
        const features = extractBetFeatures(newBet);

        for (const profile of successfulProfiles) {
            const oddsClose = Math.abs(features.chosen_odds - profile.chosen_odds) <= 0.1;
            const roiGood = features.expected_roi >= 5; // ROI минимум 5%
            const favoriteMatch = features.is_favorite === profile.is_favorite;

            if (oddsClose && roiGood && favoriteMatch) {
                return "✅ ИИ советует сделать ставку!";
            }
        }
        return "⚠️ ИИ советует пропустить ставку.";
    }

    // Отображение истории
    function renderHistory() {
        historyContent.innerHTML = ""; // Очищаем содержимое перед обновлением
        if (history.length === 0) {
            historyContent.innerHTML = "<p>История пуста.</p>";
        } else {
            history.slice().reverse().forEach(entry => {
                const div = document.createElement("div");
                div.classList.add("history-entry"); // Добавлен класс для стилизации
                div.innerHTML = `
                    <strong>Анализ от ${entry.timestamp}</strong><br>
                    ${entry.analysisData || "<p>Нет данных для анализа</p>"}<br>
                `;
                historyContent.appendChild(div);
            });
        }
    }

    renderHistory();

    // Очистка истории
    document.getElementById("clear-history-btn").addEventListener("click", () => {
        if (confirm("Вы уверены, что хотите очистить всю историю?")) {
            localStorage.removeItem("analysisHistory");
            history.length = 0; // Очищаем текущий массив истории
            renderHistory();
        }
    });

    // Функция для сохранения нового анализа
    function saveAnalysis(analysisData) {
        const newEntry = {
            timestamp: new Date().toLocaleString(),
            analysisData: analysisData
        };
        history.push(newEntry); // Добавляем запись в локальный массив
        localStorage.setItem("analysisHistory", JSON.stringify(history)); // Сохраняем в localStorage
        renderHistory(); // Обновляем отображение после сохранения
    }

    // Обновлённая логика: сохраняем последний анализ из localStorage
    document.getElementById("save-analysis-btn")?.addEventListener("click", () => {
        const analysisData = localStorage.getItem("lastAnalysis");

        if (analysisData && analysisData !== "Нет данных для анализа") {
            saveAnalysis(analysisData);
            alert("Анализ успешно сохранен!");
        } else {
            alert("Нет данных для сохранения анализа!");
        }
    });

    // Пример кнопки для анализа новой ставки
    const analyzeButton = document.createElement("button");
    analyzeButton.textContent = "Анализировать новую ставку";

    analyzeButton.onclick = () => {
        const successfulProfiles = buildSuccessfulProfiles(history); // Получаем профили успешных ставок

        const newBet = {
            chosenPlayer: "player2",
            player1_odds: 2.89,
            player2_odds: 1.52,
            player1_fairOdds: 2.90,
            player2_fairOdds: 1.42,
            player1_probability: 34.5,
            player2_probability: 70.2,
            player1_expectedROI: -0.43,
            player2_expectedROI: 6.71,
            result: null // Новая ставка
        };

        const advice = predictNewBet(newBet, successfulProfiles);
        alert(advice);
    };

    document.body.appendChild(analyzeButton);
});


