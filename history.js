document.addEventListener("DOMContentLoaded", function() {
    const historyContent = document.getElementById("history-content");

    // Получаем историю из localStorage
    const history = JSON.parse(localStorage.getItem("analysisHistory")) || [];

    // Отображение истории
    if (history.length === 0) {
        historyContent.innerHTML = "<p>История пуста.</p>";
    } else {
        history.reverse().forEach(entry => {
            const div = document.createElement("div");
            div.innerHTML = `
                <strong>Анализ от ${entry.timestamp}</strong><br>
                <p>${entry.analysisData || "Нет данных для анализа"}</p><br>
            `;
            historyContent.appendChild(div);
        });
    }

    // Очистка истории
    document.getElementById("clear-history-btn").addEventListener("click", () => {
        localStorage.removeItem("analysisHistory");
        historyContent.innerHTML = "<p>История была очищена.</p>";
    });

    // Функция для сохранения нового анализа
    function saveAnalysis(analysisData) {
        const newEntry = {
            timestamp: new Date().toLocaleString(),
            analysisData: analysisData
        };
        const currentHistory = JSON.parse(localStorage.getItem("analysisHistory")) || [];
        currentHistory.push(newEntry);
        localStorage.setItem("analysisHistory", JSON.stringify(currentHistory));
    }

    // Пример вызова функции сохранения
    document.getElementById("save-analysis-btn")?.addEventListener("click", () => {
        const resultElement = document.getElementById("result");
        const analysisData = resultElement ? resultElement.innerText : "Нет данных для анализа";

        saveAnalysis(analysisData);

        // Обновляем отображение истории после добавления нового анализа
        const div = document.createElement("div");
        div.innerHTML = `
            <strong>Анализ от ${new Date().toLocaleString()}</strong><br>
            <p>${analysisData}</p><br>
        `;
        historyContent.prepend(div); // Добавляем новый элемент в начало
    });
});
