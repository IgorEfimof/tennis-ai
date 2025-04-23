document.addEventListener("DOMContentLoaded", function () {
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
                div.classList.add("history-entry"); // Добавлен класс для стилизации
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

    // Пример вызова функции сохранения
    document.getElementById("save-analysis-btn")?.addEventListener("click", () => {
        const resultElement = document.getElementById("result");

        if (!resultElement) {
            alert("Элемент с ID 'result' не найден на странице.");
            return;
        }

        const analysisData = resultElement.innerText.trim();

        if (analysisData && analysisData !== "Нет данных для анализа") {
            saveAnalysis(analysisData);
            alert("Анализ успешно сохранен!");
        } else {
            alert("Нет данных для сохранения анализа!");
        }
    });

    // Генерация данных анализа (пример)
    function generateAnalysis() {
        const resultElement = document.getElementById("result");
        if (resultElement) {
            resultElement.innerText = "Пример данных анализа: результат теста успешен.";
        }
    }

    // Вызов генерации данных для демонстрации
    generateAnalysis();
});
