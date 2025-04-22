document.addEventListener("DOMContentLoaded", function() {
    const historyContent = document.getElementById("history-content");

    // Получаем историю из localStorage
    const history = JSON.parse(localStorage.getItem("analysisHistory")) || [];

    // Отображение истории
    function renderHistory() {
        historyContent.innerHTML = ""; // Очищаем содержимое перед обновлением
        if (history.length === 0) {
            historyContent.innerHTML = "<p>История пуста.</p>";
        } else {
            history.slice().reverse().forEach(entry => {
                const div = document.createElement("div");
                div.innerHTML = `
                    <strong>Анализ от ${entry.timestamp}</strong><br>
                    <p>${entry.analysisData || "Нет данных для анализа"}</p><br>
                `;
                historyContent.appendChild(div);
            });
        }
    }

    renderHistory();

    // Очистка истории
    document.getElementById("clear-history-btn").addEventListener("click", () => {
        localStorage.removeItem("analysisHistory");
        history.length = 0; // Очищаем текущий массив истории
        renderHistory();
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

    // Пример вызова функции сохранения
    document.getElementById("save-analysis-btn")?.addEventListener("click", () => {
        const resultElement = document.getElementById("result");
        const analysisData = resultElement ? resultElement.innerText.trim() : "Нет данных для анализа";

        if (analysisData && analysisData !== "Нет данных для анализа") {
            saveAnalysis(analysisData);
        } else {
            alert("Нет данных для сохранения анализа!");
        }
    });
});
