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
                ${entry.resultHTML}<br><br>
            `;
            historyContent.appendChild(div);
        });
    }

    // Очистка истории
    document.getElementById("clear-history-btn").addEventListener("click", () => {
        localStorage.removeItem("analysisHistory");
        historyContent.innerHTML = "<p>История была очищена.</p>";
    });
});
