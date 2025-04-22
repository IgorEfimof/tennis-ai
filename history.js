document.addEventListener("DOMContentLoaded", function() {
    const historyContent = document.getElementById("history-content");

    // Получаем историю из localStorage
    const history = JSON.parse(localStorage.getItem("analysisHistory")) || [];

    if (history.length === 0) {
        historyContent.innerHTML = "<p>История пуста.</p>";
    } else {
        history.reverse().forEach(entry => {
            const div = document.createElement("div");
            div.innerHTML = `
                <strong>Анализ от ${entry.timestamp}</strong><br>
                <p>${entry.resultHTML}</p><br>
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
    function saveAnalysis(resultHTML) {
        const newEntry = {
            timestamp: new Date().toLocaleString(),
            resultHTML: resultHTML
        };
        const currentHistory = JSON.parse(localStorage.getItem("analysisHistory")) || [];
        currentHistory.push(newEntry);
        localStorage.setItem("analysisHistory", JSON.stringify(currentHistory));
    }

    // Пример вызова функции сохранения
    document.getElementById("save-analysis-btn")?.addEventListener("click", () => {
        // Получаем текст анализа из элемента с ID "result"
        const resultElement = document.getElementById("result");
        const resultHTML = resultElement ? resultElement.innerHTML : "Нет данных для анализа";

        saveAnalysis(resultHTML);

        // Обновляем отображение истории после добавления нового анализа
        const div = document.createElement("div");
        div.innerHTML = `
            <strong>Анализ от ${new Date().toLocaleString()}</strong><br>
            <p>${resultHTML}</p><br>
        `;
        historyContent.prepend(div); // Добавляем новый элемент в начало
    });
});
